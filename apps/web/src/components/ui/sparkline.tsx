import { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  strokeWidth?: number;
  color?: 'primary' | 'secondary' | 'success' | 'destructive' | 'chatgpt' | 'claude';
  showArea?: boolean;
  className?: string;
}

const SPARKLINE_COLORS = {
  primary: { stroke: 'rgb(var(--primary))', fill: 'rgb(var(--primary) / 0.1)' },
  secondary: { stroke: 'rgb(var(--secondary))', fill: 'rgb(var(--secondary) / 0.1)' },
  success: { stroke: 'rgb(var(--success))', fill: 'rgb(var(--success) / 0.1)' },
  destructive: { stroke: 'rgb(var(--destructive))', fill: 'rgb(var(--destructive) / 0.1)' },
  chatgpt: { stroke: 'rgb(var(--chatgpt))', fill: 'rgb(var(--chatgpt) / 0.1)' },
  claude: { stroke: 'rgb(var(--claude))', fill: 'rgb(var(--claude) / 0.1)' },
} as const;

export const Sparkline = memo(function Sparkline({
  data,
  width = 80,
  height = 24,
  strokeWidth = 1.5,
  color = 'primary',
  showArea = true,
  className,
}: SparklineProps) {
  const { linePath, areaPath } = useMemo(() => {
    if (data.length < 2) {
      return { linePath: '', areaPath: '' };
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const padding = 2;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((value - min) / range) * chartHeight;
      return { x, y };
    });

    const linePoints = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

    const areaPoints = [
      `M ${points[0].x.toFixed(1)} ${(height - padding).toFixed(1)}`,
      ...points.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`),
      `L ${points[points.length - 1].x.toFixed(1)} ${(height - padding).toFixed(1)}`,
      'Z',
    ].join(' ');

    return { linePath: linePoints, areaPath: areaPoints };
  }, [data, width, height]);

  if (data.length < 2) {
    return null;
  }

  const colors = SPARKLINE_COLORS[color];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('overflow-visible', className)}
      aria-hidden="true"
    >
      {showArea && (
        <path
          d={areaPath}
          fill={colors.fill}
        />
      )}
      <path
        d={linePath}
        fill="none"
        stroke={colors.stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});
