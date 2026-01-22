import { Injectable } from '@nestjs/common';

import { Result } from '../../../../common/utils/result';
import { ExternalServiceError } from '../../../../common/errors/domain-error';
import type { StripePort, CancelAtPeriodEndResult } from '../../domain/ports/stripe.port';
import { StripeService } from '../stripe.service';

@Injectable()
export class StripeAdapter implements StripePort {
  constructor(private readonly stripeService: StripeService) {}

  async cancelAtPeriodEnd(
    subscriptionId: string,
  ): Promise<Result<CancelAtPeriodEndResult, ExternalServiceError>> {
    try {
      const subscription = await this.stripeService.updateSubscription(subscriptionId, {
        cancel_at_period_end: true,
      });

      return Result.ok({
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      });
    } catch (error) {
      if (error instanceof ExternalServiceError) {
        return Result.err(error);
      }
      return Result.err(new ExternalServiceError('Stripe', 'Failed to cancel subscription'));
    }
  }
}
