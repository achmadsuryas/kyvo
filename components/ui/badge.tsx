import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-lg border-2 border-[#111111] px-3 py-1 text-xs font-extrabold uppercase tracking-wider transition-colors shadow-[2px_2px_0px_0px_#111111]',
  {
    variants: {
      variant: {
        default: 'bg-[#FFD43B] text-[#111111]',
        primary: 'bg-[#3B82F6] text-white',
        secondary: 'bg-[#FF4D6D] text-white',
        purple: 'bg-[#A855F7] text-white',
        green: 'bg-[#51CF66] text-[#111111]',
        outline: 'bg-white text-[#111111]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
