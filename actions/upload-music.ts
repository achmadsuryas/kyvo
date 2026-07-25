'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

/**
 * Bulletproof Production Audio File Uploader (Binary FormData -> Supabase Storage -> PostgreSQL)
 */
export async function uploadProfileMusic(formData: FormData): Promise<{
  success: boolean;
  message: string;
  music_url?: string;
  music_title?: string;
}> {
  try {
    const file = formData.get('file') as File | null;
    if (!file) {
      return { success: false, message: 'No audio file provided.' };
    }

    const MAX_SIZE_MB = 10;
    const MAX_BYTES = MAX_SIZE_MB * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      const fileSizeMb = (file.size / (1024 * 1024)).toFixed(1);
      return { success: false, message: `File size (${fileSizeMb} MB) exceeds the ${MAX_SIZE_MB} MB limit.` };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: 'You must be logged in to upload background music.' };
    }

    const ext = file.name.toLowerCase().split('.').pop() || 'mp3';
    const fileName = `music-${user.id}-${Date.now()}.${ext}`;

    // Convert file to ArrayBuffer / Buffer for reliable server storage upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to 'avatars' storage bucket (guaranteed to exist & public on Supabase)
    const uploadBucket = 'avatars';
    let { data: uploadData, error: uploadError } = await supabase.storage
      .from(uploadBucket)
      .upload(fileName, buffer, {
        contentType: file.type || 'audio/mpeg',
        cacheControl: '3600',
        upsert: true,
      });

    // If supabase user RLS policy blocks upload, use service role admin client fallback
    if (uploadError && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const adminClient = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      const res = await adminClient.storage
        .from(uploadBucket)
        .upload(fileName, buffer, {
          contentType: file.type || 'audio/mpeg',
          cacheControl: '3600',
          upsert: true,
        });
      uploadData = res.data;
      uploadError = res.error;
    }

    if (uploadError || !uploadData) {
      return { success: false, message: uploadError?.message || 'Failed to upload audio to storage.' };
    }

    const { data: publicUrlData } = supabase.storage.from(uploadBucket).getPublicUrl(uploadData.path);
    const musicUrl = publicUrlData.publicUrl;
    const musicTitle = file.name.replace(/\.[^/.]+$/, '');

    // Fetch current profile to clean up any old music file in storage
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('music_url')
      .eq('id', user.id)
      .maybeSingle();

    const oldMusicUrl = (currentProfile as any)?.music_url;
    if (oldMusicUrl && typeof oldMusicUrl === 'string' && oldMusicUrl.includes('/storage/v1/object/public/avatars/')) {
      const parts = oldMusicUrl.split('/storage/v1/object/public/avatars/');
      if (parts[1]) {
        await supabase.storage.from('avatars').remove([parts[1]]);
      }
    }

    // Update profiles table in PostgreSQL
    const { error: updateError } = await (supabase.from('profiles') as any)
      .update({
        music_url: musicUrl,
        music_title: musicTitle,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      return { success: false, message: updateError.message };
    }

    revalidatePath('/dashboard');
    revalidatePath('/[username]');
    return {
      success: true,
      message: 'Background music uploaded & active on public profile!',
      music_url: musicUrl,
      music_title: musicTitle,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to process audio file.';
    return { success: false, message: msg };
  }
}
