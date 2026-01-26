import { memo } from 'react';
import { cn } from '@/lib/utils';
import { getPodiumStyle } from '@/lib/podium-style';
import { ArrowDown, ArrowUp, EyeOff, Minus, type LucideIcon } from 'lucide-react';
import { Sparkline } from '@/components/ui/sparkline';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { type GlossaryTerm } from '@coucou-ia/shared';

interface StatCardProps {
  label: string;
  value: string | number | null;
  icon: LucideIcon;
  trend?: {
    delta: number;
  };
  sparklineData?: number[];
  valueClassName?: string;
  subtitle?: string;
  className?: string;
  podiumStyle?: boolean;
  tooltipTerm?: GlossaryTerm;
  size?: 'default' | 'large';
}

interface TrendIndicatorProps {
  delta: number;
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

function StatValue({
  value,
  isLarge,
}: {
  value: string | number | null;
  isLarge: boolean;
}): React.ReactNode {
  if (value === null) {
    return (
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <EyeOff className={isLarge ? 'h-8 w-8' : 'h-5 w-5'} aria-hidden="true" />
        <span className={isLarge ? 'text-lg' : 'text-sm'}>Non classé</span>
      </span>
    );
  }

  if (typeof value === 'number') {
    return (
      <>
        <span className={cn('text-muted-foreground', isLarge ? 'text-3xl' : 'text-lg')}>#</span>
        {value.toFixed(1)}
      </>
    );
  }

  return value;
}

export const StatCard = memo(function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  sparklineData,
  valueClassName,
  subtitle,
  className,
  podiumStyle = false,
  tooltipTerm,
  size = 'default',
}: StatCardProps) {
  const podiumClass = podiumStyle
    ? getPodiumStyle(typeof value === 'number' ? value : null)
    : undefined;
  const isLarge = size === 'large';

  return (
    <div
      className={cn(
        'relative rounded-lg border border-border bg-card h-full',
        'transition-colors duration-200 hover:bg-card-hover',
        isLarge ? 'p-6' : 'p-4',
        podiumClass,
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3 h-full">
        <div className="flex-1 min-w-0 flex flex-col">
          <p
            className={cn(
              'text-muted-foreground mb-1 flex items-center gap-1',
              isLarge ? 'text-sm' : 'text-xs',
            )}
          >
            {label}
            {tooltipTerm && <InfoTooltip term={tooltipTerm} />}
          </p>
          <div className="flex items-baseline gap-2">
            <p
              className={cn(
                'font-semibold tabular-nums truncate',
                isLarge ? 'text-5xl' : 'text-2xl',
                valueClassName ?? 'text-foreground',
              )}
            >
              <StatValue value={value} isLarge={isLarge} />
            </p>
            {trend !== undefined && <TrendIndicator delta={trend.delta} />}
          </div>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          {sparklineData && sparklineData.length >= 2 && (
            <div className={cn('mt-auto', isLarge ? 'pt-4' : 'pt-2')}>
              <Sparkline
                data={sparklineData}
                color="primary"
                width={isLarge ? 160 : 64}
                height={isLarge ? 40 : 20}
              />
            </div>
          )}
        </div>
        <div
          className={cn(
            'rounded-lg border border-border bg-muted/50 text-muted-foreground',
            isLarge ? 'p-3' : 'p-2',
          )}
        >
          <Icon className={isLarge ? 'h-8 w-8' : 'h-5 w-5'} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
});
