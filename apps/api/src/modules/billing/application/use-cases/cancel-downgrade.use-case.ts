import { Inject, Injectable, Logger } from '@nestjs/common';
import { Plan, SubscriptionStatus } from '@prisma/client';

import { Result } from '../../../../common/utils/result';
import type { DomainError } from '../../../../common/errors/domain-error';
import { NotFoundError } from '../../../../common/errors/domain-error';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../../auth/domain/repositories/user.repository';
import {
  SUBSCRIPTION_REPOSITORY,
  type SubscriptionRepository,
} from '../../domain/repositories/subscription.repository';
import { STRIPE_PORT, type StripePort } from '../../domain/ports/stripe.port';
import {
  AlreadyOnFreePlanError,
  NoActiveSubscriptionError,
  SubscriptionNotActiveError,
  SubscriptionNotPendingCancellationError,
} from '../../domain/errors/billing.errors';

interface CancelDowngradeInput {
  userId: string;
}

export interface CancelDowngradeResult {
  currentPlan: Plan;
  message: string;
}

@Injectable()
export class CancelDowngradeUseCase {
  private readonly logger = new Logger(CancelDowngradeUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepository,
    @Inject(STRIPE_PORT)
    private readonly stripePort: StripePort,
  ) {}

  async execute(input: CancelDowngradeInput): Promise<Result<CancelDowngradeResult, DomainError>> {
    const { userId } = input;

    const user = await this.userRepository.findById(userId);
    if (!user) {
      return Result.err(new NotFoundError('User', userId));
    }

    if (user.plan === Plan.FREE) {
      return Result.err(new AlreadyOnFreePlanError());
    }

    const subscription = await this.subscriptionRepository.findByUserId(userId);
    if (!subscription) {
      return Result.err(new NoActiveSubscriptionError());
    }

    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      return Result.err(new SubscriptionNotActiveError());
    }

    if (!subscription.cancelAtPeriodEnd) {
      return Result.err(new SubscriptionNotPendingCancellationError());
    }

    const stripeResult = await this.stripePort.resumeSubscription(
      subscription.stripeSubscriptionId,
    );

    if (!stripeResult.ok) {
      return Result.err(stripeResult.error);
    }

    await this.subscriptionRepository.update(subscription.id, {
      cancelAtPeriodEnd: false,
    });

    this.logger.log(`Downgrade cancelled for user: ${userId}`);

    return Result.ok({
      currentPlan: user.plan,
      message: `Votre abonnement ${user.plan} a été réactivé avec succès.`,
    });
  }
}
