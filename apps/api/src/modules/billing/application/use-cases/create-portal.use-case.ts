import { Inject, Injectable } from '@nestjs/common';

import { Result } from '../../../../common/utils/result';
import { ValidationError } from '../../../../common/errors/domain-error';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../../auth/domain/repositories/user.repository';
import { StripeService } from '../../infrastructure/stripe.service';
import type { PortalSessionResponse } from '../dto/billing.dto';

interface CreatePortalInput {
  userId: string;
  returnUrl: string;
}

@Injectable()
export class CreatePortalUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly stripeService: StripeService,
  ) {}

  async execute(input: CreatePortalInput): Promise<Result<PortalSessionResponse, ValidationError>> {
    const { userId, returnUrl } = input;

    const user = await this.userRepository.findById(userId);
    if (!user) {
      return Result.err(new ValidationError(['User not found']));
    }

    if (!user.stripeCustomerId) {
      return Result.err(
        new ValidationError(['No billing account - User has no Stripe customer ID']),
      );
    }

    const session = await this.stripeService.createPortalSession(user.stripeCustomerId, returnUrl);

    return Result.ok({ url: session.url });
  }
}
