import { createClient } from '@/lib/supabase/server';
import { Profile, LinkItem, UserProfileWithLinks, BadgeItem } from '@/types';

export async function getProfileByUsername(username: string): Promise<UserProfileWithLinks | null> {
  const clean = username.toLowerCase();

  try {
    const supabase = await createClient();
    
    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', clean)
      .single();

    const profile = data as Profile | null;

    if (profileError || !profile) {
      return null;
    }

    const { data: linksData } = await supabase
      .from('links')
      .select('*')
      .eq('profile_id', profile.id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    const { data: userBadges } = await supabase
      .from('user_badges')
      .select('badge_id, is_displayed, badges(*)')
      .eq('profile_id', profile.id);

    const links = (linksData as LinkItem[] | null) || [];
    
    // Only include badges that are explicitly equipped (is_displayed !== false)
    const equippedBadges = userBadges 
      ? userBadges
          .filter((ub: any) => ub.is_displayed !== false)
          .map((ub: any) => ub.badges)
          .filter(Boolean) 
      : [];

    return {
      ...profile,
      links,
      badges: (equippedBadges as BadgeItem[]) || [],
    };
  } catch (err) {
    console.error('Error fetching profile by username:', err);
    return null;
  }
}

export async function getCurrentUserProfile(): Promise<Profile | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    const profile = data as Profile | null;

    if (profile) return profile;

    // Fallback profile for newly authenticated users prior to onboarding
    return {
      id: user.id,
      username: `user_${user.id.substring(0, 6)}`,
      display_name: user.user_metadata?.full_name || user.user_metadata?.name || 'Kyvo User',
      email: user.email || '',
      bio: 'Welcome to my Kyvo page!',
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
      theme: 'neobrutalism',
      role: 'user',
      status: 'active',
      is_onboarded: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  } catch (err) {
    console.error('Error fetching current user profile:', err);
    return null;
  }
}
