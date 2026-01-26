import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Plan } from '@prisma/client';

import { Result } from '../../../../common/utils/result';
import { ValidationError } from '../../../../common/errors/domain-error';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../../auth/domain/repositories/user.repository';
import { StripeService } from '../../infrastructure/stripe.service';
import type { CheckoutSessionResponse } from '../dto/billing.dto';

interface CreateCheckoutInput {
  userId: string;
  plan: Plan;
  successUrl: string;
  cancelUrl: string;
}

@Injectable()
export class CreateCheckoutUseCase {
  private readonly allowedOrigins: string[];

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService,
  ) {
    this.allowedOrigins = (
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000'
    )
      .split(',')
      .map((origin) => origin.trim());
  }

  private isAllowedRedirectUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return this.allowedOrigins.some((origin) => {
        const allowed = new URL(origin);
        return parsed.origin === allowed.origin;
      });
    } catch {
      return false;
    }
  }

  async execute(
    input: CreateCheckoutInput,
  ): Promise<Result<CheckoutSessionResponse, ValidationError>> {
    const { userId, plan, successUrl, cancelUrl } = input;

    if (!this.isAllowedRedirectUrl(successUrl) || !this.isAllowedRedirectUrl(cancelUrl)) {
      return Result.err(new ValidationError(['Redirect URLs must match the application domain']));
    }

    if (plan === Plan.FREE) {
      return Result.err(new ValidationError(['FREE plan does not require payment']));
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      return Result.err(new ValidationError(['User not found']));
    }

    let customerId = user.stripeCustomerId;

    // Create Stripe customer if not exists or if the stored customer is invalid
    if (!customerId || !(await this.stripeService.customerExists(customerId))) {
      customerId = await this.stripeService.createCustomer(user.email, user.name);
      await this.userRepository.updatePlan(userId, user.plan, customerId);
    }

    const session = await this.stripeService.createCheckoutSession(
      customerId,
      plan,
      successUrl,
      cancelUrl,
    );

    if (!session.url) {
      return Result.err(new ValidationError(['Failed to create checkout session']));
    }

    return Result.ok({ url: session.url });
  }
}
