'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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
  // Responsive dimensions for optimal fit on Mobile vs Tablet vs Desktop
  const dimensions = {
    sm: {
      container: 'w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl border-2 sm:border-3 shadow-[3px_3px_0px_0px_#111111]',
      text: 'text-2xl sm:text-3xl',
      dotClass: 'w-2 h-2 sm:w-2.5 sm:h-2.5',
      orbitClass: 'translate-x-[16px] sm:translate-x-[20px]',
    },
    md: {
      container: 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl border-3 md:border-4 shadow-[4px_4px_0px_0px_#111111] md:shadow-[5px_5px_0px_0px_#111111]',
      text: 'text-3xl sm:text-4xl md:text-5xl',
      dotClass: 'w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4',
      orbitClass: 'translate-x-[22px] sm:translate-x-[28px] md:translate-x-[34px]',
    },
    lg: {
      container: 'w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl sm:rounded-3xl border-3 sm:border-4 shadow-[4px_4px_0px_0px_#111111] sm:shadow-[6px_6px_0px_0px_#111111]',
      text: 'text-4xl sm:text-6xl md:text-6xl',
      dotClass: 'w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5',
      orbitClass: 'translate-x-[26px] sm:translate-x-[38px] md:translate-x-[44px]',
    },
    xl: {
      container: 'w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-2xl sm:rounded-3xl border-3 sm:border-4 md:border-[5px] shadow-[5px_5px_0px_0px_#111111] sm:shadow-[8px_8px_0px_0px_#111111]',
      text: 'text-5xl sm:text-7xl md:text-8xl',
      dotClass: 'w-3.5 h-3.5 sm:w-5 sm:h-5 md:w-6 md:h-6',
      orbitClass: 'translate-x-[32px] sm:translate-x-[44px] md:translate-x-[56px]',
    },
  };

  const currentSize = dimensions[size] || dimensions.lg;

  const content = (
    <div className={cn("relative flex items-center justify-center p-2 select-none", className)}>
      {/* Neobrutalist Kyvo Logo Box */}
      <motion.div
        animate={{
          scale: [1, 1.03, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.6,
          ease: "easeInOut"
        }}
        className={cn(
          "relative flex items-center justify-center bg-[#FFD43B] border-[#111111] font-black overflow-hidden select-none",
          currentSize.container
        )}
      >
        {/* Letter K */}
        <span 
          className={cn("text-[#111111] font-extrabold tracking-tighter leading-none select-none flex items-center justify-center z-10 translate-y-[-1px]", currentSize.text)}
          style={{ fontFamily: 'Arial Black, Impact, sans-serif' }}
        >
          K
        </span>

        {/* Orbiting Container centered over K */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: 1.3,
            ease: "linear"
          }}
        >
          {/* Pink Dot pulsing big and small as it orbits K */}
          <motion.div
            className={cn(
              "absolute rounded-full bg-[#FF4D6D] border-2 border-[#111111] shadow-[1px_1px_0px_0px_#111111]",
              currentSize.dotClass,
              currentSize.orbitClass
            )}
            animate={{
              scale: [0.7, 1.4, 0.7],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.3,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </motion.div>
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
