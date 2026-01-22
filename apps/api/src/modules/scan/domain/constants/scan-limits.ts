import { Plan } from '@prisma/client';

/**
 * Scan cooldown periods by plan (milliseconds)
 */
export const SCAN_COOLDOWN_MS: Record<Plan, number> = {
  [Plan.FREE]: 7 * 24 * 60 * 60 * 1000, // 7 days
  [Plan.SOLO]: 7 * 24 * 60 * 60 * 1000, // 7 days
  [Plan.PRO]: 24 * 60 * 60 * 1000, // 1 day
};

/**
 * Max scans per period (projects x prompts per project)
 */
export const MAX_SCANS_PER_PERIOD: Record<Plan, number> = {
  [Plan.FREE]: 2,
  [Plan.SOLO]: 50,
  [Plan.PRO]: 750,
};

/**
 * Get cooldown label for user-facing messages
 */
export function getCooldownLabel(plan: Plan): string {
  return plan === Plan.PRO ? 'jour' : 'semaine';
}
