import * as React from 'react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'yellow' | 'pink' | 'green' | 'purple' | 'blue';
}

export function Alert({ className = '', variant = 'yellow', children, ...props }: AlertProps) {
  const variantStyles = {
    yellow: 'bg-[#FFD43B] text-[#111111]',
    pink: 'bg-[#FF4D6D] text-white',
    green: 'bg-[#51CF66] text-[#111111]',
    purple: 'bg-[#A855F7] text-white',
    blue: 'bg-[#3B82F6] text-white',
    default: 'bg-white text-[#111111]',
  };

  return (
    <div
      role="alert"
      className={`rounded-2xl border-[3px] border-[#111111] p-4 shadow-[4px_4px_0px_0px_#111111] ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function AlertTitle({ className = '', children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5 className={`font-black text-base leading-none tracking-tight flex items-center gap-2 mb-1 ${className}`} {...props}>
      {children}
    </h5>
  );
}

export function AlertDescription({ className = '', children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div className={`text-xs font-bold leading-relaxed opacity-95 ${className}`} {...props}>
      {children}
    </div>
  );
}
