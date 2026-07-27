'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface KyvoLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  href?: string;
  className?: string;
  textColor?: string;
}

export function KyvoLogoIcon({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  const dimensions = {
    sm: 'w-7 h-7 sm:w-8 sm:h-8 border-2 shadow-[2px_2px_0px_0px_#111111]',
    md: 'w-9 h-9 sm:w-10 sm:h-10 border-[2.5px] shadow-[2.5px_2.5px_0px_0px_#111111]',
    lg: 'w-12 h-12 sm:w-14 sm:h-14 border-[3px] shadow-[3.5px_3.5px_0px_0px_#111111]',
    xl: 'w-16 h-16 sm:w-20 sm:h-20 border-[4px] shadow-[5px_5px_0px_0px_#111111]',
  };

  const textSizes = {
    sm: 'text-base sm:text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-4xl sm:text-5xl',
  };

  return (
    <div
      className={cn(
        "relative flex items-center justify-center bg-[#FFD43B] border-[#111111] font-black shrink-0 overflow-hidden select-none rounded-none",
        dimensions[size] || dimensions.md,
        className
      )}
    >
      {/* Clean Centered Capital Letter K (Sharp Square Box, NO dots) */}
      <span
        className={cn(
          "text-[#111111] font-black tracking-tighter leading-none flex items-center justify-center translate-y-[-1px]",
          textSizes[size] || textSizes.md
        )}
        style={{ fontFamily: 'var(--font-bricolage), "Arial Black", Impact, sans-serif' }}
      >
        K
      </span>
    </div>
  );
}

export function KyvoLogo({ size = 'md', showText = true, href, className, textColor }: KyvoLogoProps) {
  const textSizes = {
    sm: 'text-lg sm:text-xl',
    md: 'text-2xl sm:text-3xl',
    lg: 'text-3xl sm:text-4xl',
    xl: 'text-4xl sm:text-5xl',
  };

  const content = (
    <div className={cn("inline-flex items-center gap-2.5 group select-none", className)}>
      <KyvoLogoIcon size={size} />

      {showText && (
        <span
          className={cn(
            "font-black tracking-tight group-hover:scale-105 transition-transform",
            textColor || "text-[#111111]",
            textSizes[size] || textSizes.md
          )}
          style={{ fontFamily: 'var(--font-bricolage), "Arial Black", Impact, sans-serif' }}
        >
          Kyvo
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center shrink-0">
        {content}
      </Link>
    );
  }

  return content;
}
