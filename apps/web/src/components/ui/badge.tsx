import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary/20 text-primary border border-primary/30',
        secondary: 'bg-secondary/20 text-secondary border border-secondary/30',
        success: 'bg-success/20 text-success border border-success/30',
        destructive: 'bg-destructive/20 text-destructive border border-destructive/30',
        warning: 'bg-warning/20 text-warning border border-warning/30',
        outline: 'border border-primary/30 text-foreground',
        muted: 'bg-muted text-muted-foreground border border-border',
        // LLM-specific variants
        chatgpt: 'bg-chatgpt/20 text-chatgpt border border-chatgpt/30',
        claude: 'bg-claude/20 text-claude border border-claude/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
