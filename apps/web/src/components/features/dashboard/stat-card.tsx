import { memo } from 'react';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp, EyeOff, Minus, type LucideIcon } from 'lucide-react';
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
  /** Enable podium styling for ranks 1-3 (gold, silver, bronze) */
  podiumStyle?: boolean;
}

interface TrendIndicatorProps {
  delta: number;
}

/** Get podium glass styling based on rank */
function getPodiumStyle(value: string | number | null): string | undefined {
  if (typeof value !== 'number') return undefined;
  const rank = Math.round(value);
  switch (rank) {
    case 1:
      // Gold - warm amber glow
      return 'bg-amber-500/5 border-amber-500/20 shadow-[inset_0_1px_1px_rgba(251,191,36,0.1)]';
    case 2:
      // Silver - cool slate glow
      return 'bg-slate-300/5 border-slate-400/20 shadow-[inset_0_1px_1px_rgba(148,163,184,0.1)]';
    case 3:
      // Bronze - warm orange glow
      return 'bg-orange-600/5 border-orange-500/20 shadow-[inset_0_1px_1px_rgba(234,88,12,0.1)]';
    default:
      return undefined;
  }
}

function TrendIndicator({ delta }: TrendIndicatorProps): React.ReactNode {
  if (delta === 0) {
    return (
      <span className="inline-flex items-center text-xs text-muted-foreground">
        <Minus className="h-3 w-3" aria-hidden="true" />
      </span>
    );
  }

  const isRankWorse = delta > 0;
  const colorClass = isRankWorse ? 'text-destructive' : 'text-success';
  const Icon = isRankWorse ? ArrowUp : ArrowDown;

  return (
    <span className={cn('inline-flex items-center text-xs', colorClass)}>
      <Icon className="h-3 w-3" aria-hidden="true" />
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
  podiumStyle = false,
}: StatCardProps) {
  const podiumClass = podiumStyle ? getPodiumStyle(value) : undefined;

  return (
    <div
      className={cn(
        'relative rounded-lg border border-border bg-card p-4',
        'transition-colors duration-200 hover:bg-card-hover',
        podiumClass,
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
              {value === null ? (
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <EyeOff className="h-5 w-5" aria-hidden="true" />
                  <span className="text-sm">Non classé</span>
                </span>
              ) : typeof value === 'number' ? (
                <>
                  <span className="text-lg text-muted-foreground">#</span>
                  {value.toFixed(1)}
                </>
              ) : (
                value
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
