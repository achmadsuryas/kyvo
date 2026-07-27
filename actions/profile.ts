'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export async function updateUserUsername(newUsername: string): Promise<{ success: boolean; message: string }> {
  const cleanUsername = newUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

  if (!cleanUsername || cleanUsername.length < 2) {
    return { success: false, message: 'Username must be at least 2 characters long.' };
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: 'You must be logged in.' };
    }

    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', cleanUsername)
      .neq('id', user.id)
      .maybeSingle();

    if (existing) {
      return { success: false, message: 'Username is already taken by another creator.' };
    }

    const { error } = await (supabase.from('profiles') as any)
      .update({ username: cleanUsername, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath('/dashboard');
    revalidatePath('/[username]');
    return { success: true, message: `Username updated to @${cleanUsername}!` };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update username.';
    return { success: false, message: msg };
  }
}

export async function checkUsernameAvailable(username: string): Promise<{ available: boolean; message: string }> {
  const clean = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  if (!clean || clean.length < 2) {
    return { available: false, message: 'Username must be at least 2 characters.' };
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', clean)
      .maybeSingle();

    if (data && (!user || (data as any).id !== user.id)) {
      return { available: false, message: `Username @${clean} is already claimed.` };
    }

    return { available: true, message: `Username @${clean} is available!` };
  } catch (err) {
    return { available: true, message: 'Available' };
  }
}

export async function updateUserProfileDetails(details: {
  display_name: string;
  bio: string;
  avatar_url?: string | null;
  music_url?: string | null;
  music_title?: string | null;
  theme?: string | null;
  theme_bg_color?: string | null;
}): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: 'You must be logged in to update profile.' };
    }

    const updatePayload: any = {
      display_name: details.display_name.trim(),
      bio: details.bio.trim(),
      updated_at: new Date().toISOString(),
    };

    if (details.theme !== undefined) {
      updatePayload.theme = details.theme;
    }

    if (details.theme_bg_color !== undefined) {
      updatePayload.theme_bg_color = details.theme_bg_color;
    }

    // Fetch current profile to check for old avatar/music files in storage
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('avatar_url, music_url')
      .eq('id', user.id)
      .maybeSingle();

    const oldAvatarUrl = (currentProfile as any)?.avatar_url;
    const oldMusicUrl = (currentProfile as any)?.music_url;

    // Handle avatar URL change/deletion & storage cleanup
    if (details.avatar_url !== undefined && details.avatar_url !== oldAvatarUrl) {
      updatePayload.avatar_url = details.avatar_url;

      if (oldAvatarUrl && typeof oldAvatarUrl === 'string' && oldAvatarUrl.includes('/storage/v1/object/public/avatars/')) {
        const parts = oldAvatarUrl.split('/storage/v1/object/public/avatars/');
        if (parts[1]) {
          await supabase.storage.from('avatars').remove([parts[1]]);
        }
      }
    }

    // Handle music URL change/deletion & storage cleanup
    if (details.music_url !== undefined && details.music_url !== oldMusicUrl) {
      updatePayload.music_url = details.music_url;
      updatePayload.music_title = details.music_title || null;

      if (oldMusicUrl && typeof oldMusicUrl === 'string' && oldMusicUrl.includes('/storage/v1/object/public/music/')) {
        const parts = oldMusicUrl.split('/storage/v1/object/public/music/');
        if (parts[1]) {
          await supabase.storage.from('music').remove([parts[1]]);
        }
      }
    } else if (details.music_title !== undefined) {
      updatePayload.music_title = details.music_title;
    }

    const { error } = await (supabase.from('profiles') as any)
      .update(updatePayload)
      .eq('id', user.id);

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath('/dashboard');
    revalidatePath('/[username]');
    return { 
      success: true, 
      message: 'Profile details updated successfully!' 
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update profile details.';
    return { success: false, message: msg };
  }
}

/**
 * Delete Profile Background Music & Clean Storage
 */
