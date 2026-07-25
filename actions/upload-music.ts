'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

/**
 * Generate a Pre-Signed Upload URL for Direct Browser to Supabase Storage Upload (Bypasses Vercel 4.5MB limit 100%)
 */
export async function getMusicSignedUploadUrl(fileNameExt: string): Promise<{
  success: boolean;
  message?: string;
  signedUrl?: string;
  token?: string;
  path?: string;
  publicUrl?: string;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: 'You must be logged in to upload audio.' };
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://abgaxjwgsyrdwdibkist.supabase.co';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      return { success: false, message: 'SUPABASE_SERVICE_ROLE_KEY environment variable is missing.' };
    }

    const adminClient = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Auto-create 'avatars' bucket if it doesn't exist yet
    try {
      await adminClient.storage.createBucket('avatars', { public: true });
    } catch (e) {}

    const ext = fileNameExt.toLowerCase().split('.').pop() || 'mp3';
    const filePath = `music-${user.id}-${Date.now()}.${ext}`;

    const { data, error } = await adminClient.storage
      .from('avatars')
      .createSignedUploadUrl(filePath);

    if (error || !data) {
      return { success: false, message: error?.message || 'Failed to create signed upload URL.' };
    }

    const publicUrlData = adminClient.storage.from('avatars').getPublicUrl(filePath);

    return {
      success: true,
      signedUrl: data.signedUrl,
      token: data.token,
      path: filePath,
      publicUrl: publicUrlData.data.publicUrl,
    };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to generate upload URL.' };
  }
}

/**
 * Server Action Fallback for smaller audio files (< 4.5 MB)
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

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://abgaxjwgsyrdwdibkist.supabase.co';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    let storageClient: any = supabase.storage;

    if (serviceRoleKey) {
      const adminClient = createAdminClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      try {
        await adminClient.storage.createBucket('avatars', { public: true });
      } catch (e) {}
      storageClient = adminClient.storage;
    }

    const uploadBucket = 'avatars';
    const { data: uploadData, error: uploadError } = await storageClient
      .from(uploadBucket)
      .upload(fileName, buffer, {
        contentType: file.type || 'audio/mpeg',
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError || !uploadData) {
      return { success: false, message: uploadError?.message || 'Storage upload failed.' };
    }

    const { data: publicUrlData } = storageClient.from(uploadBucket).getPublicUrl(uploadData.path);
    const musicUrl = publicUrlData.publicUrl;
    const musicTitle = file.name.replace(/\.[^/.]+$/, '');

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
