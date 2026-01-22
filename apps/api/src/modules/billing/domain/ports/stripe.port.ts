import { Result } from '../../../../common/utils/result';
import { ExternalServiceError } from '../../../../common/errors/domain-error';

export interface SubscriptionUpdateResult {
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export interface StripePort {
  cancelAtPeriodEnd(
    subscriptionId: string,
  ): Promise<Result<SubscriptionUpdateResult, ExternalServiceError>>;

  resumeSubscription(
    subscriptionId: string,
  ): Promise<Result<SubscriptionUpdateResult, ExternalServiceError>>;

  cancelSubscriptionImmediately(
    subscriptionId: string,
  ): Promise<Result<void, ExternalServiceError>>;
}

export const STRIPE_PORT = Symbol('STRIPE_PORT');
