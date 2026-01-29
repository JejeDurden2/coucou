import { Inject, Injectable } from '@nestjs/common';

import { Result } from '../../../../common/utils/result';
import type { DomainError } from '../../../../common/errors/domain-error';
import { NotFoundError, ValidationError } from '../../../../common/errors/domain-error';
import { LoggerService } from '../../../../common/logger';
import { EmailQueueService } from '../../../../infrastructure/queue';
import { USER_REPOSITORY, type UserRepository } from '../../domain/repositories/user.repository';
import {
  SUBSCRIPTION_REPOSITORY,
  type SubscriptionRepository,
} from '../../../billing/domain/repositories/subscription.repository';
import { STRIPE_PORT, type StripePort } from '../../../billing/domain/ports/stripe.port';

const CONFIRMATION_TEXT = 'SUPPRIMER';

interface DeleteAccountInput {
  userId: string;
  confirmation: string;
}

export interface DeleteAccountResult {
  message: string;
}

@Injectable()
export class DeleteAccountUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepository,
    @Inject(STRIPE_PORT)
    private readonly stripePort: StripePort,
    private readonly emailQueueService: EmailQueueService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(DeleteAccountUseCase.name);
  }

  async execute(input: DeleteAccountInput): Promise<Result<DeleteAccountResult, DomainError>> {
    const { userId, confirmation } = input;

    if (confirmation !== CONFIRMATION_TEXT) {
      return Result.err(
        new ValidationError([`Le texte de confirmation doit être "${CONFIRMATION_TEXT}"`]),
      );
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      return Result.err(new NotFoundError('User', userId));
    }

    const userEmail = user.email;
    const userName = user.name;

    this.logger.info('Starting account deletion', { userId });

    const subscription = await this.subscriptionRepository.findByUserId(userId);
    if (subscription) {
      this.logger.info('Canceling Stripe subscription', {
        subscriptionId: subscription.stripeSubscriptionId,
      });
      const cancelResult = await this.stripePort.cancelSubscriptionImmediately(
        subscription.stripeSubscriptionId,
      );
      if (!cancelResult.ok) {
        this.logger.error('Failed to cancel Stripe subscription', {
          error: cancelResult.error.message,
        });
        return Result.err(cancelResult.error);
      }
    }

    await this.userRepository.anonymize(userId);

    this.logger.info('Account anonymized successfully', { userId });

    // Send deletion confirmation email via queue
    await this.emailQueueService.addJob({
      type: 'account-deleted',
      to: userEmail,
      data: { userName },
    });

    return Result.ok({
      message: 'Votre compte a été supprimé avec succès.',
    });
  }
}
