const MS_PER_MINUTE = 60_000;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;

/**
 * Format a date as relative time in French
 * @example formatRelativeTime(new Date()) // "à l'instant"
 * @example formatRelativeTime(twoHoursAgo) // "il y a 2h"
 */
export function formatRelativeTime(date: Date | string): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diffMs / MS_PER_MINUTE);

  if (minutes < 1) return "à l'instant";
  if (minutes < MINUTES_PER_HOUR) return `il y a ${minutes}min`;

  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  if (hours < HOURS_PER_DAY) return `il y a ${hours}h`;

  const days = Math.floor(hours / HOURS_PER_DAY);
  return `il y a ${days}j`;
}

/**
 * Format a future date as relative time in French
 * @example formatRelativeTimeFuture(tomorrow) // "dans 1j"
 */
export function formatRelativeTimeFuture(date: Date | string): string {
  const diffMs = new Date(date).getTime() - Date.now();
  if (diffMs <= 0) return 'maintenant';

  const minutes = Math.floor(diffMs / MS_PER_MINUTE);
  if (minutes < MINUTES_PER_HOUR) return `dans ${minutes}min`;

  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  if (hours < HOURS_PER_DAY) return `dans ${hours}h`;

  const days = Math.floor(hours / HOURS_PER_DAY);
  return `dans ${days}j`;
}

export type AggregationLevel = 'day' | 'week' | 'month';

/**
 * Format a date string for chart display based on aggregation level
 * @example formatChartDate('2024-01-15', 'day') // "15 janv."
 * @example formatChartDate('2024-01-15', 'month') // "janv. 24"
 */
export function formatChartDate(dateStr: string, aggregation: AggregationLevel): string {
  const date = new Date(dateStr);
  if (aggregation === 'month') {
    return date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
  }
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
