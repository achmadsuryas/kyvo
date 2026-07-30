'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { sendDiscordMilestoneWebhook } from '@/lib/discord/webhook';

const MILESTONES = [10, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000];

/**
 * Increment public profile views count for a creator
 */
export async function recordProfileView(profileId: string): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient();

    // 1. Fetch current profile views and user details
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, display_name, views_count')
      .eq('id', profileId)
      .maybeSingle();

    const currentViews = (profile as any)?.views_count || 0;
    const newViews = currentViews + 1;

    // 2. Try calling SECURITY DEFINER RPC function (Bypasses RLS for public visitors)
    const { error: rpcError } = await (supabase as any).rpc('increment_profile_views', {
      target_profile_id: profileId,
    });

    if (rpcError) {
      // Fallback direct update if RPC function hasn't been created yet
      await (supabase.from('profiles') as any)
        .update({ views_count: newViews })
        .eq('id', profileId);
    }

    // Check if new view count triggers a milestone notification
    if (MILESTONES.includes(newViews) && profile) {
      sendDiscordMilestoneWebhook({
        username: (profile as any).username || 'creator',
        displayName: (profile as any).display_name,
        viewsCount: newViews,
      }).catch((err) => console.error('Discord milestone error:', err));
    }

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
