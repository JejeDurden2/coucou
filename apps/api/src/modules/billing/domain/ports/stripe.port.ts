import { Result } from '../../../../common/utils/result';
import { ExternalServiceError } from '../../../../common/errors/domain-error';

export interface CancelAtPeriodEndResult {
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export interface StripePort {
  cancelAtPeriodEnd(
    subscriptionId: string,
  ): Promise<Result<CancelAtPeriodEndResult, ExternalServiceError>>;
}

export const STRIPE_PORT = Symbol('STRIPE_PORT');
