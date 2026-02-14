import { Inject, Injectable } from '@nestjs/common';
import { AuditStatus } from '@coucou-ia/shared';
import type { TwinCrawlResultLenientType } from '@coucou-ia/shared';

import { LoggerService } from '../../../../common/logger';
import {
  FILE_STORAGE_PORT,
  type FileStoragePort,
} from '../../../storage/domain/ports/file-storage.port';
import {
  AUDIT_ORDER_REPOSITORY,
  type AuditOrderRepository,
  AUDIT_AGENT_PORT,
  type AuditAgentPort,
} from '../../domain';
import { AuditEmailNotificationService } from '../services/audit-email-notification.service';
import { RefundAuditUseCase } from './refund-audit.use-case';
import { AuditQueueService } from '../../infrastructure/queue/audit-queue.service';

const RETRYABLE_ERROR_CODES: ReadonlySet<string> = new Set([
  'SITE_UNREACHABLE',
  'TIMEOUT',
  'CRAWL_BLOCKED',
]);

const MAX_RETRY_COUNT = 1;

@Injectable()
export class HandleCrawlCompleteUseCase {
  constructor(
    @Inject(AUDIT_ORDER_REPOSITORY)
    private readonly auditOrderRepository: AuditOrderRepository,
    @Inject(FILE_STORAGE_PORT)
    private readonly fileStorage: FileStoragePort,
    @Inject(AUDIT_AGENT_PORT)
    private readonly auditAgentPort: AuditAgentPort,
    private readonly auditQueueService: AuditQueueService,
    private readonly auditEmailNotificationService: AuditEmailNotificationService,
    private readonly refundAuditUseCase: RefundAuditUseCase,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(HandleCrawlCompleteUseCase.name);
  }

  async execute(payload: TwinCrawlResultLenientType): Promise<void> {
    const { auditId, status } = payload;

    // 1. Find audit
    const auditOrder = await this.auditOrderRepository.findById(auditId);
    if (!auditOrder) {
      this.logger.warn('Audit not found for crawl-complete webhook', { auditId });
      return;
    }

    // 2. Idempotency: skip if already past CRAWLING
    if (auditOrder.status === AuditStatus.ANALYZING || auditOrder.isTerminal) {
      this.logger.info('Crawl-complete webhook ignored: audit already advanced', {
        auditId,
        currentStatus: auditOrder.status,
        webhookStatus: status,
      });
      return;
    }

    // 3. Validate current status is CRAWLING
    if (auditOrder.status !== AuditStatus.CRAWLING) {
      this.logger.warn('Crawl-complete webhook rejected: unexpected audit status', {
        auditId,
        currentStatus: auditOrder.status,
        expectedStatus: AuditStatus.CRAWLING,
      });
      return;
    }

    // 4. Handle by status
    switch (status) {
      case 'completed':
      case 'partial':
        await this.handleSuccess(auditId, payload);
        break;
      case 'failed':
        await this.handleFailure(auditId, payload);
        break;
    }
  }

  private async handleSuccess(
    auditId: string,
    payload: TwinCrawlResultLenientType,
  ): Promise<void> {
    // 1. Store observations on R2
    const observationsJson = JSON.stringify(payload.observations);
    const observationsBuffer = Buffer.from(observationsJson, 'utf-8');
    const r2Key = `audits/${auditId}/observations.json`;

    const uploadResult = await this.fileStorage.upload(
      r2Key,
      observationsBuffer,
      'application/json',
    );

    if (!uploadResult.ok) {
      this.logger.error('Failed to upload observations to R2', {
        auditId,
        error: uploadResult.error.message,
      });
      await this.failAudit(auditId, `R2 upload failed: ${uploadResult.error.message}`);
      return;
    }

    // 2. Extract metadata
    const pagesAnalyzedClient = payload.meta?.pagesAnalyzedClient ?? 0;
    const pagesAnalyzedCompetitors = payload.meta?.pagesAnalyzedCompetitors ?? 0;
    const competitorsAnalyzed = this.extractCompetitorNames(payload.observations);

    // 3. Transition to ANALYZING
    const auditOrder = await this.auditOrderRepository.findById(auditId);
    if (!auditOrder) return;

    const analyzingResult = auditOrder.markAnalyzing({
      crawlDataUrl: r2Key,
      pagesAnalyzedClient,
      pagesAnalyzedCompetitors,
      competitorsAnalyzed,
    });

    if (!analyzingResult.ok) {
      this.logger.error('Failed to transition audit to ANALYZING', {
        auditId,
        error: analyzingResult.error.message,
      });
      return;
    }

    await this.auditOrderRepository.save(analyzingResult.value);

    this.logger.info('Audit transitioned to ANALYZING', {
      auditId,
      crawlDataUrl: r2Key,
      pagesAnalyzedClient,
      pagesAnalyzedCompetitors,
      competitorsCount: competitorsAnalyzed.length,
    });

    // 4. Enqueue Mistral analysis job
    await this.auditQueueService.addAnalyzeWithMistralJob({ auditOrderId: auditId });
  }

