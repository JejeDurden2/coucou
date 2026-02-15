import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import type { Job } from 'bullmq';

import { LoggerService } from '../../../../common/logger';
import { withTimeout } from '../../../../common/utils';
import { AUDIT_QUEUE_NAME } from '../../../../infrastructure/queue/queue.config';
import {
  AUDIT_ORDER_REPOSITORY,
  type AuditOrderRepository,
  AUDIT_AGENT_PORT,
  type AuditAgentPort,
} from '../../domain';
import { BriefAssemblerService } from '../../application/services/brief-assembler.service';
import { AuditEmailNotificationService } from '../../application/services/audit-email-notification.service';
import { RefundAuditUseCase } from '../../application/use-cases/refund-audit.use-case';
import { HandleCrawlCompleteUseCase } from '../../application/use-cases/handle-crawl-complete.use-case';
import { AnalyzeWithMistralUseCase } from '../../application/use-cases/analyze-with-mistral.use-case';
import { AuditQueueService } from './audit-queue.service';
import type {
  AuditJobData,
  AuditTimeoutCheckJobData,
  HandleCrawlCompleteJobData,
  AnalyzeWithMistralJobData,
} from './audit-queue.service';

const JOB_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes
const TIMEOUT_CHECK_DELAY_MS = 15 * 60 * 1000; // 15 minutes

