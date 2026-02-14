import { Inject, Injectable } from '@nestjs/common';

import { LoggerService } from '../../../../common/logger';
import { Result } from '../../../../common/utils/result';
import type { DomainError } from '../../../../common/errors/domain-error';
import { StripeService } from '../../../billing/infrastructure/stripe.service';
import type { AuditOrder } from '../../domain/entities/audit-order.entity';
import {
  AUDIT_ORDER_REPOSITORY,
  type AuditOrderRepository,
} from '../../domain';

@Injectable()
export class RefundAuditUseCase {
  constructor(
    @Inject(AUDIT_ORDER_REPOSITORY)
    private readonly auditOrderRepository: AuditOrderRepository,
    private readonly stripeService: StripeService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(RefundAuditUseCase.name);
  }

  async execute(auditOrder: AuditOrder): Promise<Result<AuditOrder, DomainError>> {
    if (!auditOrder.canBeRefunded) {
      this.logger.info('Refund skipped: audit not eligible', {
        auditOrderId: auditOrder.id,
        status: auditOrder.status,
        hasPaymentIntent: auditOrder.stripePaymentIntentId !== null,
        isRefunded: auditOrder.isRefunded,
      });
      return Result.ok(auditOrder);
    }

    const paymentIntentId = auditOrder.stripePaymentIntentId!;

    try {
      const refund = await this.stripeService.createRefund(paymentIntentId);

      this.logger.info('Stripe refund succeeded', {
        auditOrderId: auditOrder.id,
        refundId: refund.id,
        refundAmount: refund.amount,
        refundStatus: refund.status,
      });

      const refundResult = auditOrder.markRefunded(refund.id);
      if (!refundResult.ok) {
        this.logger.error('Failed to mark audit as refunded', {
          auditOrderId: auditOrder.id,
          error: refundResult.error.message,
        });
        return Result.ok(auditOrder);
      }

      const savedOrder = await this.auditOrderRepository.save(refundResult.value);

      this.logger.info('Audit order marked as refunded', {
        auditOrderId: auditOrder.id,
        refundId: refund.id,
      });

      return Result.ok(savedOrder);
    } catch (error) {
      this.logger.error(
        'Stripe refund failed — continuing with failure flow',
        error instanceof Error ? error : undefined,
        {
          auditOrderId: auditOrder.id,
          paymentIntentId,
        },
      );
      return Result.ok(auditOrder);
    }
  }
}
