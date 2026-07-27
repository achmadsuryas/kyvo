'use client';

import * as React from 'react';
import { Globe, ExternalLink, CheckCircle2, QrCode, Share2, Sparkles } from 'lucide-react';
import { getIconComponent } from '@/components/shared/social-icons';
import { KyvoLogo } from '@/components/shared/kyvo-logo';

export function HeroMockup() {
  const GithubIcon = getIconComponent('Github');
  const TwitterIcon = getIconComponent('Twitter');
  const InstagramIcon = getIconComponent('Instagram');

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
    <div className="w-full max-w-[310px] sm:max-w-[340px] relative group">
      {/* Background Accent Decorative Box */}
      <div className="absolute -inset-1.5 bg-[#FFD43B] rounded-3xl border-[3px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] rotate-2 group-hover:rotate-3 transition-transform duration-300 pointer-events-none" />

      {/* Main Compact Mockup Card matching actual Public Profile Layout */}
      <div
        className={`relative rounded-3xl border-[3.5px] border-[#111111] bg-[#F8F9FA] p-4 sm:p-5 space-y-5 transition-all duration-300 overflow-hidden ${
          isWiggling 
            ? 'rotate-3 -translate-y-2 scale-[1.03] shadow-[9px_9px_0px_0px_#111111]' 
            : '-rotate-1 group-hover:rotate-0 shadow-[6px_6px_0px_0px_#111111]'
        }`}
      >
        {/* Top Header Row matching Public Profile Page */}
        <div className="flex items-center justify-between gap-2 border-b-2 border-dashed border-[#111111]/15 pb-3">
          <KyvoLogo href="/" size="xs" />
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border-2 border-[#111111] bg-[#FFD43B] text-[#111111] text-[10px] font-black shadow-[1.5px_1.5px_0px_0px_#111111]">
            <Sparkles className="w-3 h-3 text-[#FF4D6D] fill-[#FF4D6D]" />
            <span>Create Your Own</span>
          </div>
        </div>

        {/* Profile Avatar & Header Details */}
        <div className="flex flex-col items-center text-center space-y-2 pt-1">
          {/* Avatar with Double Yellow Ring */}
          <div className="w-20 h-20 rounded-full border-[3px] border-[#111111] bg-[#FFD43B] text-[#111111] font-black text-2xl flex items-center justify-center shadow-[3px_3px_0px_0px_#111111] ring-4 ring-[#FFD43B]/60">
            AS
          </div>

          {/* Name & Blue Checkmark */}
          <div className="space-y-0.5 pt-1">
            <div className="flex items-center justify-center gap-1.5">
              <h3 className="text-xl font-black text-[#111111] tracking-tight">Achmad Surya</h3>
              <CheckCircle2 className="w-5 h-5 text-[#3B82F6] fill-[#3B82F6] stroke-white" />
            </div>
            <p className="text-xs font-black text-[#3B82F6]">
              @achmadsuryas
            </p>
          </div>

          {/* Bio Text */}
          <p className="text-xs font-extrabold text-[#111111]/80 max-w-[240px] leading-snug pt-0.5">
            One Link. Everywhere. ⚡ Creating bold Neobrutalist bio pages for creators worldwide.
          </p>

          {/* Minimal Social Media Icons Row */}
          <div className="flex items-center justify-center gap-3 pt-1 text-[#111111]">
            <GithubIcon className="w-4 h-4 stroke-[2.5]" />
            <TwitterIcon className="w-4 h-4 stroke-[2.5]" />
            <InstagramIcon className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>

        {/* Links List matching Actual Profile Layout (Header, Dark Link, Featured Yellow Link) */}
        <div className="space-y-2.5 pt-1">
          {/* Category Header Link */}
          <div className="w-full rounded-xl border-[2.5px] border-[#111111] bg-[#333333] text-white p-2.5 text-center font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#111111]">
            PORTFOLIO
          </div>

          {/* Standard Link */}
          <div className="w-full rounded-xl border-[2.5px] border-[#111111] bg-[#111111] text-white p-2.5 shadow-[3px_3px_0px_0px_#111111] flex items-center justify-between font-black text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-1 rounded-md border border-white bg-white text-[#111111]">
                <GithubIcon className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span className="font-black text-xs uppercase">GITHUB</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 stroke-[3] text-white/80" />
          </div>

          {/* Featured Link */}
          <div className="w-full rounded-xl border-[2.5px] border-[#111111] bg-[#FFD43B] text-[#111111] p-2.5 shadow-[3px_3px_0px_0px_#111111] flex items-center justify-between font-black text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-1 rounded-md border border-[#111111] bg-white text-[#111111]">
                <Globe className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span className="font-black text-xs uppercase">KYVO WEBSITE</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        </div>

        {/* Share & QR Code Line Footer */}
        <div className="pt-2 border-t-2 border-dashed border-[#111111]/20 flex items-center justify-between text-[10px] font-black text-[#FF4D6D]">
          <span className="flex items-center gap-1">
            <Share2 className="w-3 h-3 stroke-[2.5]" />
            <span>Share Profile</span>
          </span>
          <span className="flex items-center gap-1 text-[#3B82F6]">
            <span>Scan QR</span>
            <QrCode className="w-3 h-3" />
          </span>
        </div>

        {/* Footer Accent */}
        <div className="text-center text-[9px] font-black text-[#111111]/60 uppercase tracking-widest pt-0.5">
          POWERED BY <span className="underline text-[#111111]">KYVO</span>
        </div>
      </div>
    </div>
  );
}
