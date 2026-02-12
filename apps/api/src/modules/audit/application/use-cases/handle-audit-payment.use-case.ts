import { Inject, Injectable } from '@nestjs/common';

import { LoggerService } from '../../../../common/logger';
import {
  AUDIT_ORDER_REPOSITORY,
  type AuditOrderRepository,
} from '../../domain';
import { AuditQueueService } from '../../infrastructure/queue/audit-queue.service';

@Injectable()
export class HandleAuditPaymentUseCase {
  constructor(
    @Inject(AUDIT_ORDER_REPOSITORY)
    private readonly auditOrderRepository: AuditOrderRepository,
    private readonly auditQueueService: AuditQueueService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(HandleAuditPaymentUseCase.name);
  }

  async execute(auditOrderId: string, paymentIntentId: string): Promise<void> {
    const auditOrder = await this.auditOrderRepository.findById(auditOrderId);
    if (!auditOrder) {
      this.logger.error('Audit order not found for payment', { auditOrderId });
      return;
    }

    const result = auditOrder.markPaid(paymentIntentId);
    if (!result.ok) {
      this.logger.warn('Audit order transition to PAID skipped (idempotent)', {
        auditOrderId,
        currentStatus: auditOrder.status,
      });
      return;
    }

    await this.auditOrderRepository.save(result.value);

    await this.auditQueueService.addJob({
      auditOrderId: auditOrder.id,
      projectId: auditOrder.projectId,
      userId: auditOrder.userId,
    });

    this.logger.info('Audit payment processed, job enqueued', {
      auditOrderId,
      projectId: auditOrder.projectId,
    });
  }
}
