import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-900 hover:from-cyan-400 hover:to-cyan-500 shadow-lg shadow-cyan-500/25 font-semibold',
        destructive:
          'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20',
        outline:
          'border border-cyan-500/30 bg-transparent hover:bg-cyan-500/10 hover:border-cyan-500/50 text-foreground',
        secondary:
          'bg-violet-500 text-white hover:bg-violet-600 shadow-lg shadow-violet-500/20',
        ghost: 'hover:bg-cyan-500/10 hover:text-cyan-400',
        link: 'text-cyan-400 underline-offset-4 hover:underline hover:text-cyan-300',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-12 rounded-xl px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
