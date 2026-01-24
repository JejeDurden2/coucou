'use client';

import { memo, type ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus, HelpCircle, type LucideIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type VariationType = 'increase' | 'decrease' | 'neutral';

interface KpiCardProps {
  label: string;
  value: string | number | null;
  variation?: number;
  variationType?: VariationType;
  invertColors?: boolean;
  icon: LucideIcon;
  tooltip?: string;
  className?: string;
}

interface VariationIndicatorProps {
  variation: number;
  variationType: VariationType;
  invertColors: boolean;
}

function VariationIndicator({
  variation,
  variationType,
  invertColors,
}: VariationIndicatorProps): ReactNode {
  const getColorClass = (): string => {
    if (variationType === 'neutral') return 'text-muted-foreground';
    const isPositive = variationType === 'increase';
    if (invertColors) {
      return isPositive ? 'text-destructive' : 'text-success';
    }
    return isPositive ? 'text-success' : 'text-destructive';
  };

  function getIcon(): typeof Minus {
    if (variationType === 'neutral') return Minus;
    if (variationType === 'increase') return TrendingUp;
    return TrendingDown;
  }

  const Icon = getIcon();

  const formattedVariation = Math.abs(variation).toFixed(1);

  function getSign(): string {
    if (variationType === 'increase') return '+';
    if (variationType === 'decrease') return '-';
    return '';
  }

  const sign = getSign();

  return (
    <span className={cn('inline-flex items-center gap-0.5 text-xs font-medium', getColorClass())}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {sign}
      {formattedVariation}%
    </span>
  );
}

export const KpiCard = memo(function KpiCard({
  label,
  value,
  variation,
  variationType = 'neutral',
  invertColors = false,
  icon: Icon,
  tooltip,
  className,
}: KpiCardProps): ReactNode {
  const isInsufficientData = value === null;

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
          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            {label}
            {tooltip && (
              <TooltipProvider>
                <Tooltip delayDuration={150}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      aria-label={`Information sur ${label}`}
                    >
                      <HelpCircle className="size-3.5 text-muted-foreground" aria-hidden="true" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[280px] bg-card border border-border p-3 text-sm">
                    {tooltip}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </p>
          <div className="flex items-baseline gap-2">
            {isInsufficientData ? (
              <TooltipProvider>
                <Tooltip delayDuration={150}>
                  <TooltipTrigger asChild>
                    <span className="text-2xl font-semibold tabular-nums text-muted-foreground cursor-help">
                      —
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[280px] bg-card border border-border p-3 text-sm">
                    Données insuffisantes pour cette période
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <span className="text-2xl font-semibold tabular-nums text-foreground truncate">
                {value}
              </span>
            )}
            {variation !== undefined && !isInsufficientData && (
              <VariationIndicator
                variation={variation}
                variationType={variationType}
                invertColors={invertColors}
              />
            )}
          </div>
        </div>
        <div className="rounded-lg p-2 border border-border bg-muted/50 text-muted-foreground">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
});

interface KpiCardGridProps {
  children: ReactNode;
  className?: string;
}

export function KpiCardGrid({ children, className }: KpiCardGridProps): ReactNode {
  return <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>{children}</div>;
}
