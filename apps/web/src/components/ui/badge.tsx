import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
        secondary: 'bg-violet-500/20 text-violet-400 border border-violet-500/30',
        success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
        destructive: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
        outline: 'border border-cyan-500/30 text-foreground',
        muted: 'bg-muted text-muted-foreground border border-muted',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
