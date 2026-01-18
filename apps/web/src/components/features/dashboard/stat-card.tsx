import { memo } from 'react';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp, Minus, type LucideIcon } from 'lucide-react';
import { Sparkline } from '@/components/ui/sparkline';

const STAT_GRADIENTS = {
  gold: 'from-amber-500/15 via-yellow-500/5 to-transparent border-amber-500/20',
  primary: 'from-primary/15 via-primary/5 to-transparent border-primary/20',
  secondary: 'from-secondary/15 via-secondary/5 to-transparent border-secondary/20',
  chatgpt: 'from-chatgpt/15 via-chatgpt/5 to-transparent border-chatgpt/20',
  claude: 'from-claude/15 via-claude/5 to-transparent border-claude/20',
  success: 'from-success/15 via-success/5 to-transparent border-success/20',
  // Legacy aliases
  emerald: 'from-success/15 via-success/5 to-transparent border-success/20',
  orange: 'from-secondary/15 via-secondary/5 to-transparent border-secondary/20',
  cyan: 'from-chatgpt/15 via-chatgpt/5 to-transparent border-chatgpt/20',
  violet: 'from-primary/15 via-primary/5 to-transparent border-primary/20',
} as const;

const ICON_COLORS = {
  gold: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  primary: 'bg-primary/10 border-primary/20 text-primary',
  secondary: 'bg-secondary/10 border-secondary/20 text-secondary',
  chatgpt: 'bg-chatgpt/10 border-chatgpt/20 text-chatgpt',
  claude: 'bg-claude/10 border-claude/20 text-claude',
  success: 'bg-success/10 border-success/20 text-success',
  // Legacy aliases
  emerald: 'bg-success/10 border-success/20 text-success',
  orange: 'bg-secondary/10 border-secondary/20 text-secondary',
  cyan: 'bg-chatgpt/10 border-chatgpt/20 text-chatgpt',
  violet: 'bg-primary/10 border-primary/20 text-primary',
} as const;

const SPARKLINE_COLORS = {
  gold: 'primary',
  primary: 'primary',
  secondary: 'secondary',
  chatgpt: 'chatgpt',
  claude: 'claude',
  success: 'success',
  emerald: 'success',
  orange: 'secondary',
  cyan: 'chatgpt',
  violet: 'primary',
} as const;

type GradientVariant = keyof typeof STAT_GRADIENTS;

interface StatCardProps {
  label: string;
  value: string | number | null;
  icon: LucideIcon;
  trend?: {
    delta: number;
  };
  sparklineData?: number[];
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
  sparklineData,
  gradient = 'primary',
  valueClassName,
  subtitle,
  className,
}: StatCardProps) {
  const gradientClass = STAT_GRADIENTS[gradient];
  const iconColorClass = ICON_COLORS[gradient];
  const sparklineColor = SPARKLINE_COLORS[gradient];
  const displayValue = value ?? '—';

  return (
    <div
      className={cn(
        'relative rounded-lg border bg-gradient-to-br p-4',
        'transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/5 motion-reduce:hover:scale-100',
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
          {sparklineData && sparklineData.length >= 2 && (
            <div className="mt-2">
              <Sparkline data={sparklineData} color={sparklineColor} width={64} height={20} />
            </div>
          )}
        </div>
        <div className={cn('rounded-lg p-2 border', iconColorClass)}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
});
