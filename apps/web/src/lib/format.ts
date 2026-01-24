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

const DAYS_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

/**
 * Format a future date for next scan display
 * @example formatNextScanDate(today8h30) // "aujourd'hui à 8h30"
 * @example formatNextScanDate(tomorrow9h30) // "demain à 9h30"
 * @example formatNextScanDate(nextMonday) // "lundi à 9h30"
 * @example formatNextScanDate(mondayNextWeek) // "lundi prochain à 9h30"
 */
export function formatNextScanDate(date: Date | string): string {
  const target = new Date(date);
  const now = new Date();

  // Reset time for day comparison
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetStart = new Date(target.getFullYear(), target.getMonth(), target.getDate());

  const diffDays = Math.floor(
    (targetStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24),
  );

  // Format time as "8h30"
  const hours = target.getHours();
  const minutes = target.getMinutes();
  const timeStr = minutes === 0 ? `${hours}h` : `${hours}h${String(minutes).padStart(2, '0')}`;

  if (diffDays === 0) {
    return `aujourd'hui à ${timeStr}`;
  }

  if (diffDays === 1) {
    return `demain à ${timeStr}`;
  }

  const dayName = DAYS_FR[target.getDay()];

  // Within the current week (2-6 days)
  if (diffDays >= 2 && diffDays <= 6) {
    return `${dayName} à ${timeStr}`;
  }

  // Next week (7-13 days)
  if (diffDays >= 7 && diffDays <= 13) {
    return `${dayName} prochain à ${timeStr}`;
  }

  // More than 2 weeks: show full date
  const dateStr = target.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  return `le ${dateStr} à ${timeStr}`;
}
