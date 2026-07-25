'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Increment public profile views count for a creator
 */
export async function recordProfileView(profileId: string): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient();

    // 1. Try calling SECURITY DEFINER RPC function (Bypasses RLS for public visitors)
    const { error: rpcError } = await (supabase as any).rpc('increment_profile_views', {
      target_profile_id: profileId,
    });

    if (!rpcError) {
      revalidatePath('/dashboard');
      return { success: true };
    }

    // 2. Fallback direct update if RPC function hasn't been created yet
    const { data: profile } = await supabase
      .from('profiles')
      .select('views_count')
      .eq('id', profileId)
      .single();

    const currentViews = (profile as any)?.views_count || 0;
    const newViews = currentViews + 1;

    await (supabase.from('profiles') as any)
      .update({ views_count: newViews })
      .eq('id', profileId);

    revalidatePath('/dashboard');
    return { success: true };
  } catch (err) {
    console.error('Error recording profile view:', err);
    return { success: false };
  }
}

/**
 * Increment click count for a specific link
 */
export async function recordLinkClick(linkId: string): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient();

    // 1. Try calling SECURITY DEFINER RPC function (Bypasses RLS for public visitors)
    const { error: rpcError } = await (supabase as any).rpc('increment_link_clicks', {
      target_link_id: linkId,
    });

    if (!rpcError) {
      revalidatePath('/dashboard');
      return { success: true };
    }

    // 2. Fallback direct update if RPC function hasn't been created yet
    const { data: link } = await supabase
      .from('links')
      .select('clicks_count')
      .eq('id', linkId)
      .single();

    const currentClicks = (link as any)?.clicks_count || 0;
    const newClicks = currentClicks + 1;

    await (supabase.from('links') as any)
      .update({ clicks_count: newClicks })
      .eq('id', linkId);

    revalidatePath('/dashboard');
    return { success: true };
  } catch (err) {
    console.error('Error recording link click:', err);
    return { success: false };
  }
}
