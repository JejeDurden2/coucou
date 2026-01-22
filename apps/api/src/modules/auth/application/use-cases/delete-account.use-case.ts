import { Inject, Injectable, Logger } from '@nestjs/common';

import { Result } from '../../../../common/utils/result';
import type { DomainError } from '../../../../common/errors/domain-error';
import { NotFoundError, ValidationError } from '../../../../common/errors/domain-error';
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
  private readonly logger = new Logger(DeleteAccountUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepository,
    @Inject(STRIPE_PORT)
    private readonly stripePort: StripePort,
    private readonly emailQueueService: EmailQueueService,
  ) {}

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

    this.logger.log(`Starting account deletion for user: ${userId}`);

    const subscription = await this.subscriptionRepository.findByUserId(userId);
    if (subscription) {
      this.logger.log(`Canceling Stripe subscription: ${subscription.stripeSubscriptionId}`);
      const cancelResult = await this.stripePort.cancelSubscriptionImmediately(
        subscription.stripeSubscriptionId,
      );
      if (!cancelResult.ok) {
        this.logger.error(`Failed to cancel Stripe subscription: ${cancelResult.error.message}`);
        return Result.err(cancelResult.error);
      }
    }

    await this.userRepository.anonymize(userId);

    this.logger.log(`Account anonymized successfully for user: ${userId}`);

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
