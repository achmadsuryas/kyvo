'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface KyvoLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  href?: string;
  className?: string;
}

export function KyvoLogoIcon({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  const dimensions = {
    sm: 'w-7 h-7 sm:w-8 sm:h-8 rounded-xl border-2 shadow-[2px_2px_0px_0px_#111111]',
    md: 'w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl border-[2.5px] shadow-[2.5px_2.5px_0px_0px_#111111]',
    lg: 'w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-[3px] shadow-[3.5px_3.5px_0px_0px_#111111]',
    xl: 'w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl border-[4px] shadow-[5px_5px_0px_0px_#111111]',
  };

  const textSizes = {
    sm: 'text-base sm:text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-4xl sm:text-5xl',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5 bottom-0.5 right-0.5 border',
    md: 'w-2 h-2 bottom-0.5 right-0.5 border-[1.5px]',
    lg: 'w-2.5 h-2.5 bottom-1 right-1 border-2',
    xl: 'w-3.5 h-3.5 bottom-1.5 right-1.5 border-2',
  };

  return (
    <div
      className={cn(
        "relative flex items-center justify-center bg-[#FFD43B] border-[#111111] font-black shrink-0 overflow-hidden select-none",
        dimensions[size] || dimensions.md,
        className
      )}
    >
      {/* Capital Letter K (Shifted slightly left with clear breathing space from pink dot) */}
      <span
        className={cn(
          "text-[#111111] font-extrabold tracking-tighter leading-none flex items-center justify-center translate-y-[-1px] translate-x-[-3px]",
          textSizes[size] || textSizes.md
        )}
        style={{ fontFamily: 'Arial Black, Impact, sans-serif' }}
      >
        K
      </span>

      {/* Official Pink Circular Dot (#FF4D6D) with Breathing Space */}
      <span
        className={cn(
          "absolute rounded-full bg-[#FF4D6D] border-[#111111] shadow-[0.5px_0.5px_0px_0px_#111111]",
          dotSizes[size] || dotSizes.md
        )}
      />
    </div>
  );
}

export function KyvoLogo({ size = 'md', showText = true, href, className }: KyvoLogoProps) {
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
            "font-black tracking-tight text-[#111111] group-hover:scale-105 transition-transform",
            textSizes[size] || textSizes.md
          )}
          style={{ fontFamily: 'Arial Black, Impact, sans-serif' }}
        >
          Kyvo
        </span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
