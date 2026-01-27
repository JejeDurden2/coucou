import { cn } from '@/lib/utils';

interface PulsingDotProps {
  color: 'primary' | 'success' | 'cyan';
  size?: 'sm' | 'md';
}

const DOT_COLORS: Record<PulsingDotProps['color'], string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  cyan: 'bg-chatgpt',
};

const DOT_SIZES: Record<NonNullable<PulsingDotProps['size']>, string> = {
  sm: 'size-2',
  md: 'size-3',
};

export function PulsingDot({ color, size = 'sm' }: PulsingDotProps): React.ReactNode {
  const colorClass = DOT_COLORS[color];
  const sizeClass = DOT_SIZES[size];

  return (
    <span className={cn('relative flex', sizeClass)}>
      <span
        className={cn(
          'animate-ping absolute size-full rounded-full opacity-75 motion-reduce:animate-none',
          colorClass,
        )}
      />
      <span className={cn('relative rounded-full size-full', colorClass)} />
    </span>
  );
}
