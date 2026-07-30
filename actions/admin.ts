'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { AdminUserItem, BadgeItem } from '@/types';
import { sendDiscordAuditWebhook } from '@/lib/discord/webhook';

export async function getAllUsersForAdmin(): Promise<AdminUserItem[]> {
  try {
    const supabase = await createClient();
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !profiles || profiles.length === 0) {
      return [];
    }

    const usersWithBadges: AdminUserItem[] = await Promise.all(
      profiles.map(async (prof: any) => {
        const { data: userBadges } = await supabase
          .from('user_badges')
          .select('badge_id, badges(*)')
          .eq('profile_id', prof.id);

        const badges = userBadges ? userBadges.map((ub: any) => ub.badges).filter(Boolean) : [];

        return {
          ...prof,
          status: prof.status || 'active',
          status_reason: prof.status_reason || null,
          badges: (badges as BadgeItem[]) || [],
        };
      })
    );

    return usersWithBadges;
  } catch (err) {
    console.error('Error fetching admin user list:', err);
    return [];
  }
}

/**
 * ADMIN ONLY: Toggle user role between 'admin' and 'user' (Persisted via RPC & direct fallback)
 */
export async function toggleUserRole(profileId: string, currentRole: string): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, message: 'Unauthorized' };

    const newRole = currentRole === 'admin' ? 'user' : 'admin';

    // 1. Try Postgres RPC SECURITY DEFINER function to bypass RLS restrictions
    const { error: rpcErr } = await (supabase as any).rpc('update_user_role', {
      target_user_id: profileId,
      new_role: newRole,
    });

    if (rpcErr) {
      console.warn('RPC update_user_role failed, trying direct table update:', rpcErr.message);

      // 2. Direct Table Update with .select() verification
      const { error: updateErr, data: updatedRows } = await (supabase.from('profiles') as any)
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', profileId)
        .select();

      if (updateErr) {
        return { success: false, message: updateErr.message };
      }

      if (!updatedRows || updatedRows.length === 0) {
        return { 
          success: false, 
          message: 'Database RLS policy prevented updating user role. Please run the SQL migration script in Supabase.' 
        };
      }
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/admin');
    revalidatePath('/[username]');
    return { 
      success: true, 
      message: newRole === 'admin' ? 'User promoted to System Administrator! 👑' : 'Admin role revoked. User role set to standard.' 
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to toggle user role.';
    return { success: false, message: msg };
  }
}

/**
 * ADMIN ONLY: Permanently delete any user account & release their username
 */
export async function adminDeleteUserAccount(profileId: string): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, message: 'Unauthorized' };

    // Prevent admin from accidentally self-deleting through user management table
    if (user.id === profileId) {
      return { success: false, message: 'To delete your own account, use the Danger Zone in your personal Dashboard.' };
    }

    // Try Service Role Key if available
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (serviceRoleKey && supabaseUrl) {
      const adminClient = createAdminClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      await adminClient.auth.admin.deleteUser(profileId);
    }

    // Delete profile (CASCADE will delete links and user_badges, freeing username)
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', profileId);

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/admin');
    revalidatePath('/[username]');
    return { success: true, message: 'User account and username permanently deleted.' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete user account.';
    return { success: false, message: msg };
  }
}

async function setUserStatusInDatabase(profileId: string, status: string, reason: string | null): Promise<boolean> {
  const supabase = await createClient();
  
  // 1. Try Postgres RPC SECURITY DEFINER to bypass RLS
  const { error: rpcErr } = await (supabase as any).rpc('update_user_status', {
    target_user_id: profileId,
    new_status: status,
    new_reason: reason,
  });

  if (!rpcErr) return true;

  // 2. Direct Table Update Fallback
  const { error: updateErr } = await (supabase.from('profiles') as any)
    .update({ 
      status: status, 
      status_reason: reason, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', profileId);

  return !updateErr;
}

async function getTargetUsername(profileId: string): Promise<{ username: string; adminUsername?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data: targetProf } = await supabase.from('profiles').select('username').eq('id', profileId).maybeSingle();
    let adminUsername: string | undefined;
    if (user) {
      const { data: adminProf } = await supabase.from('profiles').select('username').eq('id', user.id).maybeSingle();
      adminUsername = (adminProf as any)?.username || user.email?.split('@')[0];
    }
    return {
      username: (targetProf as any)?.username || profileId.substring(0, 8),
      adminUsername,
    };
  } catch {
    return { username: profileId.substring(0, 8) };
  }
}

