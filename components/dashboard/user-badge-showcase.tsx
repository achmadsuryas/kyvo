'use client';

import * as React from 'react';
import { Award, Eye, EyeOff, Sparkles, Loader2 } from 'lucide-react';
import { UserBadgeItem } from '@/types';
import { toggleBadgeDisplayStatus } from '@/actions/badges';
import { getBadgeIconComponent } from '@/components/shared/badge-icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface UserBadgeShowcaseProps {
  initialUserBadges: UserBadgeItem[];
}

export function UserBadgeShowcase({ initialUserBadges }: UserBadgeShowcaseProps) {
  const [userBadges, setUserBadges] = React.useState<UserBadgeItem[]>(initialUserBadges);
  const [loadingBadgeId, setLoadingBadgeId] = React.useState<string | null>(null);

  const handleToggle = async (ub: UserBadgeItem) => {
    setLoadingBadgeId(ub.id);
    const res = await toggleBadgeDisplayStatus(ub.id, ub.is_displayed !== false);
    setLoadingBadgeId(null);

    if (res.success) {
      toast.success(res.message);
      setUserBadges((prev) =>
        prev.map((item) =>
          item.id === ub.id ? { ...item, is_displayed: !ub.is_displayed } : item
        )
      );
    } else {
      toast.error(res.message);
    }
  };

  return (
    <Card className="bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] p-5 md:p-6 space-y-5 w-full">
      <CardHeader className="px-0 pt-0 pb-4 border-b-2 border-dashed border-[#111111]/20 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#A855F7] stroke-[2.5]" />
            <CardTitle className="text-xl font-black">My Badges & Equipment</CardTitle>
          </div>
          <CardDescription className="text-xs font-bold">
            Equip or unequip earned badges to customize your public page display
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="px-0 pt-1 space-y-3">
        {userBadges.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {userBadges.map((ub) => {
              if (!ub.badge) return null;
              const IconComp = getBadgeIconComponent(ub.badge.icon);
              const isEquipped = ub.is_displayed !== false;
              const isLoading = loadingBadgeId === ub.id;

              return (
                <div
                  key={ub.id}
                  className={`rounded-xl border-2 border-[#111111] p-3 flex items-center justify-between gap-2.5 shadow-[3px_3px_0px_0px_#111111] transition-all ${
                    isEquipped ? 'bg-white' : 'bg-[#F8F9FA] opacity-75'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span
                      className="w-8 h-8 rounded-lg border border-[#111111] shadow-[1.5px_1.5px_0px_0px_#111111] flex items-center justify-center shrink-0"
                      style={{ backgroundColor: ub.badge.bg_color || '#FFD43B', color: ub.badge.color || '#111111' }}
                    >
                      <IconComp className="w-4 h-4 stroke-[2.5]" />
                    </span>

                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-black text-xs text-[#111111] leading-tight truncate">{ub.badge.name}</h4>
                        {isEquipped ? (
                          <Badge variant="green" className="text-[8px] font-black px-1.5 py-0 shrink-0">
                            EQUIPPED
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[8px] font-black px-1.5 py-0 bg-gray-200 shrink-0">
                            HIDDEN
                          </Badge>
                        )}
                      </div>
                      <p className="text-[10px] font-extrabold text-[#111111]/70 leading-tight truncate">
                        {ub.badge.description || 'Verified Creator Badge'}
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    disabled={isLoading}
                    variant={isEquipped ? "outline" : "yellow"}
                    onClick={() => handleToggle(ub)}
                    className="font-black text-[11px] h-7 px-2.5 gap-1 shadow-[1.5px_1.5px_0px_0px_#111111] shrink-0"
                  >
                    {isLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : isEquipped ? (
                      <>
                        <EyeOff className="w-3 h-3 stroke-[2.5]" />
                        <span>Unequip</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3 stroke-[2.5]" />
                        <span>Equip</span>
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center rounded-2xl border-2 border-dashed border-[#111111]/30 bg-[#F8F9FA] space-y-1.5">
            <Sparkles className="w-6 h-6 text-[#FF4D6D] mx-auto" />
            <p className="text-xs font-black text-[#111111]">No Badges Earned Yet</p>
            <p className="text-[11px] font-bold text-[#111111]/60">
              Claim the free event badge in the promo card to get started!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
