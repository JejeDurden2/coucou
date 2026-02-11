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
  Legend,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatChartDate, type AggregationLevel } from '@/lib/format';
import { CHART_COLORS, CHART_MARGIN } from '@/lib/chart-config';

interface CompetitorTrend {
  name: string;
  timeSeries: Array<{ date: string; value: number }>;
}

interface CompetitorChartProps {
  data: CompetitorTrend[];
  aggregation: AggregationLevel;
}

export const CompetitorChart = memo(function CompetitorChart({
  data,
  aggregation,
}: CompetitorChartProps) {
  const { chartData, competitors } = useMemo(() => {
    if (data.length === 0) return { chartData: [], competitors: [] };

    // Get all unique dates
    const allDates = new Set<string>();
    for (const competitor of data) {
      for (const point of competitor.timeSeries) {
        allDates.add(point.date);
      }
    }

    // Sort dates
    const sortedDates = Array.from(allDates).sort();

    // Build chart data
    const chartData = sortedDates.map((date) => {
      const entry: Record<string, string | number> = {
        date,
        label: formatChartDate(date, aggregation),
      };
      for (const competitor of data) {
        const point = competitor.timeSeries.find((p) => p.date === date);
        entry[competitor.name] = point?.value ?? 0;
      }
      return entry;
    });

    return { chartData, competitors: data.map((d) => d.name) };
  }, [data, aggregation]);

  if (competitors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Concurrents</CardTitle>
          <CardDescription>Aucune donnée disponible</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Concurrents</CardTitle>
        <CardDescription>Top 5 concurrents les plus mentionnés</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={CHART_MARGIN}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'var(--foreground)' }}
                formatter={(value, name) => [`${value} mentions`, String(name)]}
              />
              <Legend
                formatter={(value: string) => (
                  <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                    {value}
                  </span>
                )}
              />
              {competitors.map((name, index) => (
                <Area
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stackId="1"
                  stroke={CHART_COLORS[index % CHART_COLORS.length]}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
});
