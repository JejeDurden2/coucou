import { Injectable } from '@nestjs/common';

import { Result } from '../../../../common/utils/result';
import { ExternalServiceError } from '../../../../common/errors/domain-error';
import type { StripePort, SubscriptionUpdateResult } from '../../domain/ports/stripe.port';
import { StripeService } from '../stripe.service';

@Injectable()
export class StripeAdapter implements StripePort {
  constructor(private readonly stripeService: StripeService) {}

  async cancelAtPeriodEnd(
    subscriptionId: string,
  ): Promise<Result<SubscriptionUpdateResult, ExternalServiceError>> {
    return this.updateCancelAtPeriodEnd(subscriptionId, true, 'Failed to cancel subscription');
  }

  async resumeSubscription(
    subscriptionId: string,
  ): Promise<Result<SubscriptionUpdateResult, ExternalServiceError>> {
    return this.updateCancelAtPeriodEnd(subscriptionId, false, 'Failed to resume subscription');
  }

  async cancelSubscriptionImmediately(
    subscriptionId: string,
  ): Promise<Result<void, ExternalServiceError>> {
    try {
      await this.stripeService.cancelSubscription(subscriptionId);
      return Result.ok(undefined);
    } catch (error) {
      if (error instanceof ExternalServiceError) {
        return Result.err(error);
      }
      return Result.err(new ExternalServiceError('Stripe', 'Failed to cancel subscription'));
    }
  }

  private async updateCancelAtPeriodEnd(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean,
    errorMessage: string,
  ): Promise<Result<SubscriptionUpdateResult, ExternalServiceError>> {
    try {
      const subscription = await this.stripeService.updateSubscription(subscriptionId, {
        cancel_at_period_end: cancelAtPeriodEnd,
      });

      return Result.ok({
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      });
    } catch (error) {
      if (error instanceof ExternalServiceError) {
        return Result.err(error);
      }
      return Result.err(new ExternalServiceError('Stripe', errorMessage));
    }
  }
}
