import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Plan, SubscriptionStatus } from '@prisma/client';

import { Result } from '../../../../common/utils/result';
import type { DomainError } from '../../../../common/errors/domain-error';
import { NotFoundError } from '../../../../common/errors/domain-error';
import { EmailQueueService } from '../../../../infrastructure/queue';
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
  SubscriptionAlreadyCancelingError,
  SubscriptionNotActiveError,
} from '../../domain/errors/billing.errors';

type PaidPlan = Exclude<Plan, 'FREE'>;

interface DowngradeSubscriptionInput {
  userId: string;
}

export interface DowngradeSubscriptionResult {
  success: boolean;
  effectiveDate: string;
  currentPlan: Plan;
  message: string;
}

function isPaidPlan(plan: Plan): plan is PaidPlan {
  return plan !== Plan.FREE;
}

@Injectable()
export class DowngradeSubscriptionUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepository,
    @Inject(STRIPE_PORT)
    private readonly stripePort: StripePort,
    private readonly emailQueueService: EmailQueueService,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    input: DowngradeSubscriptionInput,
  ): Promise<Result<DowngradeSubscriptionResult, DomainError>> {
    const { userId } = input;

    const user = await this.userRepository.findById(userId);
    if (!user) {
      return Result.err(new NotFoundError('User', userId));
    }

    if (!isPaidPlan(user.plan)) {
      return Result.err(new AlreadyOnFreePlanError());
    }

    const subscription = await this.subscriptionRepository.findByUserId(userId);
    if (!subscription) {
      return Result.err(new NoActiveSubscriptionError());
    }

    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      return Result.err(new SubscriptionNotActiveError());
    }

    if (subscription.cancelAtPeriodEnd) {
      return Result.err(new SubscriptionAlreadyCancelingError());
    }

    const stripeResult = await this.stripePort.cancelAtPeriodEnd(subscription.stripeSubscriptionId);

    if (!stripeResult.ok) {
      return Result.err(stripeResult.error);
    }

    const { currentPeriodEnd } = stripeResult.value;

    await this.subscriptionRepository.update(subscription.id, {
      cancelAtPeriodEnd: true,
    });

    // Send downgrade email via queue
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'https://coucou-ia.com';
    await this.emailQueueService.addJob({
      type: 'plan-downgrade',
      to: user.email,
      data: {
        userName: user.name ?? user.email.split('@')[0],
        currentPlan: user.plan,
        effectiveDate: currentPeriodEnd.toISOString(),
        dashboardUrl: `${frontendUrl}/projects`,
      },
    });

    const effectiveDate = currentPeriodEnd.toISOString();
    const formattedDate = this.formatDate(currentPeriodEnd);

    return Result.ok({
      success: true,
      effectiveDate,
      currentPlan: user.plan,
      message: `Votre abonnement sera annulé le ${formattedDate}. Vous conservez l'accès aux fonctionnalités ${user.plan} jusqu'à cette date.`,
    });
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  }
}
