'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { KyvoLogoIcon } from '@/components/shared/kyvo-logo';

interface KyvoLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fullScreen?: boolean;
}

export function KyvoLoader({
  size = 'lg',
  className,
  fullScreen = false,
}: KyvoLoaderProps) {
  const content = (
    <div className={cn("relative flex flex-col items-center justify-center gap-4 p-4 select-none", className)}>
      {/* Official Kyvo K. Logo Icon Box */}
      <KyvoLogoIcon size={size === 'sm' ? 'md' : size === 'md' ? 'lg' : 'xl'} />

      {/* Clean Badge COOKING... (No dot in front!) */}
      <div className="bg-[#FFD43B] border-2 border-[#111111] px-5 py-1.5 rounded-xl shadow-[3px_3px_0px_0px_#111111]">
        <span className="font-black text-sm sm:text-base tracking-widest uppercase text-[#111111]">
          COOKING...
        </span>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen w-full bg-[#F8F9FA] bg-grid-lines flex items-center justify-center p-4">
        {content}
      </div>
    );
  }

  return content;
}
