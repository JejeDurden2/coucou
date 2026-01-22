import type { ScanJobStatus } from '@prisma/client';

import type { ScanJob } from '../entities/scan-job.entity';

export const SCAN_JOB_REPOSITORY = Symbol('SCAN_JOB_REPOSITORY');

export interface CreateScanJobData {
  projectId: string;
  userId: string;
  promptId?: string; // null for project scan, set for single prompt scan
  totalPrompts: number;
}

export interface UpdateScanJobData {
  status?: ScanJobStatus;
  processedPrompts?: number;
  successCount?: number;
  failureCount?: number;
  errorMessage?: string | null;
  startedAt?: Date;
  completedAt?: Date;
}

export interface ScanJobRepository {
  create(data: CreateScanJobData): Promise<ScanJob>;
  findById(id: string): Promise<ScanJob | null>;
  findByProjectId(projectId: string, limit?: number): Promise<ScanJob[]>;
  update(id: string, data: UpdateScanJobData): Promise<ScanJob>;
  incrementProgress(id: string, success: boolean): Promise<ScanJob>;
}