export async function deleteProfileMusic(): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: 'You must be logged in.' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('music_url')
      .eq('id', user.id)
      .maybeSingle();

    const oldMusicUrl = (profile as any)?.music_url;

    if (oldMusicUrl && typeof oldMusicUrl === 'string' && oldMusicUrl.includes('/storage/v1/object/public/music/')) {
      const parts = oldMusicUrl.split('/storage/v1/object/public/music/');
      if (parts[1]) {
        await supabase.storage.from('music').remove([parts[1]]);
      }
    }

    const { error } = await (supabase.from('profiles') as any)
      .update({
        music_url: null,
        music_title: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath('/dashboard');
    revalidatePath('/[username]');
    return { success: true, message: 'Profile background music removed!' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete profile music.';
    return { success: false, message: msg };
  }
}

/**
 * Directly Delete Profile Picture & Clean Storage File
 */
export async function deleteProfilePicture(): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: 'You must be logged in.' };
    }

    // 1. Fetch current profile to check if there is an avatar file in storage
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .maybeSingle();

    const oldAvatarUrl = (profile as any)?.avatar_url;

    // 2. If old avatar was in storage bucket 'avatars', delete object file from storage
    if (oldAvatarUrl && typeof oldAvatarUrl === 'string' && oldAvatarUrl.includes('/storage/v1/object/public/avatars/')) {
      const parts = oldAvatarUrl.split('/storage/v1/object/public/avatars/');
      if (parts[1]) {
        await supabase.storage.from('avatars').remove([parts[1]]);
      }
    }

    // 3. Update database profiles table set avatar_url = NULL
    const { error } = await (supabase.from('profiles') as any)
      .update({
        avatar_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath('/dashboard');
    revalidatePath('/[username]');
    return { success: true, message: 'Profile picture removed!' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete profile picture.';
    return { success: false, message: msg };
  }
}

/**
 * Complete First-Time Onboarding Username Setup (With Schema Cache Fallback)
 */
export async function completeOnboarding(data: {
  username: string;
  display_name: string;
}): Promise<{ success: boolean; message: string }> {
  const cleanUsername = data.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

  if (!cleanUsername || cleanUsername.length < 2) {
    return { success: false, message: 'Username must be at least 2 characters long.' };
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: 'You must be logged in.' };
    }

    // Ensure username is not taken by someone else
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', cleanUsername)
      .neq('id', user.id)
      .maybeSingle();

    if (existing) {
      return { success: false, message: `Username @${cleanUsername} is already taken. Please pick another!` };
    }

    const updatePayload: any = {
      username: cleanUsername,
      display_name: data.display_name.trim() || cleanUsername,
      is_onboarded: true,
      updated_at: new Date().toISOString(),
    };

    const { error } = await (supabase.from('profiles') as any)
      .update(updatePayload)
      .eq('id', user.id);

    if (error) {
      // If DB doesn't have is_onboarded column yet, retry without is_onboarded
      if (error.message.includes('is_onboarded')) {
        delete updatePayload.is_onboarded;
        const { error: retryErr } = await (supabase.from('profiles') as any)
          .update(updatePayload)
          .eq('id', user.id);

        if (retryErr) return { success: false, message: retryErr.message };
      } else {
        return { success: false, message: error.message };
      }
    }

    revalidatePath('/dashboard');
    revalidatePath('/[username]');
    return { success: true, message: `Welcome aboard! Your Kyvo page is live at kyvo.fun/${cleanUsername}` };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to set username.';
    return { success: false, message: msg };
  }
}

/**
 * Permanently delete logged-in user account FROM Supabase Auth AND Database (Frees username 100%)
 */
export async function deleteOwnAccount(): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: 'You must be logged in to delete your account.' };
    }

    const userId = user.id;

    // 1. Try Postgres RPC SECURITY DEFINER function to delete from auth.users (Cascades to profiles, links, user_badges)
    const { error: rpcErr } = await (supabase as any).rpc('delete_current_user_account');

    if (!rpcErr) {
      await supabase.auth.signOut();
      revalidatePath('/');
      return { success: true, message: 'Your account and username have been permanently deleted.' };
    }

    // 2. Try Admin Service Role API if available
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (serviceRoleKey && supabaseUrl) {
      const adminClient = createAdminClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      await adminClient.auth.admin.deleteUser(userId);
    } else {
      // 3. Fallback direct delete from public.profiles
      await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
    }

    await supabase.auth.signOut();
    revalidatePath('/');
    return { success: true, message: 'Your account and username have been permanently deleted.' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete account.';
    return { success: false, message: msg };
  }
}
