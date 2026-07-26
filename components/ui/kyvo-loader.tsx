'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface KyvoLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

export function KyvoLoader({
  size = 'lg',
  text,
  className,
  fullScreen = false,
}: KyvoLoaderProps) {
  const dimensions = {
    sm: { container: 'w-12 h-12 rounded-xl border-2 shadow-[2px_2px_0px_0px_#111111]', text: 'text-2xl', dot: 10, orbitRadius: 18 },
    md: { container: 'w-20 h-20 rounded-2xl border-3 shadow-[4px_4px_0px_0px_#111111]', text: 'text-4xl', dot: 14, orbitRadius: 28 },
    lg: { container: 'w-28 h-28 rounded-3xl border-4 shadow-[6px_6px_0px_0px_#111111]', text: 'text-6xl', dot: 18, orbitRadius: 40 },
    xl: { container: 'w-36 h-36 rounded-3xl border-4 shadow-[8px_8px_0px_0px_#111111]', text: 'text-7xl', dot: 22, orbitRadius: 52 },
  };

  const currentSize = dimensions[size] || dimensions.lg;

  const content = (
    <div className={cn("flex flex-col items-center justify-center gap-5 select-none", className)}>
      {/* Neobrutalist Kyvo Logo Box */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "relative flex items-center justify-center bg-[#FFD43B] border-[#111111] font-black",
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

        {/* Orbiting Container for Pink Dot */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: 1.3,
            ease: "linear"
          }}
        >
          {/* Pink Dot orbiting the K */}
          <motion.div
            className="absolute rounded-full bg-[#FF4D6D] border-2 border-[#111111] shadow-[1px_1px_0px_0px_#111111]"
            style={{
              width: currentSize.dot,
              height: currentSize.dot,
              transform: `translate(${currentSize.orbitRadius}px, 0px)`
            }}
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.3,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </motion.div>

      {/* Optional Loading Label */}
      {text && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[#111111] font-extrabold text-xs tracking-wider uppercase bg-white border-2 border-[#111111] px-4 py-1.5 rounded-full shadow-[3px_3px_0px_0px_#111111]"
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen w-full bg-[#F8F9FA] flex flex-col items-center justify-center p-4">
        {content}
      </div>
    );
  }

  return content;
}
