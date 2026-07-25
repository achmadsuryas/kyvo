import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

// Configure route to accept large audio file payloads up to 10 MB
export const maxDuration = 60; // 60 seconds timeout
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No audio file provided.' }, { status: 400 });
    }

    const MAX_SIZE_MB = 10;
    const MAX_BYTES = MAX_SIZE_MB * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      const fileSizeMb = (file.size / (1024 * 1024)).toFixed(1);
      return NextResponse.json({
        success: false,
        message: `File size (${fileSizeMb} MB) exceeds the ${MAX_SIZE_MB} MB limit.`
      }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, message: 'You must be logged in to upload background music.' }, { status: 401 });
    }

    const ext = file.name.toLowerCase().split('.').pop() || 'mp3';
    const fileName = `${user.id}-${Date.now()}.${ext}`;

    // Convert file to ArrayBuffer / Buffer for server storage upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Initialize Admin Supabase Client using Service Role Key or standard Server Client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://abgaxjwgsyrdwdibkist.supabase.co';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    let storageClient: any = supabase.storage;

    if (serviceRoleKey) {
      const adminClient = createAdminClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      
      // Auto-Create 'music' storage bucket if it doesn't exist yet on Supabase!
      try {
        await adminClient.storage.createBucket('music', {
          public: true,
          fileSizeLimit: 10485760, // 10 MB limit
        });
      } catch (errBucket) {}

      storageClient = adminClient.storage;
    }

    let uploadBucket = 'music';
    let { data: uploadData, error: uploadError } = await storageClient
      .from(uploadBucket)
      .upload(fileName, buffer, {
        contentType: file.type || 'audio/mpeg',
        cacheControl: '3600',
        upsert: true,
      });

    // Fallback attempt to 'avatars' bucket if 'music' bucket had an issue
    if (uploadError) {
      uploadBucket = 'avatars';
      if (serviceRoleKey) {
        try {
          const adminClient = createAdminClient(supabaseUrl, serviceRoleKey);
          await adminClient.storage.createBucket('avatars', { public: true });
          storageClient = adminClient.storage;
        } catch (e) {}
      }

      const res = await storageClient
        .from(uploadBucket)
        .upload(`music-${fileName}`, buffer, {
          contentType: file.type || 'audio/mpeg',
          cacheControl: '3600',
          upsert: true,
        });
      uploadData = res.data;
      uploadError = res.error;
    }

    let musicUrl = '';

    if (!uploadError && uploadData) {
      const { data: publicUrlData } = storageClient.from(uploadBucket).getPublicUrl(uploadData.path);
      musicUrl = publicUrlData.publicUrl;
    } else {
      // Ultimate Fallback: Convert to Data URL if storage bucket cannot be written
      const base64Str = buffer.toString('base64');
      const mimeType = file.type || (ext === 'wav' ? 'audio/wav' : 'audio/mp3');
      musicUrl = `data:${mimeType};base64,${base64Str}`;
    }

    const musicTitle = file.name.replace(/\.[^/.]+$/, '');

    // Fetch current profile to clean up any old music file in storage
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('music_url')
      .eq('id', user.id)
      .maybeSingle();

    const oldMusicUrl = (currentProfile as any)?.music_url;
    if (oldMusicUrl && typeof oldMusicUrl === 'string' && oldMusicUrl.includes('/storage/v1/object/public/')) {
      const bucketName = oldMusicUrl.includes('/music/') ? 'music' : 'avatars';
      const parts = oldMusicUrl.split(`/storage/v1/object/public/${bucketName}/`);
      if (parts[1]) {
        await storageClient.from(bucketName).remove([parts[1]]);
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
      return NextResponse.json({ success: false, message: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Background music uploaded & active on public profile!',
      music_url: musicUrl,
      music_title: musicTitle,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to process audio file.';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
