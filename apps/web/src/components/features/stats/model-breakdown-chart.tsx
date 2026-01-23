'use client';

import { memo, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import type { TimeSeriesPoint } from '@coucou-ia/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatChartDate, type AggregationLevel } from '@/lib/format';

interface ModelBreakdownChartProps {
  data: Record<string, TimeSeriesPoint[]>;
  aggregation: AggregationLevel;
}

const MODEL_COLORS: Record<string, string> = {
  'gpt-4o-mini': 'hsl(var(--chatgpt))',
  'gpt-4o': 'hsl(142 76% 36%)',
  'gpt-5.2': 'hsl(142 76% 28%)',
  'claude-sonnet-4-20250514': 'hsl(var(--claude))',
  'claude-opus-4-5-20251101': 'hsl(24 94% 40%)',
};

const MODEL_LABELS: Record<string, string> = {
  'gpt-4o-mini': 'GPT-4o Mini',
  'gpt-4o': 'GPT-4o',
  'gpt-5.2': 'GPT-5.2',
  'claude-sonnet-4-20250514': 'Claude Sonnet 4',
  'claude-opus-4-5-20251101': 'Claude Opus 4.5',
};

export const ModelBreakdownChart = memo(function ModelBreakdownChart({
  data,
  aggregation,
}: ModelBreakdownChartProps) {
  const { chartData, models } = useMemo(() => {
    const modelKeys = Object.keys(data);
    if (modelKeys.length === 0) return { chartData: [], models: [] };

    // Get all unique dates
    const allDates = new Set<string>();
    for (const points of Object.values(data)) {
      for (const point of points) {
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
      for (const model of modelKeys) {
        const point = data[model].find((p) => p.date === date);
        if (point) {
          entry[model] = point.value;
        }
      }
      return entry;
    });

    return { chartData, models: modelKeys };
  }, [data, aggregation]);

  if (models.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rang par modèle</CardTitle>
          <CardDescription>Aucune donnée disponible</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Rang par modèle</CardTitle>
        <CardDescription>Évolution du rang par modèle d'IA</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                domain={[1, 7]}
                reversed
                tickFormatter={(v) => `#${v}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value, name) => [
                  `#${Number(value).toFixed(1)}`,
                  MODEL_LABELS[String(name)] ?? name,
                ]}
              />
              <Legend
                formatter={(value: string) => (
                  <span className="text-xs text-muted-foreground">
                    {MODEL_LABELS[value] ?? value}
                  </span>
                )}
              />
              {models.map((model) => (
                <Line
                  key={model}
                  type="monotone"
                  dataKey={model}
                  stroke={MODEL_COLORS[model] ?? 'hsl(var(--muted-foreground))'}
                  strokeWidth={2}
                  dot={{
                    fill: MODEL_COLORS[model] ?? 'hsl(var(--muted-foreground))',
                    strokeWidth: 0,
                    r: 2,
                  }}
                  activeDot={{ r: 4 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
});
