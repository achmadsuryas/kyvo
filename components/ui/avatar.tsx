'use client';

import * as React from 'react';
import Image from 'next/image';

interface AvatarProps {
  src?: string | null;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ src, fallback = 'K', size = 'md', className = '' }: AvatarProps) {
  const [imgError, setImgError] = React.useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl',
  }[size];

  // Generate 2-letter initials from fallback string (e.g. "Achmad Surya" -> "AS", "kyvo" -> "KY")
  const getInitials = (name: string) => {
    const clean = name.trim().replace(/^@/, '');
    if (!clean) return 'KY';
    const parts = clean.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(fallback);
  const showImage = src && !imgError;

  return (
    <div
      className={`relative rounded-full border-[3px] border-[#111111] overflow-hidden flex items-center justify-center font-black select-none shrink-0 shadow-[2px_2px_0px_0px_#111111] ${sizeClasses} ${className}`}
      style={{ backgroundColor: '#FFD43B' }}
    >
      {showImage ? (
        <Image
          src={src!}
          alt={fallback}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
          onError={() => setImgError(true)}
          unoptimized
        />
      ) : (
        <span className="text-[#111111] uppercase font-black tracking-wider">{initials}</span>
      )}
    </div>
  );
}
