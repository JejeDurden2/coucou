import { memo } from 'react';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp, Minus, type LucideIcon } from 'lucide-react';

const STAT_GRADIENTS = {
  gold: 'from-amber-500/15 via-yellow-500/5 to-transparent border-amber-500/20',
  emerald: 'from-emerald-500/15 via-green-500/5 to-transparent border-emerald-500/20',
  orange: 'from-orange-500/15 via-amber-600/5 to-transparent border-orange-500/20',
  cyan: 'from-cyan-500/15 via-blue-500/5 to-transparent border-cyan-500/20',
  violet: 'from-violet-500/15 via-purple-500/5 to-transparent border-violet-500/20',
} as const;

const ICON_COLORS = {
  gold: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  orange: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
  cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
  violet: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
} as const;

type GradientVariant = keyof typeof STAT_GRADIENTS;

interface StatCardProps {
  label: string;
  value: string | number | null;
  icon: LucideIcon;
  trend?: {
    delta: number;
  };
  gradient?: GradientVariant;
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
        stable
      </span>
    );
  }

  const isRankWorse = delta > 0;
  const colorClass = isRankWorse ? 'text-rose-400' : 'text-emerald-400';
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
  gradient = 'cyan',
  valueClassName,
  subtitle,
  className,
}: StatCardProps) {
  const gradientClass = STAT_GRADIENTS[gradient];
  const iconColorClass = ICON_COLORS[gradient];
  const displayValue = value ?? '—';

  return (
    <div
      className={cn(
        'relative rounded-lg border bg-gradient-to-br p-4',
        'transition-transform duration-200 hover:scale-[1.02] motion-reduce:hover:scale-100',
        gradientClass,
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
        </div>
        <div className={cn('rounded-lg p-2 border', iconColorClass)}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
});
