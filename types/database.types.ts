export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = any;

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  email: string | null;
  bio: string | null;
  avatar_url: string | null;
  music_url?: string | null;
  music_title?: string | null;
  theme: string | null;
  role: 'user' | 'admin' | string | null;
  status: 'active' | 'warned' | 'banned' | string | null;
  status_reason?: string | null;
  views_count?: number;
  is_onboarded?: boolean;
  created_at: string;
  updated_at: string;
}

export interface LinkItem {
  id: string;
  profile_id: string;
  title: string;
  url: string;
  icon: string | null;
  bg_color?: string | null;
  is_active: boolean;
  clicks_count?: number;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface BadgeItem {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  bg_color: string;
  is_event: boolean;
  is_active?: boolean;
  event_end_time?: string | null;
  event_custom_title?: string | null;
  event_custom_description?: string | null;
  created_at: string;
}

export interface UserBadgeItem {
  id: string;
  user_id: string;
  badge_id: string;
  is_displayed: boolean;
  created_at: string;
  badge?: BadgeItem;
}

export interface SystemSettings {
  id: string;
  ad_banner_enabled: boolean;
  ad_banner_title: string;
  ad_banner_description: string;
  ad_banner_badge_id: string | null;
  ad_banner_bg_color: string;
  updated_at: string;
}
