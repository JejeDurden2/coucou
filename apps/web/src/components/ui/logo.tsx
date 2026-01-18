import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'text';
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { wrapper: 'h-8', iconSize: 24, text: 'text-lg' },
  md: { wrapper: 'h-10', iconSize: 32, text: 'text-xl' },
  lg: { wrapper: 'h-14', iconSize: 48, text: 'text-2xl' },
};

export function Logo({ className, variant = 'full', size = 'md' }: LogoProps) {
  const { wrapper, iconSize, text } = sizes[size];

  if (variant === 'icon') {
    return (
      <div className={cn('flex items-center', wrapper, className)}>
        <Image src="/logo.svg" alt="Coucou IA" width={iconSize} height={iconSize} />
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <span className={cn('font-bold text-foreground', text, className)}>Coucou IA</span>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', wrapper, className)}>
      <Image src="/logo.svg" alt="Coucou IA" width={iconSize} height={iconSize} />
      <span className={cn('font-bold text-foreground', text)}>Coucou IA</span>
    </div>
  );
}
