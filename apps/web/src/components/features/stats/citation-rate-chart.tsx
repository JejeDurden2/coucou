'use client';

import { memo, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { CHART_MARGIN } from '@/lib/chart-config';
import {
  formatTooltipDate,
  formatVariation,
  getAxisAggregation,
  formatAxisDate,
} from '@/lib/format';

interface CitationRateChartProps {
  data: { date: string; value: number }[];
  average: number;
}

interface ChartEntry {
  date: string;
  label: string;
  value: number;
  previousValue: number | undefined;
}

interface TooltipPayload {
  payload: ChartEntry;
}

function CustomChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}): React.ReactNode {
  if (!active || !payload?.[0]) return null;

  const entry = payload[0].payload;
  const variation = entry.previousValue !== undefined ? entry.value - entry.previousValue : null;

  function getVariationColor(): string {
    if (variation === null) return 'text-muted-foreground';
    if (variation >= 0) return 'text-success';
    return 'text-destructive';
  }

  const variationColor = getVariationColor();

  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-md">
      <p className="text-sm font-medium text-foreground mb-1 text-pretty">
        {formatTooltipDate(entry.date)}
      </p>
      <p className="text-lg font-semibold text-foreground text-pretty">{entry.value.toFixed(1)}%</p>
      <p className={cn('text-xs', variationColor)}>{formatVariation(variation)}</p>
    </div>
  );
}

export const CitationRateChart = memo(function CitationRateChart({
  data,
  average,
}: CitationRateChartProps) {
  const chartData = useMemo(() => {
    if (data.length === 0) return [];

    const aggregation = getAxisAggregation(data);

    return data.map((point, index) => ({
      date: point.date,
      label: formatAxisDate(point.date, aggregation),
      value: point.value,
      previousValue: index > 0 ? data[index - 1].value : undefined,
    }));
  }, [data]);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-1">
            Part de voix IA
            <InfoTooltip term="citationRate" />
          </CardTitle>
          <CardDescription>Aucune donnée pour cette période</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[300px] text-center">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <TrendingUp className="size-6 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="text-sm text-muted-foreground max-w-xs text-pretty">
              Aucune donnée pour cette période
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-1">
          Part de voix IA
          <InfoTooltip term="citationRate" />
        </CardTitle>
        <CardDescription>Pourcentage de requêtes où votre marque est mentionnée</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={CHART_MARGIN}>
              <defs>
                <linearGradient id="citationGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                content={<CustomChartTooltip />}
                cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeOpacity: 0.3 }}
              />
              <ReferenceLine
                y={average}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="5 5"
                strokeOpacity={0.6}
                label={{
                  value: `Moy. ${average.toFixed(0)}%`,
                  position: 'right',
                  fill: 'hsl(var(--muted-foreground))',
                  fontSize: 10,
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#citationGradient)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
});
