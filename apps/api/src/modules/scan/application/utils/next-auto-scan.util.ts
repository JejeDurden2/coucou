import { Plan } from '@prisma/client';

const PARIS_TIMEZONE = 'Europe/Paris';

// SOLO: Monday (1) and Thursday (4) at 9:30
const SOLO_SCAN_DAYS = [1, 4];
const SOLO_SCAN_HOUR = 9;
const SOLO_SCAN_MINUTE = 30;

// PRO: Daily at 8:30
const PRO_SCAN_HOUR = 8;
const PRO_SCAN_MINUTE = 30;

/**
 * Get Paris time components from a Date
 */
function getParisTime(date: Date): {
  dayOfWeek: number;
  hours: number;
  minutes: number;
} {
  const parisString = date.toLocaleString('en-US', {
    timeZone: PARIS_TIMEZONE,
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });

  // Parse "Mon, 09:30" format
  const parts = parisString.split(', ');
  const dayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const dayOfWeek = dayMap[parts[0]] ?? 0;
  const [hours, minutes] = (parts[1] ?? '0:0').split(':').map(Number);

  return { dayOfWeek, hours: hours ?? 0, minutes: minutes ?? 0 };
}

/**
 * Create a Date for a specific Paris time
 */
function createParisDateTime(
  baseDate: Date,
  daysToAdd: number,
  hour: number,
  minute: number,
): Date {
  const result = new Date(baseDate);
  result.setDate(result.getDate() + daysToAdd);

  // Convert Paris hour to UTC
  // Paris is UTC+1 (winter) or UTC+2 (summer)
  // Use a reliable method: create a date string and parse it
  const year = result.getFullYear();
  const month = String(result.getMonth() + 1).padStart(2, '0');
  const day = String(result.getDate()).padStart(2, '0');
  const parisDateStr = `${year}-${month}-${day}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;

  // Find UTC offset for this specific date/time in Paris
  const testDate = new Date(parisDateStr + 'Z');
  const parisTest = new Date(testDate.toLocaleString('en-US', { timeZone: PARIS_TIMEZONE }));
  const utcTest = new Date(testDate.toLocaleString('en-US', { timeZone: 'UTC' }));
  const offsetMs = parisTest.getTime() - utcTest.getTime();

  // Create the final date by subtracting the offset
  return new Date(new Date(parisDateStr).getTime() - offsetMs);
}

/**
 * Calculate the next auto-scan date based on plan
 *
 * @param plan - User's subscription plan
 * @param fromDate - Reference date (defaults to now)
 * @returns Next auto-scan date or null for FREE plan
 */
export function calculateNextAutoScan(plan: Plan, fromDate: Date = new Date()): Date | null {
  if (plan === Plan.FREE) {
    return null;
  }

  const paris = getParisTime(fromDate);

  if (plan === Plan.PRO) {
    // Daily at 8:30 Paris
    const isPastTodaysScan =
      paris.hours > PRO_SCAN_HOUR ||
      (paris.hours === PRO_SCAN_HOUR && paris.minutes >= PRO_SCAN_MINUTE);

    const daysToAdd = isPastTodaysScan ? 1 : 0;
    return createParisDateTime(fromDate, daysToAdd, PRO_SCAN_HOUR, PRO_SCAN_MINUTE);
  }

  if (plan === Plan.SOLO) {
    // Monday and Thursday at 9:30 Paris
    const currentDay = paris.dayOfWeek;
    const isPastTodaysScan =
      paris.hours > SOLO_SCAN_HOUR ||
      (paris.hours === SOLO_SCAN_HOUR && paris.minutes >= SOLO_SCAN_MINUTE);

    // Find next scan day
    let daysToAdd = 0;
    for (let i = 0; i <= 7; i++) {
      const checkDay = (currentDay + i) % 7;
      if (SOLO_SCAN_DAYS.includes(checkDay)) {
        if (i === 0 && isPastTodaysScan) {
          continue; // Skip today if scan already passed
        }
        daysToAdd = i;
        break;
      }
    }

    // If no day found in the next 7 days (shouldn't happen), default to next Monday
    if (daysToAdd === 0 && isPastTodaysScan) {
      const daysUntilMonday = (8 - currentDay) % 7 || 7;
      daysToAdd = daysUntilMonday;
    }

    return createParisDateTime(fromDate, daysToAdd, SOLO_SCAN_HOUR, SOLO_SCAN_MINUTE);
  }

  return null;
}
