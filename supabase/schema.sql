-- ==========================================
-- KYVO ANALYTICS & DATABASE MIGRATION SCRIPT
-- ==========================================

-- 1. Ensure views_count column exists on profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

-- 2. Ensure is_onboarded column exists on profiles table with DEFAULT FALSE
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ALTER COLUMN is_onboarded SET DEFAULT FALSE;

-- 3. Ensure music_url and music_title columns exist on profiles table for background music
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS music_url TEXT DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS music_title TEXT DEFAULT NULL;

-- 4. Ensure clicks_count column exists on links table
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS clicks_count INTEGER DEFAULT 0;

-- 5. Create SECURITY DEFINER RPC function to increment profile views (bypasses RLS safely for visitors)
CREATE OR REPLACE FUNCTION public.increment_profile_views(target_profile_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = target_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create SECURITY DEFINER RPC function to increment link clicks (bypasses RLS safely for visitors)
CREATE OR REPLACE FUNCTION public.increment_link_clicks(target_link_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.links
  SET clicks_count = COALESCE(clicks_count, 0) + 1
  WHERE id = target_link_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant execute permissions on RPC functions to public (anon & authenticated roles)
GRANT EXECUTE ON FUNCTION public.increment_profile_views(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.increment_link_clicks(UUID) TO anon, authenticated, service_role;

-- ====================================================
-- AUTOMATIC ACCOUNT DELETION & USERNAME CLEANUP SCHEMA
-- ====================================================

-- 8. Ensure FK from public.profiles to auth.users uses ON DELETE CASCADE
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_id_fkey,
  ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 9. Ensure FK from public.links to public.profiles uses ON DELETE CASCADE
ALTER TABLE public.links
  DROP CONSTRAINT IF EXISTS links_profile_id_fkey,
  ADD CONSTRAINT links_profile_id_fkey
  FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 10. Ensure FK from public.user_badges to public.profiles uses ON DELETE CASCADE
ALTER TABLE public.user_badges
  DROP CONSTRAINT IF EXISTS user_badges_profile_id_fkey,
  ADD CONSTRAINT user_badges_profile_id_fkey
  FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 11. Trigger Function to automatically delete profile & release username when user is deleted from auth.users
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS trigger AS $$
BEGIN
  DELETE FROM public.profiles WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_delete();

-- 13. SECURITY DEFINER RPC function to allow authenticated users to delete THEIR OWN account from auth.users permanently
CREATE OR REPLACE FUNCTION public.delete_current_user_account()
RETURNS void AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete from auth.users directly (This automatically cascades to profiles, links, user_badges and frees username)
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_current_user_account() TO authenticated;

-- 14. SECURITY DEFINER RPC function to update user role to admin or user
CREATE OR REPLACE FUNCTION public.update_user_role(target_user_id UUID, new_role TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET role = new_role, updated_at = NOW()
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.update_user_role(UUID, TEXT) TO authenticated, service_role;
