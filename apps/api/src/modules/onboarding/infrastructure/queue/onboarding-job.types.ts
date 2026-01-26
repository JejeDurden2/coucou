import type { Plan } from '@coucou-ia/shared';

export interface OnboardingJobData {
  projectId: string;
  userId: string;
  plan: Plan;
}

export interface OnboardingJobResult {
  status: 'completed' | 'failed';
  promptsCreated: number;
  errorMessage?: string;
}
