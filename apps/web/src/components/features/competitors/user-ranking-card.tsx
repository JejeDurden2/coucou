'use client';

import { memo, useId, useMemo } from 'react';
import { Trophy, EyeOff, ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import type { Trend, TimeSeriesPoint } from '@coucou-ia/shared';

import { cn } from '@/lib/utils';
import { getPodiumStyle } from '@/lib/podium-style';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { formatChartDate } from '@/lib/format';

interface UserRankingCardProps {
  userRank: number | null;
  totalBrands: number;
  trend?: Trend;
  sparklineData?: TimeSeriesPoint[];
  className?: string;
}

function DeltaIndicator({ delta }: { delta: number }): React.ReactNode {
  if (Math.abs(delta) < 0.1) {
    return (
      <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <Minus className="size-4" aria-hidden="true" />
      </span>
    );
  }

  const isImprovement = delta < 0;
  const Icon = isImprovement ? ArrowDown : ArrowUp;
  const colorClass = isImprovement ? 'text-success' : 'text-destructive';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-sm font-medium tabular-nums',
        colorClass,
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
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

export const UserRankingCard = memo(function UserRankingCard({
  userRank,
  totalBrands,
  trend,
  sparklineData,
  className,
}: UserRankingCardProps) {
  const gradientId = useId();
  const chartData = useMemo(() => {
    if (!sparklineData || sparklineData.length < 2) return null;
    return sparklineData.map((point) => ({
      date: point.date,
      label: formatChartDate(point.date, 'day'),
      value: point.value,
    }));
  }, [sparklineData]);

  const isFirst = userRank === 1;
  const podiumClass = getPodiumStyle(userRank);

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
          <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1 text-pretty">
            Votre classement
            <InfoTooltip term="position" />
          </p>

          <div className="flex items-baseline gap-3">
            {userRank === null ? (
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <EyeOff className="size-8" aria-hidden="true" />
                <span className="text-lg">Non classé</span>
              </span>
            ) : (
              <p
                className={cn(
                  'text-4xl font-bold tabular-nums',
                  isFirst ? 'text-success' : 'text-foreground',
                )}
              >
                <span
                  className={cn('text-2xl', isFirst ? 'text-success/70' : 'text-muted-foreground')}
                >
                  #
                </span>
                {userRank}
              </p>
            )}
            {trend && userRank !== null && <DeltaIndicator delta={trend.delta} />}
          </div>

          {userRank !== null && (
            <p className="text-xs text-muted-foreground mt-1 text-pretty">
              sur {totalBrands} marques
            </p>
          )}
        </div>

        <div className="rounded-lg p-3 border border-border bg-muted/50 text-muted-foreground">
          <Trophy className="size-8" aria-hidden="true" />
        </div>
      </div>

      {chartData && userRank !== null && (
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
