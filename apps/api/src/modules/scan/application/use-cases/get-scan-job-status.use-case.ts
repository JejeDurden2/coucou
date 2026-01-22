import { Inject, Injectable } from '@nestjs/common';
import { ScanJobStatus } from '@prisma/client';

import { ForbiddenError, NotFoundError, Result } from '../../../../common';
import {
  SCAN_JOB_REPOSITORY,
  SCAN_REPOSITORY,
  type ScanJobRepository,
  type ScanRepository,
} from '../../domain';
import type { ScanResponseDto } from '../dto/scan.dto';

export interface GetScanJobStatusInput {
  jobId: string;
  projectId: string;
  userId: string;
}

export interface ScanJobStatusResponse {
  jobId: string;
  status: ScanJobStatus;
  totalPrompts: number;
  processedPrompts: number;
  successCount: number;
  failureCount: number;
  progress: number;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  scans?: ScanResponseDto[];
  errorMessage?: string;
}

type GetScanJobStatusError = NotFoundError | ForbiddenError;

export const GET_SCAN_JOB_STATUS_USE_CASE = Symbol('GET_SCAN_JOB_STATUS_USE_CASE');

@Injectable()
export class GetScanJobStatusUseCase {
  constructor(
    @Inject(SCAN_JOB_REPOSITORY)
    private readonly scanJobRepository: ScanJobRepository,
    @Inject(SCAN_REPOSITORY)
    private readonly scanRepository: ScanRepository,
  ) {}

  async execute(
    input: GetScanJobStatusInput,
  ): Promise<Result<ScanJobStatusResponse, GetScanJobStatusError>> {
    const { jobId, projectId, userId } = input;

    const scanJob = await this.scanJobRepository.findById(jobId);

    if (!scanJob) {
      return Result.err(new NotFoundError('ScanJob', jobId));
    }

    // Verify ownership
    if (scanJob.projectId !== projectId) {
      return Result.err(new NotFoundError('ScanJob', jobId));
    }

    if (scanJob.userId !== userId) {
      return Result.err(new ForbiddenError('You do not have access to this scan job'));
    }

    const response: ScanJobStatusResponse = {
      jobId: scanJob.id,
      status: scanJob.status,
      totalPrompts: scanJob.totalPrompts,
      processedPrompts: scanJob.processedPrompts,
      successCount: scanJob.successCount,
      failureCount: scanJob.failureCount,
      progress: scanJob.progress,
      startedAt: scanJob.startedAt,
      completedAt: scanJob.completedAt,
      createdAt: scanJob.createdAt,
      errorMessage: scanJob.errorMessage ?? undefined,
    };

    // If completed, include the scan results
    if (scanJob.isCompleted) {
      const scans = await this.scanRepository.findByProjectIdInRange(
        projectId,
        scanJob.createdAt,
        new Date(),
      );
      response.scans = scans.map((scan) => ({
        id: scan.id,
        promptId: scan.promptId,
        executedAt: scan.executedAt,
        results: scan.results.map((r) => ({
          provider: r.provider,
          model: r.model,
          isCited: r.isCited,
          position: r.position,
          brandKeywords: r.brandKeywords,
          queryKeywords: r.queryKeywords,
          competitors: r.competitorMentions,
          latencyMs: r.latencyMs,
          parseSuccess: r.parseSuccess,
        })),
        isCitedByAny: scan.isCitedByAny,
        citationRate: scan.citationRate,
      }));
    }

    return Result.ok(response);
  }
}
