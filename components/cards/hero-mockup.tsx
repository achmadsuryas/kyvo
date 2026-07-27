'use client';

import * as React from 'react';
import { Globe, ExternalLink, CheckCircle2, Eye, QrCode, Share2, Crown } from 'lucide-react';
import { getIconComponent } from '@/components/shared/social-icons';

export function HeroMockup() {
  const GithubIcon = getIconComponent('Github');
  const TwitterIcon = getIconComponent('Twitter');

  const [isWiggling, setIsWiggling] = React.useState(false);

  React.useEffect(() => {
    // Dynamic 3-second wiggle shake animation to bring landing page card to life!
    const interval = setInterval(() => {
      setIsWiggling(true);
      setTimeout(() => {
        setIsWiggling(false);
      }, 600);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-[310px] sm:max-w-[330px] relative group">
      {/* Background Accent Decorative Box */}
      <div className="absolute -inset-1.5 bg-[#FFD43B] rounded-3xl border-[3px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] rotate-2 group-hover:rotate-3 transition-transform duration-300 pointer-events-none" />

      {/* Main Compact Mockup Card with Dynamic 3-Second Wiggle Animation */}
      <div
        className={`relative rounded-3xl border-[3.5px] border-[#111111] bg-white p-4 space-y-4 transition-all duration-300 overflow-hidden ${
          isWiggling 
            ? 'rotate-3 -translate-y-2 scale-[1.03] shadow-[9px_9px_0px_0px_#111111]' 
            : '-rotate-1 group-hover:rotate-0 shadow-[6px_6px_0px_0px_#111111]'
        }`}
      >
        {/* Top Profile Banner with Views Counter & Window Controls */}
        <div className="relative w-full bg-[#3B82F6] rounded-2xl border-[2.5px] border-[#111111] p-2.5 h-24 flex items-start justify-between shadow-[2.5px_2.5px_0px_0px_#111111]">
          {/* Views Counter Pill */}
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-[#111111] bg-[#FFD43B] text-[#111111] text-[10px] font-black shadow-[1.5px_1.5px_0px_0px_#111111]">
            <Eye className="w-3 h-3 stroke-[2.5]" />
            <span>1,240 Views</span>
          </div>

          {/* Window Control Dots */}
          <div className="flex items-center gap-1 pt-0.5">
            <span className="w-2 h-2 rounded-full bg-[#FF4D6D] border border-[#111111]" />
            <span className="w-2 h-2 rounded-full bg-[#FFD43B] border border-[#111111]" />
            <span className="w-2 h-2 rounded-full bg-[#51CF66] border border-[#111111]" />
          </div>
        </div>

        {/* Avatar & Profile Information */}
        <div className="flex flex-col items-center text-center space-y-2 -mt-10 relative z-10 px-1">
          {/* Avatar Initials Circle */}
          <div className="w-16 h-16 rounded-full border-[3px] border-[#111111] bg-[#FFD43B] text-[#111111] font-black text-xl flex items-center justify-center shadow-[2.5px_2.5px_0px_0px_#111111]">
            KC
          </div>

          {/* Name & Handle */}
          <div className="space-y-0.5">
            <div className="flex items-center justify-center gap-1">
              <h3 className="text-xl font-black text-[#111111] tracking-tight">Kyvo Creator</h3>
              <CheckCircle2 className="w-4 h-4 text-[#3B82F6] fill-[#3B82F6] stroke-white" />
            </div>
            <p className="text-[11px] font-black text-[#3B82F6] uppercase tracking-wide">
              kyvo.fun/creator
            </p>
          </div>

          {/* System Badge Showcase Pill */}
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-[#111111] bg-[#A855F7] text-white text-[9px] font-black shadow-[1.5px_1.5px_0px_0px_#111111]">
            <Crown className="w-3 h-3 text-white stroke-[2.5]" />
            <span>KYVO VIP</span>
          </div>

          {/* Bio Text */}
          <p className="text-[11px] font-bold text-[#111111]/85 max-w-[240px] leading-snug pt-0.5">
            One Link. Everywhere. ⚡ Creating bold Neobrutalist bio pages for creators worldwide.
          </p>
        </div>

        {/* Sample Links List */}
        <div className="space-y-2.5 pt-0.5">
          <div className="w-full rounded-xl border-[2.5px] border-[#111111] bg-[#FFD43B] p-2.5 shadow-[3px_3px_0px_0px_#111111] flex items-center justify-between font-black text-xs text-[#111111]">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg border border-[#111111] bg-white text-[#111111]">
                <Globe className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span className="font-black text-xs">Official Website</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 stroke-[3]" />
          </div>

          <div className="w-full rounded-xl border-[2.5px] border-[#111111] bg-white text-[#111111] p-2.5 shadow-[3px_3px_0px_0px_#111111] flex items-center justify-between font-black text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg border border-[#111111] bg-[#FFD43B] text-[#111111]">
                <GithubIcon className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span className="font-black text-xs">GitHub Repository</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 stroke-[3]" />
          </div>

          <div className="w-full rounded-xl border-[2.5px] border-[#111111] bg-white text-[#111111] p-2.5 shadow-[3px_3px_0px_0px_#111111] flex items-center justify-between font-black text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg border border-[#111111] bg-[#FFD43B] text-[#111111]">
                <TwitterIcon className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span className="font-black text-xs">Twitter / X Community</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        </div>

        {/* Share & QR Code Line Footer */}
        <div className="pt-1.5 border-t-2 border-dashed border-[#111111]/20 flex items-center justify-center gap-1.5 text-[10px] font-black text-[#FF4D6D]">
          <Share2 className="w-3 h-3 stroke-[2.5]" />
          <span>Share Profile & Scan QR Code</span>
          <QrCode className="w-3 h-3 text-[#3B82F6]" />
        </div>

        {/* Footer Accent */}
        <div className="text-center text-[9px] font-black text-[#111111]/60 uppercase tracking-widest">
          Powered by <span className="underline text-[#111111]">Kyvo</span>
        </div>
      </div>
    </div>
  );
}
