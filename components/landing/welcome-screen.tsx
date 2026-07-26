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
    <div className="fixed inset-0 z-[9999] bg-[#F8F9FA] bg-grid-lines flex items-center justify-center p-4 selection:bg-[#FFD43B] select-none">
      <KyvoLoader size="lg" />
    </div>
  );
}
