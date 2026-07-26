'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KyvoLoader } from '@/components/ui/kyvo-loader';

export function WelcomeScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 5 seconds smooth progress timer (0% to 100%)
    const startTime = Date.now();
    const duration = 5000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);

      if (elapsed >= duration) {
        clearInterval(interval);
        setTimeout(() => {
          setIsVisible(false);
        }, 150);
      }
    }, 40);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="welcome-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] bg-[#F8F9FA] bg-grid-lines flex flex-col items-center justify-center p-4 selection:bg-[#FFD43B]"
        >
          {/* Static Logo Loader with Progress Bar */}
          <div className="flex flex-col items-center gap-6">
            <KyvoLoader size="lg" progress={progress} autoProgress={false} />

            {/* Neobrutalist Welcome Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center gap-2.5 bg-[#FFD43B] border-[3px] border-[#111111] px-5 py-2 rounded-full shadow-[4px_4px_0px_0px_#111111]"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF4D6D] border border-[#111111]" />
              <span className="text-[#111111] font-black text-xs sm:text-sm tracking-wider uppercase">
                Welcome to Kyvo
              </span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