  private async handleFailure(
    auditId: string,
    payload: TwinCrawlResultLenientType,
  ): Promise<void> {
    const errorCode = payload.error?.code;
    const errorMessage = payload.error?.message ?? 'Unknown crawl error';

    const auditOrder = await this.auditOrderRepository.findById(auditId);
    if (!auditOrder) return;

    // Check if we can retry
    const isRetryable = errorCode !== undefined && RETRYABLE_ERROR_CODES.has(errorCode);

    if (isRetryable && auditOrder.retryCount < MAX_RETRY_COUNT) {
      // Increment retry and re-trigger Twin
      const retryResult = auditOrder.incrementRetry();
      if (!retryResult.ok) {
        this.logger.error('Failed to increment retry count', {
          auditId,
          error: retryResult.error.message,
        });
        return;
      }

      await this.auditOrderRepository.save(retryResult.value);

      const triggerResult = await this.auditAgentPort.triggerCrawl(
        retryResult.value.briefPayload,
      );

      if (triggerResult.ok) {
        this.logger.info('Twin crawl retried after failure', {
          auditId,
          errorCode,
          retryCount: retryResult.value.retryCount,
        });
        return;
      }

      this.logger.error('Failed to re-trigger Twin after retry', {
        auditId,
        error: triggerResult.error.message,
      });
      // Fall through to permanent failure
    }

    // Permanent failure
    const failedResult = auditOrder.markFailed(errorMessage);
    if (!failedResult.ok) {
      this.logger.error('Failed to transition audit to FAILED', {
        auditId,
        error: failedResult.error.message,
      });
      return;
    }

    await this.auditOrderRepository.save(failedResult.value);

    const refundResult = await this.refundAuditUseCase.execute(failedResult.value);
    const refundedOrder = refundResult.ok ? refundResult.value : failedResult.value;

    await this.auditEmailNotificationService.notifyAuditFailed(refundedOrder);

    this.logger.info('Audit marked as FAILED after crawl failure', {
      auditId,
      errorCode,
      errorMessage,
      retryCount: auditOrder.retryCount,
      refunded: refundedOrder.isRefunded,
    });
  }

  private async failAudit(auditId: string, reason: string): Promise<void> {
    const auditOrder = await this.auditOrderRepository.findById(auditId);
    if (!auditOrder) return;

    const failedResult = auditOrder.markFailed(reason);
    if (!failedResult.ok) {
      this.logger.error('Failed to transition audit to FAILED', {
        auditId,
        error: failedResult.error.message,
      });
      return;
    }

    await this.auditOrderRepository.save(failedResult.value);
    const refundResult = await this.refundAuditUseCase.execute(failedResult.value);
    const refundedOrder = refundResult.ok ? refundResult.value : failedResult.value;
    await this.auditEmailNotificationService.notifyAuditFailed(refundedOrder);
  }

  private extractCompetitorNames(observations: unknown): string[] {
    if (
      observations !== null &&
      observations !== undefined &&
      typeof observations === 'object' &&
      'competitors' in observations &&
      Array.isArray((observations as Record<string, unknown>).competitors)
    ) {
      return ((observations as Record<string, unknown>).competitors as Array<Record<string, unknown>>)
        .map((c) => (typeof c.name === 'string' ? c.name : ''))
        .filter(Boolean);
    }
    return [];
  }
}
