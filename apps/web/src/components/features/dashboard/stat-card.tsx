import { memo } from 'react';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp, Minus, type LucideIcon } from 'lucide-react';
import { Sparkline } from '@/components/ui/sparkline';

interface StatCardProps {
  label: string;
  value: string | number | null;
  icon: LucideIcon;
  trend?: {
    delta: number;
  };
  sparklineData?: number[];
  gradient?: string;
  valueClassName?: string;
  subtitle?: string;
  className?: string;
}


interface TrendIndicatorProps {
  delta: number;
}

function TrendIndicator({ delta }: TrendIndicatorProps): React.ReactNode {
  if (delta === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" aria-hidden="true" />
      </span>
    );
  }

  const isRankWorse = delta > 0;
  const colorClass = isRankWorse ? 'text-destructive' : 'text-success';
  const Icon = isRankWorse ? ArrowUp : ArrowDown;

  return (
    <span className={cn('inline-flex items-center gap-1 text-xs', colorClass)}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      <span className="tabular-nums">{Math.abs(delta).toFixed(1)}</span>
    </span>
  );
}

export const StatCard = memo(function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  sparklineData,
  gradient: _gradient = 'primary',
  valueClassName,
  subtitle,
  className,
}: StatCardProps) {
  const displayValue = value ?? '—';

  return (
    <div
      className={cn(
        'relative rounded-lg border border-border bg-card p-4',
        'transition-colors duration-200 hover:bg-card-hover',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground mb-1">{label}</p>
          <div className="flex items-baseline gap-2">
            <p
              className={cn(
                'text-2xl font-semibold tabular-nums truncate',
                valueClassName ?? 'text-foreground',
              )}
            >
              {typeof displayValue === 'number' ? (
                <>
                  <span className="text-lg text-muted-foreground">#</span>
                  {displayValue.toFixed(1)}
                </>
              ) : (
                displayValue
              )}
            </p>
            {trend !== undefined && <TrendIndicator delta={trend.delta} />}
          </div>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          {sparklineData && sparklineData.length >= 2 && (
            <div className="mt-2">
              <Sparkline data={sparklineData} color="primary" width={64} height={20} />
            </div>
          )}
        </div>
        <div className="rounded-lg p-2 border border-border bg-muted/50 text-muted-foreground">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
});
