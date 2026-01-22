import type { Plan } from '@prisma/client';

export interface ScanJobData {
  scanJobId: string;
  projectId: string;
  userId: string;
  plan: Plan;
}

export interface ScanJobResult {
  status: 'completed' | 'partial' | 'failed';
  scansCreated: number;
  errorMessage?: string;
}
