'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface KyvoLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  progress?: number;
  autoProgress?: boolean;
  className?: string;
  fullScreen?: boolean;
}

export function KyvoLoader({
  size = 'lg',
  progress: customProgress,
  autoProgress = true,
  className,
  fullScreen = false,
}: KyvoLoaderProps) {
  const [internalProgress, setInternalProgress] = React.useState(10);

  React.useEffect(() => {
    if (customProgress !== undefined) return;
    if (!autoProgress) return;

    // Fast, continuous progress timer from 10% to 100%
    setInternalProgress(15);
    const interval = setInterval(() => {
      setInternalProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const step = Math.floor(Math.random() * 20) + 12;
        return Math.min(100, prev + step);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [customProgress, autoProgress]);

  const activeProgress = customProgress !== undefined ? customProgress : internalProgress;

  const dimensions = {
    sm: {
      container: 'w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl border-2 sm:border-3 shadow-[3px_3px_0px_0px_#111111]',
      text: 'text-2xl sm:text-3xl',
      progressWidth: 'w-36',
    },
    md: {
      container: 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl border-3 md:border-4 shadow-[4px_4px_0px_0px_#111111] md:shadow-[5px_5px_0px_0px_#111111]',
      text: 'text-3xl sm:text-4xl md:text-5xl',
      progressWidth: 'w-48 sm:w-56',
    },
    lg: {
      container: 'w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl sm:rounded-3xl border-3 sm:border-4 shadow-[4px_4px_0px_0px_#111111] sm:shadow-[6px_6px_0px_0px_#111111]',
      text: 'text-4xl sm:text-6xl md:text-6xl',
      progressWidth: 'w-56 sm:w-72',
    },
    xl: {
      container: 'w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-2xl sm:rounded-3xl border-3 sm:border-4 md:border-[5px] shadow-[5px_5px_0px_0px_#111111] sm:shadow-[8px_8px_0px_0px_#111111]',
      text: 'text-5xl sm:text-7xl md:text-8xl',
      progressWidth: 'w-64 sm:w-80',
    },
  };

  const currentSize = dimensions[size] || dimensions.lg;

  const content = (
    <div className={cn("relative flex flex-col items-center justify-center gap-6 p-4 select-none", className)}>
      {/* Static Neobrutalist Kyvo Logo Box (Clean & static) */}
      <div
        className={cn(
          "relative flex items-center justify-center bg-[#FFD43B] border-[#111111] font-black overflow-hidden select-none",
          currentSize.container
        )}
      >
        {/* Letter K */}
        <span 
          className={cn("text-[#111111] font-extrabold tracking-tighter leading-none select-none flex items-center justify-center translate-y-[-1px]", currentSize.text)}
          style={{ fontFamily: 'Arial Black, Impact, sans-serif' }}
        >
          K
        </span>
      </div>

      {/* Neobrutalism Progress Bar Component */}
      <div className={cn("space-y-1.5 text-center", currentSize.progressWidth)}>
        <Progress value={activeProgress} />
        <div className="flex items-center justify-between text-[11px] font-black text-[#111111] px-1">
          <span>LOADING</span>
          <span>{Math.round(activeProgress)}%</span>
        </div>
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
