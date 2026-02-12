import { Inject, Injectable } from '@nestjs/common';
import type { TwinWebhookPayloadLenientType } from '@coucou-ia/shared';
import { auditResultSchema } from '@coucou-ia/shared';

import { LoggerService } from '../../../../common/logger';
import {
  AUDIT_ORDER_REPOSITORY,
  type AuditOrderRepository,
  type AuditOrder,
} from '../../domain';
import { AuditEmailNotificationService } from '../services/audit-email-notification.service';
import { AuditPdfQueueService } from '../../infrastructure/queue/audit-pdf-queue.service';

@Injectable()
export class CompleteAuditUseCase {
  constructor(
    @Inject(AUDIT_ORDER_REPOSITORY)
    private readonly auditOrderRepository: AuditOrderRepository,
    private readonly auditEmailNotificationService: AuditEmailNotificationService,
    private readonly auditPdfQueueService: AuditPdfQueueService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(CompleteAuditUseCase.name);
  }

  async execute(payload: TwinWebhookPayloadLenientType): Promise<void> {
    const { auditId, status } = payload;

    // 1. Find audit
    const auditOrder = await this.auditOrderRepository.findById(auditId);
    if (!auditOrder) {
      this.logger.warn('Audit not found for webhook', { auditId });
      return;
    }

    // 2. Idempotency: skip if already in terminal state
    if (auditOrder.isTerminal) {
      this.logger.info('Webhook ignored: audit already in terminal state', {
        auditId,
        currentStatus: auditOrder.status,
        webhookStatus: status,
      });
      return;
    }

    // 3. Calculate processing duration
    const processingDurationMs = auditOrder.startedAt
      ? Date.now() - auditOrder.startedAt.getTime()
      : null;

    // 4. Handle by status
    switch (status) {
      case 'completed':
      case 'partial':
        await this.handleSuccessResult(auditOrder, payload, processingDurationMs);
        break;
      case 'failed':
        await this.handleFailedResult(auditOrder, payload, processingDurationMs);
        break;
    }
  }

  private async handleSuccessResult(
    auditOrder: AuditOrder,
    payload: TwinWebhookPayloadLenientType,
    processingDurationMs: number | null,
  ): Promise<void> {
    const { auditId, status } = payload;

    // Validate result schema
    const resultParsed = auditResultSchema.safeParse(payload.result);

    if (!resultParsed.success) {
      // Schema error — store raw payload for debugging
      this.logger.error('Audit result schema validation failed', {
        auditId,
        errors: resultParsed.error.issues
          .map((i) => `${String(i.path.join('.'))}: ${i.message}`)
          .slice(0, 10),
      });

      const schemaErrorResult = auditOrder.markSchemaError(payload.result);
      if (!schemaErrorResult.ok) {
        this.logger.error('Failed to transition audit to SCHEMA_ERROR', {
          auditId,
          error: schemaErrorResult.error.message,
        });
        return;
      }

      await this.auditOrderRepository.save(schemaErrorResult.value);
      await this.auditEmailNotificationService.notifyAuditSchemaError(schemaErrorResult.value);
      return;
    }

    // Valid result — transition to COMPLETED or PARTIAL
    const transitionResult = status === 'completed'
      ? auditOrder.markCompleted(resultParsed.data)
      : auditOrder.markPartial(resultParsed.data);

    if (!transitionResult.ok) {
      this.logger.error(`Failed to transition audit to ${status.toUpperCase()}`, {
        auditId,
        error: transitionResult.error.message,
      });
      return;
    }

    await this.auditOrderRepository.save(transitionResult.value);

    this.logger.info(`Audit ${status}`, {
      auditId,
      status: status.toUpperCase(),
      geoScore: transitionResult.value.geoScore,
      processingDurationMs,
    });

    // Notify user via email
    await this.auditEmailNotificationService.notifyAuditSuccess(transitionResult.value);

    // Enqueue PDF report generation
    await this.auditPdfQueueService.addJob({ auditOrderId: auditId });
    this.logger.info('PDF generation job enqueued', { auditId });
  }

  private async handleFailedResult(
    auditOrder: AuditOrder,
    payload: TwinWebhookPayloadLenientType,
    processingDurationMs: number | null,
  ): Promise<void> {
    const { auditId } = payload;
    const reason = payload.error ?? 'Unknown error';

    const failedResult = auditOrder.markFailed(reason);
    if (!failedResult.ok) {
      this.logger.error('Failed to transition audit to FAILED', {
        auditId,
        error: failedResult.error.message,
      });
      return;
    }

    await this.auditOrderRepository.save(failedResult.value);

    this.logger.info('Audit failed', {
      auditId,
      status: 'FAILED',
      reason,
      processingDurationMs,
    });

    // Notify user + admin via email
    await this.auditEmailNotificationService.notifyAuditFailed(failedResult.value);
  }
}
