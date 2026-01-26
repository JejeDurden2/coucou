'use client';

import { memo, useId, useMemo } from 'react';
import { Trophy, ArrowDown, ArrowUp, Minus, EyeOff } from 'lucide-react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import type { Trend, TimeSeriesPoint } from '@coucou-ia/shared';

import { cn } from '@/lib/utils';
import { getPodiumStyle } from '@/lib/podium-style';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { formatChartDate } from '@/lib/format';

interface PositionCardProps {
  averageRank: number | null;
  trend?: Trend;
  sparklineData?: TimeSeriesPoint[];
  className?: string;
}

function DeltaIndicator({ delta }: { delta: number }): React.ReactNode {
  if (Math.abs(delta) < 0.1) {
    return (
      <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <Minus className="h-4 w-4" aria-hidden="true" />
      </span>
    );
  }

  const isImprovement = delta < 0;
  const Icon = isImprovement ? ArrowDown : ArrowUp;
  const colorClass = isImprovement ? 'text-success' : 'text-destructive';

  return (
    <span className={cn('inline-flex items-center gap-0.5 text-sm font-medium', colorClass)}>
      <Icon className="h-4 w-4" aria-hidden="true" />
      {Math.abs(delta).toFixed(1)}
    </span>
  );
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: { label: string; value: number } }>;
}

function ChartTooltip({ active, payload }: ChartTooltipProps): React.ReactNode {
  if (!active || !payload?.[0]) return null;

  const { label, value } = payload[0].payload;

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs shadow-md">
      <span className="text-muted-foreground">{label}</span>
      <span className="mx-1.5 text-muted-foreground">—</span>
      <span className="font-semibold tabular-nums text-foreground">#{value.toFixed(1)}</span>
    </div>
  );
}

export const PositionCard = memo(function PositionCard({
  averageRank,
  trend,
  sparklineData,
  className,
}: PositionCardProps) {
  const gradientId = useId();
  const chartData = useMemo(() => {
    if (!sparklineData || sparklineData.length < 2) return null;
    return sparklineData.map((point) => ({
      date: point.date,
      label: formatChartDate(point.date, 'day'),
      value: point.value,
    }));
  }, [sparklineData]);

  const podiumClass = getPodiumStyle(averageRank);

  return (
    <div
      className={cn(
        'relative rounded-lg border border-border bg-card p-6 h-full',
        'transition-colors duration-200 hover:bg-card-hover',
        'flex flex-col',
        podiumClass,
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
            Position moyenne
            <InfoTooltip term="position" />
          </p>

          <div className="flex items-baseline gap-3">
            {averageRank === null ? (
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <EyeOff className="h-8 w-8" aria-hidden="true" />
                <span className="text-lg">Non classé</span>
              </span>
            ) : (
              <p className="text-4xl font-bold tabular-nums text-foreground">
                <span className="text-2xl text-muted-foreground">#</span>
                {averageRank.toFixed(1)}
              </p>
            )}
            {trend && averageRank !== null && <DeltaIndicator delta={trend.delta} />}
          </div>

          {trend && averageRank !== null && (
            <p className="text-xs text-muted-foreground mt-1">vs 7 derniers jours</p>
          )}
        </div>

        <div className="rounded-lg p-3 border border-border bg-muted/50 text-muted-foreground">
          <Trophy className="h-8 w-8" aria-hidden="true" />
        </div>
      </div>

      {chartData && averageRank !== null && (
        <div className="mt-auto pt-4">
          <ResponsiveContainer width="100%" height={60}>
            <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip content={<ChartTooltip />} cursor={false} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill={`url(#${gradientId})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
});
