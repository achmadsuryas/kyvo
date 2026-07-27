'use client';

import * as React from 'react';
import { Eye, ExternalLink } from 'lucide-react';
import { recordProfileView, recordLinkClick } from '@/actions/analytics';
import { getIconComponent } from '@/components/shared/social-icons';
import { LinkItem } from '@/types';

interface PublicProfileTrackerProps {
  profileId: string;
  initialViews: number;
}

export function PublicProfileTracker({ profileId, initialViews }: PublicProfileTrackerProps) {
  const [views, setViews] = React.useState<number>(initialViews || 0);

  React.useEffect(() => {
    // Record view on mount
    recordProfileView(profileId).then((res) => {
      if (res.success) {
        setViews((prev) => prev + 1);
      }
    });
  }, [profileId]);

  return (
    <div className="inline-flex items-center gap-1.5 bg-[#FFD43B] text-[#111111] px-2.5 py-0.5 rounded-lg border-2 border-[#111111] text-[10px] sm:text-xs font-black shadow-[1.5px_1.5px_0px_0px_#111111]">
      <Eye className="w-3.5 h-3.5 text-[#111111] stroke-[2.5]" />
      <span>{views.toLocaleString()} Views</span>
    </div>
  );
}

function getContrastTextColor(hexColor?: string | null): string {
  if (!hexColor || !hexColor.startsWith('#')) return 'text-[#111111]';
  const hex = hexColor.replace('#', '');
  if (hex.length !== 6) return 'text-[#111111]';
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? 'text-[#111111]' : 'text-white';
}

interface TrackedLinkItemProps {
  link: LinkItem;
  bgClass: string;
}

export function TrackedLinkItem({ link, bgClass }: TrackedLinkItemProps) {
  const IconComponent = getIconComponent(link.icon || 'Globe');
  const customBg = link.bg_color || null;
  const textColor = customBg ? getContrastTextColor(customBg) : 'text-[#111111]';

  const handleClick = () => {
    // Record click asynchronously without delaying navigation
    recordLinkClick(link.id);
  };

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      style={customBg ? { backgroundColor: customBg } : undefined}
      className={`group w-full rounded-none border-[2.5px] border-[#111111] ${customBg ? textColor : bgClass} p-2.5 sm:p-3 shadow-[3.5px_3.5px_0px_0px_#111111] hover:shadow-[4.5px_4.5px_0px_0px_#111111] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-between font-extrabold text-xs sm:text-sm cursor-pointer`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="p-1.5 rounded-none border-2 border-[#111111] bg-white text-[#111111] shrink-0">
          <IconComponent className="w-4 h-4" />
        </div>
        <span className="truncate">{link.title}</span>
      </div>
      <ExternalLink className="w-4 h-4 stroke-[2.5] opacity-80 group-hover:scale-110 transition-transform shrink-0" />
    </a>
  );
}
