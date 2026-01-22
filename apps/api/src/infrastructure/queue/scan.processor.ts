import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import type { Job } from 'bullmq';

import { SCAN_QUEUE_NAME } from './queue.config';
import type { ScanJobData, ScanJobResult } from './types/scan-job.types';
import {
  PROCESS_SCAN_JOB_USE_CASE,
  type ProcessScanJobUseCase,
} from '../../modules/scan/application/use-cases/process-scan-job.use-case';

@Processor(SCAN_QUEUE_NAME, {
  concurrency: 2, // Process 2 scan jobs in parallel
})
export class ScanProcessor extends WorkerHost {
  private readonly logger = new Logger(ScanProcessor.name);

  constructor(
    @Inject(PROCESS_SCAN_JOB_USE_CASE)
    private readonly processScanJobUseCase: ProcessScanJobUseCase,
  ) {
    super();
  }

  async process(job: Job<ScanJobData>): Promise<ScanJobResult> {
    const { scanJobId, projectId, userId, plan } = job.data;

    this.logger.log({
      message: 'Processing scan job',
      jobId: job.id,
      scanJobId,
      projectId,
      attempt: job.attemptsMade + 1,
    });

    const result = await this.processScanJobUseCase.execute({
      scanJobId,
      projectId,
      userId,
      plan,
    });

    if (!result.ok) {
      this.logger.error({
        message: 'Scan job processing failed',
        jobId: job.id,
        scanJobId,
        error: result.error.message,
      });
      throw new Error(result.error.message);
    }

    this.logger.log({
      message: 'Scan job processed successfully',
      jobId: job.id,
      scanJobId,
      status: result.value.status,
      scansCreated: result.value.scansCreated,
    });

    return result.value;
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<ScanJobData>, error: Error): void {
    this.logger.error({
      message: 'Scan job failed',
      jobId: job.id,
      scanJobId: job.data.scanJobId,
      projectId: job.data.projectId,
      attempt: job.attemptsMade,
      maxAttempts: job.opts.attempts,
      error: error.message,
    });
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<ScanJobData>): void {
    this.logger.log({
      message: 'Scan job completed',
      jobId: job.id,
      scanJobId: job.data.scanJobId,
      projectId: job.data.projectId,
    });
  }
}
