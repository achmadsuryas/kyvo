'use server';

import { createClient } from '@/lib/supabase/server';
import { BadgeItem, UserBadgeItem } from '@/types';
import { revalidatePath } from 'next/cache';

export async function getAllBadges(): Promise<BadgeItem[]> {
  try {
    const supabase = await createClient();
    const { data: badges } = await supabase
      .from('badges')
      .select('*')
      .order('created_at', { ascending: true });

    return (badges as BadgeItem[]) || [];
  } catch (err) {
    console.error('Error fetching badges:', err);
    return [];
  }
}

export async function claimEventBadge(badgeId: string): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: 'You must be logged in to claim badges.' };
    }

    // Check if user already claimed this badge
    const { data: existing } = await supabase
      .from('user_badges')
      .select('id')
      .eq('profile_id', user.id)
      .eq('badge_id', badgeId)
      .maybeSingle();

    if (existing) {
      return { success: false, message: 'You have already claimed this badge!' };
    }

    // Insert user badge
    const { error } = await (supabase.from('user_badges') as any).insert({
      profile_id: user.id,
      badge_id: badgeId,
      is_displayed: true,
      granted_at: new Date().toISOString(),
    });

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath('/dashboard');
    revalidatePath('/[username]');
    return { success: true, message: 'Event Badge claimed & equipped to your public profile! 🚀' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to claim badge.';
    return { success: false, message: msg };
  }
}

export async function getUserBadgeItemsWithStatus(profileId: string): Promise<UserBadgeItem[]> {
  try {
    const supabase = await createClient();
    const { data: userBadges } = await supabase
      .from('user_badges')
      .select('*, badges(*)')
      .eq('profile_id', profileId);

    if (!userBadges || userBadges.length === 0) {
      return [];
    }

    return userBadges
      .filter((ub: any) => ub.badges !== null)
      .map((ub: any) => ({
        id: ub.id,
        user_id: ub.user_id || ub.profile_id,
        badge_id: ub.badge_id,
        is_displayed: ub.is_displayed !== false,
        created_at: ub.granted_at || ub.created_at || new Date().toISOString(),
        badge: ub.badges,
      })) as UserBadgeItem[];
  } catch (err) {
    console.error('Error fetching user badge items with status:', err);
    return [];
  }
}

export async function toggleBadgeDisplayStatus(userBadgeId: string, currentIsDisplayed: boolean): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: 'You must be logged in.' };
    }

    const newStatus = !currentIsDisplayed;

    const { error } = await (supabase.from('user_badges') as any)
      .update({ is_displayed: newStatus })
      .eq('id', userBadgeId)
      .eq('profile_id', user.id);

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath('/dashboard');
    revalidatePath('/[username]');
    return { 
      success: true, 
      message: newStatus ? 'Badge equipped on your public profile!' : 'Badge unequipped & hidden from public profile.' 
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to toggle badge status.';
    return { success: false, message: msg };
  }
}

/**
 * ADMIN ONLY: Create or edit a Badge item (supports single object or (id, data) signature)
 */
export async function adminSaveBadge(badgeDataOrId: any, maybeData?: any): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, message: 'Unauthorized' };

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if ((profile as any)?.role !== 'admin') {
      return { success: false, message: 'Admin permissions required.' };
    }

    const badgeData = typeof badgeDataOrId === 'string' ? { ...maybeData, id: badgeDataOrId } : badgeDataOrId;

    const targetId = badgeData?.id;
    const name = badgeData?.name || badgeData?.title || 'Event Badge';
    const description = badgeData?.description || '';
    const icon = badgeData?.icon || 'Sparkles';
    const bg_color = badgeData?.bg_color || badgeData?.bgColor || '#FFD43B';
    const color = badgeData?.color || (bg_color === '#3B82F6' || bg_color === '#FF4D6D' || bg_color === '#A855F7' ? '#FFFFFF' : '#111111');
    const is_event = badgeData?.is_event !== undefined ? badgeData.is_event : (badgeData?.isEvent !== undefined ? badgeData.isEvent : true);

    const payload = {
      name: name.trim(),
      description: description.trim(),
      icon,
      color,
      bg_color,
      is_event,
      event_end_time: badgeData?.event_end_time || null,
      event_custom_title: badgeData?.event_custom_title?.trim() || null,
      event_custom_description: badgeData?.event_custom_description?.trim() || null,
      created_at: new Date().toISOString(),
    };

    if (targetId) {
      // Update existing badge
      const { error } = await (supabase.from('badges') as any)
        .update(payload)
        .eq('id', targetId);

      if (error) return { success: false, message: error.message };
    } else {
      // Insert new badge
      const { error } = await (supabase.from('badges') as any)
        .insert(payload);

      if (error) return { success: false, message: error.message };
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/admin');
    revalidatePath('/[username]');
    return { success: true, message: targetId ? 'Badge updated successfully!' : 'New Badge created successfully!' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save badge.';
    return { success: false, message: msg };
  }
}

/**
 * ADMIN ONLY: Delete a Badge item
 */
export async function adminDeleteBadge(badgeId: string): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, message: 'Unauthorized' };

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if ((profile as any)?.role !== 'admin') {
      return { success: false, message: 'Admin permissions required.' };
    }

    const { error } = await supabase
      .from('badges')
      .delete()
      .eq('id', badgeId);

    if (error) return { success: false, message: error.message };

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/admin');
    revalidatePath('/[username]');
    return { success: true, message: 'Badge deleted successfully!' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete badge.';
    return { success: false, message: msg };
  }
}

/**
 * ADMIN ONLY: Grant a badge to a specific user
 */
export async function adminGrantUserBadge(userId: string, badgeId: string): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, message: 'Unauthorized' };

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if ((profile as any)?.role !== 'admin') {
      return { success: false, message: 'Admin permissions required.' };
    }

    // Insert user badge
    const { error } = await (supabase.from('user_badges') as any).insert({
      profile_id: userId,
      badge_id: badgeId,
      is_displayed: true,
      granted_at: new Date().toISOString(),
    });

    if (error) return { success: false, message: error.message };

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/admin');
    revalidatePath('/[username]');
    return { success: true, message: 'Badge granted to user successfully!' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to grant badge.';
    return { success: false, message: msg };
  }
}

/**
 * ADMIN ONLY: Revoke/Remove a badge from a user
 */
export async function adminRevokeUserBadge(userBadgeId: string): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, message: 'Unauthorized' };

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if ((profile as any)?.role !== 'admin') {
      return { success: false, message: 'Admin permissions required.' };
    }

    const { error } = await supabase
      .from('user_badges')
      .delete()
      .eq('id', userBadgeId);

    if (error) return { success: false, message: error.message };

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/admin');
    revalidatePath('/[username]');
    return { success: true, message: 'User badge revoked successfully!' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to revoke badge.';
    return { success: false, message: msg };
  }
}

// Backward Compatibility Aliases for Admin Badge Management Component
export const createAdminBadge = adminSaveBadge;
export const updateAdminBadge = adminSaveBadge;
export const deleteAdminBadge = adminDeleteBadge;
export const toggleBadgeActiveStatus = toggleBadgeDisplayStatus;
