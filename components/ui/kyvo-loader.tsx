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
  const dimensions = {
    sm: { container: 'w-14 h-14 rounded-2xl border-3 shadow-[3px_3px_0px_0px_#111111]', text: 'text-3xl', dot: 12, orbitRadius: 20 },
    md: { container: 'w-22 h-22 rounded-2xl border-4 shadow-[5px_5px_0px_0px_#111111]', text: 'text-5xl', dot: 16, orbitRadius: 30 },
    lg: { container: 'w-32 h-32 rounded-3xl border-4 shadow-[6px_6px_0px_0px_#111111]', text: 'text-6xl', dot: 20, orbitRadius: 40 },
    xl: { container: 'w-40 h-40 rounded-3xl border-[5px] shadow-[8px_8px_0px_0px_#111111]', text: 'text-7xl', dot: 24, orbitRadius: 50 },
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
            className="absolute rounded-full bg-[#FF4D6D] border-2 border-[#111111] shadow-[1px_1px_0px_0px_#111111]"
            style={{
              width: currentSize.dot,
              height: currentSize.dot,
              left: `calc(50% + ${currentSize.orbitRadius}px - ${currentSize.dot / 2}px)`,
              top: `calc(50% - ${currentSize.dot / 2}px)`,
            }}
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
      <div className="min-h-screen w-full bg-[#F8F9FA] flex items-center justify-center p-4">
        {content}
      </div>
    );
  }

  return content;
}
