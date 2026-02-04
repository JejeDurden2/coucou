/**
 * Chart color palette for multi-series visualizations.
 * Uses HSL for better color interpolation in charts.
 *
 * Primary violet variant comes first to maintain design system hierarchy.
 */
export const CHART_COLORS = [
  'hsl(262 83% 58%)', // Primary violet variant
  'hsl(346 77% 49%)', // Rose
  'hsl(217 91% 60%)', // Blue
  'hsl(172 66% 50%)', // Teal
  'hsl(43 96% 56%)', // Amber
] as const;

/**
 * Get a chart color by index with automatic wrapping.
 * Useful for dynamic series where the count is unknown.
 */
export function getChartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

/**
 * Standard Recharts margin configuration.
 *
 * The negative left margin (-10px) aligns Y-axis labels with card padding,
 * ensuring visual consistency across all chart components.
 */
export const CHART_MARGIN = {
  top: 10,
  right: 10,
  left: -10,
  bottom: 0,
} as const;
