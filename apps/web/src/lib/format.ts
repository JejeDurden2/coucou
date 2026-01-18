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
