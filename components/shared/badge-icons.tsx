import * as React from 'react';
import { 
  Rocket, 
  Sparkles, 
  Crown, 
  CheckCircle2, 
  ShieldCheck, 
  Flame, 
  Zap, 
  Award, 
  Heart, 
  Star,
  LucideProps,
} from 'lucide-react';

export const BADGE_ICONS_MAP: Record<string, React.ComponentType<LucideProps>> = {
  Rocket,
  Sparkles,
  Crown,
  CheckCircle2,
  ShieldCheck,
  Flame,
  Zap,
  Award,
  Heart,
  Star,
};

export const AVAILABLE_BADGE_ICONS = [
  { name: 'Rocket', label: 'Rocket 🚀' },
  { name: 'Sparkles', label: 'Sparkles ✨' },
  { name: 'Crown', label: 'Crown 👑' },
  { name: 'CheckCircle2', label: 'Verified Check ✔️' },
  { name: 'ShieldCheck', label: 'Shield 🛡️' },
  { name: 'Flame', label: 'Flame 🔥' },
  { name: 'Zap', label: 'Zap ⚡' },
  { name: 'Award', label: 'Award 🏅' },
  { name: 'Heart', label: 'Heart ❤️' },
  { name: 'Star', label: 'Star ⭐' },
];

export function getBadgeIconComponent(iconName?: string | null): React.ComponentType<LucideProps> {
  if (!iconName) return Sparkles;
  
  const cleanName = iconName.replace(/[^a-zA-Z0-9]/g, '');
  
  for (const key of Object.keys(BADGE_ICONS_MAP)) {
    if (key.toLowerCase() === cleanName.toLowerCase()) {
      return BADGE_ICONS_MAP[key];
    }
  }

  return BADGE_ICONS_MAP[iconName] || Sparkles;
}
