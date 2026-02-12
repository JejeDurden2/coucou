import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import type { Job } from 'bullmq';

import { LoggerService } from '../../../../common/logger';
import { AUDIT_PDF_QUEUE_NAME } from '../../../../infrastructure/queue/queue.config';
import { GenerateAuditPdfUseCase } from '../../application/use-cases/generate-audit-pdf.use-case';
import type { AuditPdfJobData } from './audit-pdf-queue.service';

@Processor(AUDIT_PDF_QUEUE_NAME, {
  concurrency: 1,
})
export class AuditPdfProcessor extends WorkerHost {
  constructor(
    private readonly generatePdfUseCase: GenerateAuditPdfUseCase,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(AuditPdfProcessor.name);
  }

  async process(job: Job<AuditPdfJobData>): Promise<void> {
    const { auditOrderId } = job.data;

    this.logger.info('Processing PDF generation', {
      jobId: job.id,
      auditOrderId,
      attempt: job.attemptsMade + 1,
      maxAttempts: job.opts.attempts,
    });

    const result = await this.generatePdfUseCase.execute({ auditOrderId });

    if (!result.ok) {
      this.logger.error('PDF generation failed', {
        jobId: job.id,
        auditOrderId,
        error: result.error.message,
      });
      throw new Error(result.error.message);
    }

    this.logger.info('PDF generation succeeded', {
      jobId: job.id,
      auditOrderId,
      reportKey: result.value.reportKey,
    });
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<AuditPdfJobData>, error: Error): void {
    this.logger.error('PDF job failed', error, {
      jobId: job.id,
      auditOrderId: job.data.auditOrderId,
      attempt: job.attemptsMade,
      maxAttempts: job.opts.attempts,
    });
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<AuditPdfJobData>): void {
    this.logger.info('PDF job completed successfully', {
      jobId: job.id,
      auditOrderId: job.data.auditOrderId,
    });
  }
}
