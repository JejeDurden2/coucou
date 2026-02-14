import { Inject } from '@nestjs/common';
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import type { Job } from 'bullmq';

import { LoggerService } from '../../../../common/logger';
import { withTimeout } from '../../../../common/utils';
import { AUDIT_PDF_QUEUE_NAME } from '../../../../infrastructure/queue/queue.config';
import { GenerateAuditPdfUseCase } from '../../application/use-cases/generate-audit-pdf.use-case';
import {
  AUDIT_ORDER_REPOSITORY,
  type AuditOrderRepository,
} from '../../domain';
import { RefundAuditUseCase } from '../../application/use-cases/refund-audit.use-case';
import { AuditEmailNotificationService } from '../../application/services/audit-email-notification.service';
import type { AuditPdfJobData } from './audit-pdf-queue.service';

const PDF_JOB_TIMEOUT_MS = 30_000;

@Processor(AUDIT_PDF_QUEUE_NAME, {
  concurrency: 1,
})
export class AuditPdfProcessor extends WorkerHost {
  constructor(
    private readonly generatePdfUseCase: GenerateAuditPdfUseCase,
    @Inject(AUDIT_ORDER_REPOSITORY)
    private readonly auditOrderRepository: AuditOrderRepository,
    private readonly refundAuditUseCase: RefundAuditUseCase,
    private readonly auditEmailNotificationService: AuditEmailNotificationService,
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

    const result = await withTimeout(
      () => this.generatePdfUseCase.execute({ auditOrderId }),
      PDF_JOB_TIMEOUT_MS,
      'PDF generation',
    );

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
  async onFailed(job: Job<AuditPdfJobData>, error: Error): Promise<void> {
    const maxAttempts = job.opts.attempts ?? 1;
    const isFinalAttempt = job.attemptsMade >= maxAttempts;

    this.logger.error('PDF job failed', error, {
      jobId: job.id,
      auditOrderId: job.data.auditOrderId,
      attempt: job.attemptsMade,
      maxAttempts,
      isFinalAttempt,
    });

    if (isFinalAttempt) {
      await this.handleFinalFailure(job, error);
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<AuditPdfJobData>): void {
    this.logger.info('PDF job completed successfully', {
      jobId: job.id,
      auditOrderId: job.data.auditOrderId,
    });
  }

  private async handleFinalFailure(
    job: Job<AuditPdfJobData>,
    error: Error,
  ): Promise<void> {
    const { auditOrderId } = job.data;

    try {
      const auditOrder =
        await this.auditOrderRepository.findById(auditOrderId);
      if (!auditOrder) {
        this.logger.error('Audit order not found for PDF failure handling', {
          auditOrderId,
        });
        return;
      }

      if (!auditOrder.isTerminal) {
        const failedResult = auditOrder.markFailed(
          `PDF generation failed after ${job.attemptsMade} attempts: ${error.message}`,
        );
        if (failedResult.ok) {
          await this.auditOrderRepository.save(failedResult.value);

          const refundResult = await this.refundAuditUseCase.execute(
            failedResult.value,
          );
          const refundedOrder = refundResult.ok ? refundResult.value : failedResult.value;

          await this.auditEmailNotificationService.notifyAuditFailed(
            refundedOrder,
          );

          this.logger.info('Audit marked FAILED after PDF generation failure', {
            auditOrderId,
            refunded: refundedOrder.isRefunded,
          });
        }
      }
    } catch (notifyError) {
      this.logger.error(
        'Failed to handle PDF final failure',
        notifyError instanceof Error ? notifyError : undefined,
        { auditOrderId },
      );
    }
  }

}
