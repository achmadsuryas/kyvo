import * as React from 'react';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-2xl border-2 border-[#111111] bg-[#E5E7EB] shadow-[3px_3px_0px_0px_#111111] ${className || ''}`}
      {...props}
    />
  );
}
