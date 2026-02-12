import { forwardRef, Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma';
import { AuthModule } from '../auth/auth.module';
import { EmailModule } from '../email/email.module';
import { AuditModule } from '../audit/audit.module';

import { StripeService } from './infrastructure/stripe.service';
import { CreateCheckoutUseCase } from './application/use-cases/create-checkout.use-case';
import { CreatePortalUseCase } from './application/use-cases/create-portal.use-case';
import { HandleWebhookUseCase } from './application/use-cases/handle-webhook.use-case';
import { DowngradeSubscriptionUseCase } from './application/use-cases/downgrade-subscription.use-case';
import { GetSubscriptionUseCase } from './application/use-cases/get-subscription.use-case';
import { CancelDowngradeUseCase } from './application/use-cases/cancel-downgrade.use-case';
import { BillingController } from './presentation/billing.controller';
import { PlanLimitsService } from './domain/services/plan-limits.service';
import { SubscriptionRepositoryAdapter } from './infrastructure/adapters/subscription.repository.adapter';
import { StripeAdapter } from './infrastructure/adapters/stripe.adapter';
import { SUBSCRIPTION_REPOSITORY } from './domain/repositories/subscription.repository';
import { STRIPE_PORT } from './domain/ports/stripe.port';

@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule), EmailModule, forwardRef(() => AuditModule)],
  controllers: [BillingController],
  providers: [
    StripeService,
    CreateCheckoutUseCase,
    CreatePortalUseCase,
    HandleWebhookUseCase,
    DowngradeSubscriptionUseCase,
    GetSubscriptionUseCase,
    CancelDowngradeUseCase,
    {
      provide: PlanLimitsService,
      useValue: PlanLimitsService,
    },
    {
      provide: SUBSCRIPTION_REPOSITORY,
      useClass: SubscriptionRepositoryAdapter,
    },
    {
      provide: STRIPE_PORT,
      useClass: StripeAdapter,
    },
  ],
  exports: [StripeService, PlanLimitsService, SUBSCRIPTION_REPOSITORY, STRIPE_PORT],
})
export class BillingModule {}
