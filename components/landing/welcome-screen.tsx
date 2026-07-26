'use client';

import { useState, useEffect } from 'react';
import { KyvoLoader } from '@/components/ui/kyvo-loader';

export function WelcomeScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 5 seconds display duration
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
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

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-[#F8F9FA] bg-grid-lines flex flex-col items-center justify-center p-4 selection:bg-[#FFD43B] select-none">
      <div className="flex flex-col items-center gap-6">
        <KyvoLoader size="lg" />

        <div className="flex items-center gap-2.5 bg-[#FFD43B] border-[3px] border-[#111111] px-5 py-2 rounded-full shadow-[4px_4px_0px_0px_#111111]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF4D6D] border border-[#111111]" />
          <span className="text-[#111111] font-black text-xs sm:text-sm tracking-wider uppercase">
            Welcome to Kyvo
          </span>
        </div>
      </div>
    </div>
  );
}
