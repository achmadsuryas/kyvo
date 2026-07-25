'use client';

import * as React from 'react';
import Link from 'next/link';
import { Sparkles, ExternalLink, Megaphone, Home, CheckCircle2, CalendarCheck } from 'lucide-react';
import { BadgeItem, UserBadgeItem } from '@/types';
import { claimEventBadge } from '@/actions/badges';
import { getBadgeIconComponent } from '@/components/shared/badge-icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface AdBannerCardProps {
  currentUsername: string;
  availableEvents: BadgeItem[];
  userBadgeItems?: UserBadgeItem[];
}

export function AdBannerCard({ currentUsername, availableEvents = [], userBadgeItems = [] }: AdBannerCardProps) {
  const [claimingId, setClaimingId] = React.useState<string | null>(null);
  const [recentlyClaimedIds, setRecentlyClaimedIds] = React.useState<string[]>([]);

  // Filter ONLY active event banners (Ended events are hidden from user promo list)
  const activeEventBadges = availableEvents.filter((b) => b.is_event && b.is_active !== false);

  const handleClaim = async (badgeId: string) => {
    setClaimingId(badgeId);
    const res = await claimEventBadge(badgeId);
    setClaimingId(null);

    if (res.success) {
      toast.success(res.message);
      setRecentlyClaimedIds((prev) => [...prev, badgeId]);
    } else {
      if (res.message.toLowerCase().includes('already') || res.message.toLowerCase().includes('claimed')) {
        setRecentlyClaimedIds((prev) => [...prev, badgeId]);
      }
      toast.info(res.message);
    }
  };

  const hasActiveEvents = activeEventBadges.length > 0;
  const topActiveEvent = activeEventBadges[0];

  return (
    <Card className="bg-[#3B82F6] text-white border-[3px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] p-6 md:p-8 space-y-6 h-full flex flex-col justify-between relative overflow-hidden">
      <div className="space-y-6 relative z-10">
        {/* Top Banner Header Tag */}
        <div className="flex items-center justify-between">
          <Badge variant="default" className="text-xs font-black text-[#111111] gap-1.5">
            <Megaphone className="w-3.5 h-3.5" />
            <span>KYVO EVENTS & PROMOS ({activeEventBadges.length})</span>
          </Badge>
        </div>

        {/* Dynamic Admin-Customized Promo Section Header (Only visible when active events exist) */}
        {hasActiveEvents && (
          <div className="space-y-2 animate-in fade-in duration-200">
            <h3 className="text-2xl md:text-3xl font-black leading-tight">
              {topActiveEvent?.name || 'Claim Creator Event Badges! 🚀'}
            </h3>
            <p className="text-sm font-bold text-white/90 leading-relaxed">
              {topActiveEvent?.description || 'Exclusive Creator Events created by Admin. Claim free badges to equip on your public profile!'}
            </p>
          </div>
        )}

        {/* LIST OF ACTIVE EVENT BADGES OR CLEAN COMING SOON TEMPLATE */}
        <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
          {!hasActiveEvents ? (
            /* CLEAN COMING SOON TEMPLATE CARD WHEN NO ACTIVE EVENTS EXIST */
            <div className="rounded-3xl border-[3px] border-[#111111] bg-white text-[#111111] p-6 md:p-8 shadow-[6px_6px_0px_0px_#111111] text-center space-y-4 my-auto">
              <div className="w-16 h-16 rounded-2xl border-[3px] border-[#111111] bg-[#FFD43B] mx-auto flex items-center justify-center shadow-[3px_3px_0px_0px_#111111]">
                <CalendarCheck className="w-8 h-8 text-[#111111] stroke-[2.5]" />
              </div>
              <div className="space-y-2">
                <Badge variant="purple" className="text-[10px] font-black uppercase">
                  COMING SOON
                </Badge>
                <h4 className="text-xl font-black text-[#111111]">No Active Events Right Now</h4>
                <p className="text-xs font-bold text-[#111111]/70 leading-relaxed max-w-xs mx-auto pt-1">
                  Stay tuned! New exclusive creator badges and special promo events will be launched soon by Admin. Check back regularly!
                </p>
              </div>
            </div>
          ) : (
            activeEventBadges.map((event) => {
              const BadgeIconComp = getBadgeIconComponent(event.icon);

              const isAlreadyClaimed = userBadgeItems.some(
                (ub) => ub.badge_id === event.id || ub.badge?.id === event.id || ub.badge?.name === event.name
              );
              const isClaimedFinal = isAlreadyClaimed || recentlyClaimedIds.includes(event.id);
              const isClaimingThis = claimingId === event.id;

              return (
                <div
                  key={event.id}
                  className="rounded-2xl border-[3px] border-[#111111] bg-white text-[#111111] p-4 shadow-[4px_4px_0px_0px_#111111] space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Admin Custom Vector Icon */}
                      <div
                        className="p-2.5 rounded-xl border-2 border-[#111111] shadow-[2px_2px_0px_0px_#111111] flex-shrink-0"
                        style={{ backgroundColor: event.bg_color || '#FFD43B', color: event.color || '#111111' }}
                      >
                        <BadgeIconComp className="w-6 h-6 stroke-[2.5]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-base font-black leading-tight">{event.name}</h4>
                        </div>
                        <p className="text-xs font-bold text-[#111111]/70 leading-normal pt-0.5">
                          {event.description || 'Special event badge for creators'}
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant="green"
                      className="text-[10px] font-black uppercase flex-shrink-0"
                    >
                      Active
                    </Badge>
                  </div>

                  {/* Claim Button */}
                  <Button
                    onClick={() => handleClaim(event.id)}
                    disabled={isClaimingThis || isClaimedFinal}
                    variant={isClaimedFinal ? "green" : "purple"}
                    size="sm"
                    className={`w-full justify-center font-black gap-2 text-xs shadow-[2px_2px_0px_0px_#111111] ${
                      isClaimedFinal ? 'opacity-90 cursor-not-allowed bg-[#51CF66] text-[#111111]' : ''
                    }`}
                  >
                    {isClaimingThis ? (
                      <span className="animate-spin">⏳</span>
                    ) : isClaimedFinal ? (
                      <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                    ) : (
                      <Sparkles className="w-4 h-4 fill-[#FFD43B]" />
                    )}
                    <span>
                      {isClaimedFinal
                        ? 'Badge Claimed ✓'
                        : 'Claim Free Event Badge'}
                    </span>
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom Link (Points to Kyvo Home Page) */}
      <div className="pt-3 border-t-2 border-dashed border-white/30 flex items-center justify-between text-xs font-extrabold text-white/90 relative z-10">
        <span className="truncate flex items-center gap-1.5">
          <Home className="w-3.5 h-3.5" />
          <span>kyvo.fun</span>
        </span>
        <Link href="/" className="inline-flex items-center gap-1 underline text-[#FFD43B] hover:text-white font-black">
          <span>Go to Home Page</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </Card>
  );
}
