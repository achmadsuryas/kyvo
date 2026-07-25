import { Profile, LinkItem, BadgeItem } from './database.types';

export * from './database.types';

export interface UserProfileWithLinks extends Profile {
  links: LinkItem[];
  badges?: BadgeItem[];
}

export interface AdminUserItem extends Profile {
  badges: BadgeItem[];
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  badge?: string;
  bgColor: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}
