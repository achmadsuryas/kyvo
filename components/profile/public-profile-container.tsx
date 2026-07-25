'use client';

import * as React from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Play, 
  Volume2, 
  VolumeX, 
  Disc, 
  Music
} from 'lucide-react';
import { Profile, LinkItem, BadgeItem } from '@/types';
import { getBadgeIconComponent } from '@/components/shared/badge-icons';
import { Button } from '@/components/ui/button';
import { ProfileShareButton } from '@/components/profile/profile-share-button';
import { PublicProfileTracker, TrackedLinkItem } from '@/components/profile/public-profile-tracker';
import { InteractiveAvatar } from '@/components/profile/interactive-avatar';

interface PublicProfileContainerProps {
  profile: Profile & {
    links: LinkItem[];
    badges?: BadgeItem[];
  };
  isVerifiedByAdmin: boolean;
  bgColors: string[];
}

export function PublicProfileContainer({
  profile,
  isVerifiedByAdmin,
  bgColors,
}: PublicProfileContainerProps) {
  const hasMusic = Boolean(profile.music_url);

  // If user has music, visitor must click trigger button to unlock audio autoplay and view profile card!
  const [hasTriggered, setHasTriggered] = React.useState(!hasMusic);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Initialize audio when user has music
  React.useEffect(() => {
    if (profile.music_url) {
      audioRef.current = new Audio(profile.music_url);
      audioRef.current.loop = true;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [profile.music_url]);

  // Trigger Enter & Autoplay Music
  const handleEnterProfile = () => {
    setHasTriggered(true);
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.error('Audio autoplay error:', err);
      });
    }
  };

  // Toggle Mute Audio
  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* 1. INITIAL INTERACTIVE MUSIC ENTER TRIGGER OVERLAY (Only if profile HAS music) */}
      {!hasTriggered && hasMusic && (
        <div className="w-full max-w-sm sm:max-w-md my-auto animate-in zoom-in-95 duration-300">
          <div className="rounded-3xl border-[4px] border-[#111111] bg-[#FFD43B] p-6 sm:p-8 shadow-[8px_8px_0px_0px_#111111] text-center space-y-6">
            {/* Perfectly Round 100% Circle Spinning Vinyl Preview Record */}
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center shrink-0">
              {/* Outer Black Vinyl Disk with Concentric Grooves */}
              <div className="w-28 h-28 rounded-full border-[3.5px] border-[#111111] bg-[#111111] flex items-center justify-center shadow-[4px_4px_0px_0px_#111111] animate-[spin_6s_linear_infinite] shrink-0 aspect-square">
                {/* Vinyl Ring Grooves */}
                <div className="w-20 h-20 rounded-full border border-white/20 flex items-center justify-center shrink-0 aspect-square">
                  <div className="w-13 h-13 rounded-full border border-white/20 flex items-center justify-center bg-[#FFD43B] shrink-0 aspect-square">
                    {/* Kyvo Favicon Center Label */}
                    <img src="/favicon.svg" alt="Kyvo Logo" className="w-7 h-7 rounded-full shrink-0 aspect-square" />
                  </div>
                </div>
              </div>

              {/* Floating Music Notes */}
              <div className="absolute -top-2 -right-2 p-2 rounded-xl border-2 border-[#111111] bg-[#FF4D6D] text-white font-black shadow-[2px_2px_0px_0px_#111111] animate-bounce">
                <Music className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-[#111111] leading-tight">
                {profile.display_name || profile.username}
              </h2>
              <p className="text-xs sm:text-sm font-extrabold text-[#111111]/80 max-w-xs mx-auto">
                {profile.music_title ? `Track: "${profile.music_title}"` : 'Click below to enter profile & enjoy music!'}
              </p>
            </div>

            <Button
              onClick={handleEnterProfile}
              variant="default"
              size="lg"
              className="w-full justify-center gap-2 font-black text-sm sm:text-base py-6 shadow-[4px_4px_0px_0px_#111111] hover:scale-105 active:scale-95 transition-transform"
            >
              <Play className="w-5 h-5 fill-white stroke-white" />
              <span>Enter Profile & Listen Music</span>
            </Button>
          </div>
        </div>
      )}

      {/* 2. MAIN PUBLIC CREATOR PROFILE CARD */}
      {hasTriggered && (
        <main className="w-full max-w-sm sm:max-w-md my-4 sm:my-6 animate-in fade-in duration-300">
          <div className="rounded-3xl border-[3.5px] border-[#111111] bg-white p-4 sm:p-6 shadow-[6px_6px_0px_0px_#111111] relative overflow-hidden space-y-5">
            {/* Header Decorative Banner */}
            <div className="h-16 sm:h-20 w-full rounded-2xl border-[2.5px] border-[#111111] bg-[#3B82F6] relative overflow-hidden p-3 flex items-start justify-between">
              <PublicProfileTracker profileId={profile.id} initialViews={profile.views_count || 0} />
              
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border border-[#111111] bg-[#FF4D6D]" />
                <span className="w-2.5 h-2.5 rounded-full border border-[#111111] bg-[#FFD43B]" />
                <span className="w-2.5 h-2.5 rounded-full border border-[#111111] bg-[#51CF66]" />
              </div>
            </div>

            {/* User Info Section */}
            <div className="flex flex-col items-center text-center -mt-12 sm:-mt-14 relative z-10 space-y-2">
              <InteractiveAvatar
                src={profile.avatar_url}
                fallback={profile.display_name || profile.username}
                displayName={profile.display_name || profile.username}
              />
              
              <div className="space-y-0.5">
                <div className="flex items-center justify-center gap-1.5">
                  <h1 className="text-xl sm:text-2xl font-black text-[#111111]">
                    {profile.display_name || profile.username}
                  </h1>
                  {isVerifiedByAdmin && (
                    <span title="Verified Creator">
                      <CheckCircle2 className="w-5 h-5 text-[#3B82F6] fill-[#3B82F6] stroke-white" />
                    </span>
                  )}
                </div>
                <p className="text-xs font-black text-[#3B82F6] uppercase tracking-wide">
                  @{profile.username}
                </p>

                {/* Granted Badges Pills */}
                {profile.badges && profile.badges.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1.5">
                    {profile.badges.map((b) => {
                      const BadgeIcon = getBadgeIconComponent(b.icon);

                      return (
                        <span
                          key={b.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border border-[#111111] font-black text-[10px] uppercase shadow-[1.5px_1.5px_0px_0px_#111111] transition-transform hover:-translate-y-0.5 cursor-default"
                          style={{ backgroundColor: b.bg_color || '#FFD43B', color: b.color || '#111111' }}
                        >
                          <BadgeIcon className="w-3 h-3 stroke-[2.5]" />
                          <span>{b.name}</span>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {profile.bio && (
                <p className="text-xs sm:text-sm font-extrabold text-[#111111]/80 max-w-xs leading-relaxed pt-0.5">
                  {profile.bio}
                </p>
              )}
            </div>

            {/* ANIMATED SPINNING PERFECT VINYL RECORD DISK & MUTE CONTROLLER (Only visible when user has music) */}
            {hasMusic && (
              <div className="rounded-2xl border-[2.5px] border-[#111111] bg-[#FFD43B]/30 p-3 shadow-[3px_3px_0px_0px_#111111] flex items-center justify-between gap-3">
                {/* Left: Perfectly Round Vinyl Disk with Kyvo Favicon Center */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative w-11 h-11 shrink-0 aspect-square">
                    <div className={`w-11 h-11 rounded-full border-2 border-[#111111] bg-[#111111] flex items-center justify-center shadow-[2px_2px_0px_0px_#111111] shrink-0 aspect-square ${
                      isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''
                    }`}>
                      <div className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center bg-[#FFD43B] shrink-0 aspect-square">
                        <img src="/favicon.svg" alt="Kyvo Logo" className="w-4 h-4 rounded-full shrink-0 aspect-square" />
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black uppercase text-[#111111]/60 tracking-wider">
                      Background Music
                    </p>
                    <p className="text-xs font-black text-[#111111] truncate">
                      {profile.music_title || 'Audio Track'}
                    </p>
                  </div>
                </div>

                {/* Right: Mute / Unmute Control Button Only */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={toggleMute}
                    className="px-3 py-1.5 rounded-xl border-2 border-[#111111] bg-white text-[#111111] font-black text-xs shadow-[2px_2px_0px_0px_#111111] hover:bg-[#FFD43B] transition-colors flex items-center gap-1.5 cursor-pointer"
                    title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                  >
                    {isMuted ? (
                      <>
                        <VolumeX className="w-4 h-4 text-[#FF4D6D]" />
                        <span>Unmute</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 text-[#3B82F6]" />
                        <span>Mute</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Links List with Click Tracking */}
            <div className="space-y-2.5 pt-1">
              {profile.links.map((link, idx) => (
                <TrackedLinkItem
                  key={link.id}
                  link={link}
                  bgClass={bgColors[idx % bgColors.length]}
                />
              ))}
            </div>

            {/* Share Profile & QR Code Action */}
            <ProfileShareButton username={profile.username} displayName={profile.display_name || profile.username} />
          </div>
        </main>
      )}
    </div>
  );
}