export async function warnUserWithReason(profileId: string, reason: string): Promise<{ success: boolean; message: string }> {
  try {
    const statusReason = reason.trim() || 'Terms of service violation';
    const success = await setUserStatusInDatabase(profileId, 'warned', statusReason);

    if (!success) {
      return { success: false, message: 'Failed to issue warning. Please check database RPC settings.' };
    }

    const { username: targetUser, adminUsername } = await getTargetUsername(profileId);
    await sendDiscordAuditWebhook({
      actionType: 'WARN',
      targetUsername: targetUser,
      adminUsername,
      reason: statusReason,
    }).catch((err) => console.error('Discord audit error:', err));

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/admin');
    revalidatePath('/[username]');
    return { success: true, message: 'Warning issued to user successfully! ⚠️' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to issue warning.';
    return { success: false, message: msg };
  }
}

export async function clearWarning(profileId: string): Promise<{ success: boolean; message: string }> {
  try {
    const success = await setUserStatusInDatabase(profileId, 'active', null);

    if (!success) {
      return { success: false, message: 'Failed to clear warning.' };
    }

    const { username: targetUser, adminUsername } = await getTargetUsername(profileId);
    await sendDiscordAuditWebhook({
      actionType: 'REINSTATE',
      targetUsername: targetUser,
      adminUsername,
      reason: 'Warning cleared by admin',
    }).catch((err) => console.error('Discord audit error:', err));

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/admin');
    revalidatePath('/[username]');
    return { success: true, message: 'User warning cleared successfully! Account restored.' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to clear warning.';
    return { success: false, message: msg };
  }
}

export async function banUserWithReason(profileId: string, reason: string): Promise<{ success: boolean; message: string }> {
  try {
    const statusReason = reason.trim() || 'Severe Terms of service violation';
    const success = await setUserStatusInDatabase(profileId, 'banned', statusReason);

    if (!success) {
      return { success: false, message: 'Failed to ban user account.' };
    }

    const { username: targetUser, adminUsername } = await getTargetUsername(profileId);
    await sendDiscordAuditWebhook({
      actionType: 'BAN',
      targetUsername: targetUser,
      adminUsername,
      reason: statusReason,
    }).catch((err) => console.error('Discord audit error:', err));

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/admin');
    revalidatePath('/[username]');
    return { success: true, message: 'User account suspended / banned successfully!' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to ban user.';
    return { success: false, message: msg };
  }
}

export async function unbanUser(profileId: string): Promise<{ success: boolean; message: string }> {
  try {
    const success = await setUserStatusInDatabase(profileId, 'active', null);

    if (!success) {
      return { success: false, message: 'Failed to unban user account.' };
    }

    const { username: targetUser, adminUsername } = await getTargetUsername(profileId);
    await sendDiscordAuditWebhook({
      actionType: 'REINSTATE',
      targetUsername: targetUser,
      adminUsername,
      reason: 'Account unbanned by admin',
    }).catch((err) => console.error('Discord audit error:', err));

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/admin');
    revalidatePath('/[username]');
    return { success: true, message: 'User account unbanned successfully! Account active.' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to unban user.';
    return { success: false, message: msg };
  }
}

export async function toggleVerifiedBadge(profileId: string, currentIsVerified: boolean): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();
    const verifiedBadgeId = 'b2222222-2222-2222-2222-222222222222';

    if (currentIsVerified) {
      // Revoke Verified Badge
      const { error } = await supabase
        .from('user_badges')
        .delete()
        .eq('profile_id', profileId)
        .eq('badge_id', verifiedBadgeId);

      if (error) return { success: false, message: error.message };
      
      revalidatePath('/dashboard');
      revalidatePath('/dashboard/admin');
      revalidatePath('/[username]');
      return { success: true, message: 'Verified Creator status removed.' };
    } else {
      // Ensure system "Verified Creator" badge row exists in badges table so FK constraint never fails
      const { data: existingBadge } = await supabase
        .from('badges')
        .select('id')
        .eq('id', verifiedBadgeId)
        .maybeSingle();

      if (!existingBadge) {
        await (supabase.from('badges') as any).upsert({
          id: verifiedBadgeId,
          name: 'Verified Creator',
          description: 'Verified authentic creator badge',
          icon: 'CheckCircle2',
          color: '#3B82F6',
          bg_color: '#3B82F6',
          is_event: false,
          is_active: true,
        });
      }

      // Grant Verified Badge to user
      const { error } = await (supabase.from('user_badges') as any).insert({
        profile_id: profileId,
        badge_id: verifiedBadgeId,
      });

      if (error && error.code !== '23505') return { success: false, message: error.message };

      const { username: targetUser, adminUsername } = await getTargetUsername(profileId);
      await sendDiscordAuditWebhook({
        actionType: 'BADGE_GRANT',
        targetUsername: targetUser,
        adminUsername,
        badgeName: 'Verified Creator',
      }).catch((err) => console.error('Discord audit error:', err));

      revalidatePath('/dashboard');
      revalidatePath('/dashboard/admin');
      revalidatePath('/[username]');
      return { success: true, message: 'Verified Creator status granted! ✨' };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to toggle verification.';
    return { success: false, message: msg };
  }
}

export async function grantBadgeToUser(profileId: string, badgeId: string): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();
    const { error } = await (supabase.from('user_badges') as any).insert({
      profile_id: profileId,
      badge_id: badgeId,
    });

    if (error) {
      if (error.code === '23505') {
        return { success: true, message: 'User already has this badge assigned.' };
      }
      return { success: false, message: error.message };
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/admin');
    revalidatePath('/[username]');
    return { success: true, message: 'Badge granted to user successfully! 🏅' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to grant badge.';
    return { success: false, message: msg };
  }
}

export async function revokeBadgeFromUser(profileId: string, badgeId: string): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('user_badges')
      .delete()
      .eq('profile_id', profileId)
      .eq('badge_id', badgeId);

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/admin');
    revalidatePath('/[username]');
    return { success: true, message: 'Badge revoked from user successfully.' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to revoke badge.';
    return { success: false, message: msg };
  }
}
