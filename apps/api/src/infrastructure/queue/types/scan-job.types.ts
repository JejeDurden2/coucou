import type { Plan } from '@prisma/client';

export type ScanSource = 'manual' | 'auto';

export interface ScanJobData {
  scanJobId: string;
  projectId: string;
  userId: string;
  plan: Plan;
  source?: ScanSource;
}

export interface ScanJobResult {
  status: 'completed' | 'partial' | 'failed';
  scansCreated: number;
  errorMessage?: string;
}
