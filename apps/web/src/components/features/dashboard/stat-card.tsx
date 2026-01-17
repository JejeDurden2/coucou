import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp, type LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {trend && (
              <div
                className={cn(
                  'flex items-center gap-1 text-sm',
                  trend.isPositive ? 'text-emerald-400' : 'text-rose-400',
                )}
              >
                {trend.isPositive ? (
                  <ArrowUp className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                )}
                <span>{Math.abs(trend.value)}%</span>
                <span className="text-muted-foreground">vs période préc.</span>
              </div>
            )}
          </div>
          <div className="rounded-xl bg-cyan-500/10 p-3 border border-cyan-500/20">
            <Icon className="h-6 w-6 text-cyan-400" aria-hidden="true" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
