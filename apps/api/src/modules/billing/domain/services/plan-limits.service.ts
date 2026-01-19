import { Plan } from '@prisma/client';

export interface PlanLimits {
  projects: number;
  promptsPerProject: number;
  scanFrequency: 'manual' | 'weekly' | 'daily';
  retentionDays: number;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  [Plan.FREE]: {
    projects: 1,
    promptsPerProject: 2,
    scanFrequency: 'weekly',
    retentionDays: 30,
  },
  [Plan.SOLO]: {
    projects: 5,
    promptsPerProject: 10,
    scanFrequency: 'weekly',
    retentionDays: 180,
  },
  [Plan.PRO]: {
    projects: 15,
    promptsPerProject: 50,
    scanFrequency: 'daily',
    retentionDays: 365 * 10, // "unlimited"
  },
};

export class PlanLimitsService {
  static getLimits(plan: Plan): PlanLimits {
    return PLAN_LIMITS[plan];
  }

  static canCreateProject(plan: Plan, currentCount: number): boolean {
    return currentCount < PLAN_LIMITS[plan].projects;
  }

  static canCreatePrompt(plan: Plan, currentCount: number): boolean {
    return currentCount < PLAN_LIMITS[plan].promptsPerProject;
  }

  static canScanAutomatically(plan: Plan): boolean {
    return PLAN_LIMITS[plan].scanFrequency !== 'manual';
  }

  static shouldScan(plan: Plan, lastScannedAt: Date | null): boolean {
    if (PLAN_LIMITS[plan].scanFrequency === 'manual') {
      return false;
    }

    if (!lastScannedAt) {
      return true;
    }

    const now = new Date();
    const diffDays = Math.floor((now.getTime() - lastScannedAt.getTime()) / (1000 * 60 * 60 * 24));

    if (PLAN_LIMITS[plan].scanFrequency === 'daily') {
      return diffDays >= 1;
    }

    // weekly
    return diffDays >= 7;
  }

  static getRetentionDate(plan: Plan): Date {
    const date = new Date();
    date.setDate(date.getDate() - PLAN_LIMITS[plan].retentionDays);
    return date;
  }
}
