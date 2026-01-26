import { cn } from '@/lib/utils';

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

interface BentoItemProps {
  children: React.ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps): React.ReactNode {
  return (
    <div className={cn('grid grid-cols-2 gap-4 lg:grid-cols-4 lg:grid-flow-dense', className)}>
      {children}
    </div>
  );
}

export function BentoItem({ children, className }: BentoItemProps): React.ReactNode {
  return <div className={cn('min-h-0', className)}>{children}</div>;
}
