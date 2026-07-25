'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl border-[3px] border-[#111111] font-black text-sm transition-all duration-150 active:translate-x-0.5 active:translate-y-0.5 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-[#FFD43B] text-[#111111] shadow-[4px_4px_0px_0px_#111111] hover:shadow-[6px_6px_0px_0px_#111111] hover:-translate-x-0.5 hover:-translate-y-0.5',
        primary: 'bg-[#3B82F6] text-white shadow-[4px_4px_0px_0px_#111111] hover:shadow-[6px_6px_0px_0px_#111111] hover:-translate-x-0.5 hover:-translate-y-0.5',
        secondary: 'bg-[#FF4D6D] text-white shadow-[4px_4px_0px_0px_#111111] hover:shadow-[6px_6px_0px_0px_#111111] hover:-translate-x-0.5 hover:-translate-y-0.5',
        yellow: 'bg-[#FFD43B] text-[#111111] shadow-[4px_4px_0px_0px_#111111] hover:shadow-[6px_6px_0px_0px_#111111] hover:-translate-x-0.5 hover:-translate-y-0.5',
        purple: 'bg-[#A855F7] text-white shadow-[4px_4px_0px_0px_#111111] hover:shadow-[6px_6px_0px_0px_#111111] hover:-translate-x-0.5 hover:-translate-y-0.5',
        green: 'bg-[#51CF66] text-[#111111] shadow-[4px_4px_0px_0px_#111111] hover:shadow-[6px_6px_0px_0px_#111111] hover:-translate-x-0.5 hover:-translate-y-0.5',
        outline: 'bg-white text-[#111111] shadow-[4px_4px_0px_0px_#111111] hover:shadow-[6px_6px_0px_0px_#111111] hover:-translate-x-0.5 hover:-translate-y-0.5',
        ghost: 'border-transparent bg-transparent text-[#111111] shadow-none hover:bg-[#FFD43B]/30',
      },
      size: {
        sm: 'h-9 px-3 text-xs',
        default: 'h-11 px-5 text-sm',
        lg: 'h-13 px-7 text-base',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
