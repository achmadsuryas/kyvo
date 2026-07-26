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
    sm: { container: 'w-12 h-12 rounded-xl border-2 shadow-[3px_3px_0px_0px_#111111]', text: 'text-2xl', dot: 12, orbitRadius: 36 },
    md: { container: 'w-20 h-20 rounded-2xl border-3 shadow-[5px_5px_0px_0px_#111111]', text: 'text-4xl', dot: 16, orbitRadius: 58 },
    lg: { container: 'w-28 h-28 rounded-3xl border-4 shadow-[6px_6px_0px_0px_#111111]', text: 'text-6xl', dot: 20, orbitRadius: 78 },
    xl: { container: 'w-36 h-36 rounded-3xl border-4 shadow-[8px_8px_0px_0px_#111111]', text: 'text-7xl', dot: 24, orbitRadius: 98 },
  };

  const currentSize = dimensions[size] || dimensions.lg;

  const content = (
    <div className={cn("relative flex items-center justify-center p-8 select-none", className)}>
      {/* Orbiting Container (Positioned outside the yellow box) */}
      <motion.div
        className="absolute flex items-center justify-center pointer-events-none z-20"
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 1.6,
          ease: "linear"
        }}
      >
        {/* Pink Dot with Pulse Effect */}
        <motion.div
          className="absolute rounded-full bg-[#FF4D6D] border-2 border-[#111111] shadow-[2px_2px_0px_0px_#111111]"
          style={{
            width: currentSize.dot,
            height: currentSize.dot,
            transform: `translate(${currentSize.orbitRadius}px, 0px)`
          }}
          animate={{
            scale: [1, 1.35, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.2,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* Neobrutalist Kyvo Logo Box with Subtle Pulse */}
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
          "relative flex items-center justify-center bg-[#FFD43B] border-[#111111] font-black z-10",
          currentSize.container
        )}
      >
        {/* Letter K */}
        <span 
          className={cn("text-[#111111] font-extrabold tracking-tighter leading-none translate-y-[-1px]", currentSize.text)}
          style={{ fontFamily: 'Arial Black, Impact, sans-serif' }}
        >
          K
        </span>
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
