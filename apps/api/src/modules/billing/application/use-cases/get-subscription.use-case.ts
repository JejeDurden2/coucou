import { Inject, Injectable } from '@nestjs/common';
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

interface GetSubscriptionInput {
  userId: string;
}

export interface SubscriptionResponse {
  plan: Plan;
  status: SubscriptionStatus | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

@Injectable()
export class GetSubscriptionUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepository,
  ) {}

  async execute(input: GetSubscriptionInput): Promise<Result<SubscriptionResponse, DomainError>> {
    const { userId } = input;

    const user = await this.userRepository.findById(userId);
    if (!user) {
      return Result.err(new NotFoundError('User', userId));
    }

    const subscription = await this.subscriptionRepository.findByUserId(userId);

    return Result.ok({
      plan: user.plan,
      status: subscription?.status ?? null,
      currentPeriodEnd: subscription?.currentPeriodEnd?.toISOString() ?? null,
      cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
    });
  }
}