@Processor(AUDIT_QUEUE_NAME, {
  concurrency: 1,
})
export class AuditProcessor extends WorkerHost {
  constructor(
    @Inject(AUDIT_ORDER_REPOSITORY)
    private readonly auditOrderRepository: AuditOrderRepository,
    @Inject(AUDIT_AGENT_PORT)
    private readonly auditAgentPort: AuditAgentPort,
    private readonly briefAssemblerService: BriefAssemblerService,
    private readonly auditQueueService: AuditQueueService,
    private readonly auditEmailNotificationService: AuditEmailNotificationService,
    private readonly refundAuditUseCase: RefundAuditUseCase,
    private readonly handleCrawlCompleteUseCase: HandleCrawlCompleteUseCase,
    private readonly analyzeWithMistralUseCase: AnalyzeWithMistralUseCase,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(AuditProcessor.name);
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case 'run-audit':
        return this.processRunAudit(job as Job<AuditJobData>);
      case 'check-audit-timeout':
        return this.processTimeoutCheck(job as Job<AuditTimeoutCheckJobData>);
      case 'handle-crawl-complete':
        return this.processHandleCrawlComplete(job as Job<HandleCrawlCompleteJobData>);
      case 'analyze-with-mistral':
        return this.processAnalyzeWithMistral(job as Job<AnalyzeWithMistralJobData>);
      default:
        this.logger.warn('Unknown audit job name', { jobName: job.name });
    }
  }

  private async processRunAudit(job: Job<AuditJobData>): Promise<void> {
    const { auditOrderId, projectId } = job.data;

    this.logger.info('Processing audit job', {
      jobId: job.id,
      auditOrderId,
      projectId,
      attempt: job.attemptsMade + 1,
    });

    await withTimeout(async () => {
      // 1. Fetch AuditOrder and validate status
      let auditOrder = await this.auditOrderRepository.findById(auditOrderId);
      if (!auditOrder) {
        this.logger.error('Audit order not found', { auditOrderId });
        return;
      }

      if (auditOrder.status !== 'PAID') {
        this.logger.warn('Audit order not in PAID status, skipping', {
          auditOrderId,
          currentStatus: auditOrder.status,
        });
        return;
      }

      // 2. Assemble brief
      const briefResult = await this.briefAssemblerService.assemble(
        projectId,
        auditOrderId,
      );
      if (!briefResult.ok) {
        this.logger.error('Brief assembly failed', {
          auditOrderId,
          error: briefResult.error.message,
        });
        throw new Error(briefResult.error.message);
      }

      // 3. Store brief in entity
      const updateBriefResult = auditOrder.updateBrief(briefResult.value);
      if (!updateBriefResult.ok) {
        this.logger.error('Failed to update brief on audit order', {
          auditOrderId,
          error: updateBriefResult.error.message,
        });
        throw new Error(updateBriefResult.error.message);
      }
      auditOrder = updateBriefResult.value;
      await this.auditOrderRepository.save(auditOrder);

      // 4. Trigger Twin crawl
      const triggerResult = await this.auditAgentPort.triggerCrawl(
        auditOrder.briefPayload,
      );
      if (!triggerResult.ok) {
        this.logger.error('Failed to trigger audit agent', {
          auditOrderId,
          error: triggerResult.error.message,
        });
        throw new Error(triggerResult.error.message);
      }

      // 5. Transition PAID → CRAWLING
      const crawlingResult = auditOrder.markCrawling(
        triggerResult.value.agentId,
      );
      if (!crawlingResult.ok) {
        this.logger.error('Failed to transition audit to CRAWLING', {
          auditOrderId,
          error: crawlingResult.error.message,
        });
        throw new Error(crawlingResult.error.message);
      }
      auditOrder = crawlingResult.value;
      await this.auditOrderRepository.save(auditOrder);

      this.logger.info('Audit order moved to CRAWLING', {
        auditOrderId,
        agentId: triggerResult.value.agentId,
      });

      // 6. Schedule timeout check job
      await this.auditQueueService.addTimeoutCheckJob(
        { auditOrderId },
        TIMEOUT_CHECK_DELAY_MS,
      );
    }, JOB_TIMEOUT_MS);
  }

  private async processTimeoutCheck(
    job: Job<AuditTimeoutCheckJobData>,
  ): Promise<void> {
    const { auditOrderId } = job.data;

    this.logger.info('Checking audit timeout', {
      jobId: job.id,
      auditOrderId,
    });

    const auditOrder = await this.auditOrderRepository.findById(auditOrderId);
    if (!auditOrder) {
      this.logger.warn('Audit order not found for timeout check', {
        auditOrderId,
      });
      return;
    }

    if (!auditOrder.isTimedOut) {
      this.logger.info('Audit not timed out, skipping', {
        auditOrderId,
        status: auditOrder.status,
      });
      return;
    }

    const failedResult = auditOrder.markFailed('Audit timed out');
    if (!failedResult.ok) {
      this.logger.warn('Failed to mark audit as timed out', {
        auditOrderId,
        error: failedResult.error.message,
      });
      return;
    }

    await this.auditOrderRepository.save(failedResult.value);

    const refundResult = await this.refundAuditUseCase.execute(failedResult.value);
    const refundedOrder = refundResult.ok ? refundResult.value : failedResult.value;

    await this.auditEmailNotificationService.notifyAuditFailed(refundedOrder);

    this.logger.info('Audit order marked as FAILED (timeout)', {
      auditOrderId,
      refunded: refundedOrder.isRefunded,
    });
  }

  private async processHandleCrawlComplete(
    job: Job<HandleCrawlCompleteJobData>,
  ): Promise<void> {
    const { auditId, status } = job.data;

    this.logger.info('Processing crawl completion', {
      jobId: job.id,
      auditId,
      status,
    });

    await this.handleCrawlCompleteUseCase.execute(job.data);
  }

  private async processAnalyzeWithMistral(
    job: Job<AnalyzeWithMistralJobData>,
  ): Promise<void> {
    const { auditOrderId } = job.data;

    this.logger.info('Processing Mistral analysis', {
      jobId: job.id,
      auditOrderId,
      attempt: job.attemptsMade + 1,
    });

    const result = await this.analyzeWithMistralUseCase.execute({ auditOrderId });
    if (!result.ok) {
      throw result.error;
    }
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job, error: Error): Promise<void> {
    const maxAttempts = job.opts.attempts ?? 1;
    const isFinalAttempt = job.attemptsMade >= maxAttempts;

    this.logger.error('Audit job failed', error, {
      jobId: job.id,
      jobName: job.name,
      auditOrderId: job.data.auditOrderId,
      attempt: job.attemptsMade,
      maxAttempts,
      isFinalAttempt,
    });

    if (isFinalAttempt && (job.name === 'run-audit' || job.name === 'analyze-with-mistral')) {
      await this.handleFinalFailure(job as Job<AuditJobData | AnalyzeWithMistralJobData>, error);
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job): void {
    this.logger.info('Audit job completed', {
      jobId: job.id,
      jobName: job.name,
      auditOrderId: job.data.auditOrderId,
    });
  }

  private async handleFinalFailure(
    job: Job<AuditJobData | AnalyzeWithMistralJobData>,
    error: Error,
  ): Promise<void> {
    const { auditOrderId } = job.data;

    try {
      const auditOrder =
        await this.auditOrderRepository.findById(auditOrderId);
      if (!auditOrder) {
        this.logger.error('Audit order not found for failure handling', { auditOrderId });
        return;
      }

      if (!auditOrder.isTerminal) {
        const failedResult = auditOrder.markFailed(error.message);
        if (failedResult.ok) {
          await this.auditOrderRepository.save(failedResult.value);

          const refundResult = await this.refundAuditUseCase.execute(failedResult.value);
          const refundedOrder = refundResult.ok ? refundResult.value : failedResult.value;

          await this.auditEmailNotificationService.notifyAuditFailed(refundedOrder);
          this.logger.info('Audit order marked as FAILED after retries', {
            auditOrderId,
            refunded: refundedOrder.isRefunded,
          });
        }
      }
    } catch (notifyError) {
      this.logger.error(
        'Failed to handle audit final failure',
        notifyError instanceof Error ? notifyError : undefined,
        { auditOrderId },
      );
    }
  }

}
