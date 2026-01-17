import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma';
import { AuthModule } from '../auth/auth.module';

import { StripeService } from './infrastructure/stripe.service';
import { CreateCheckoutUseCase } from './application/use-cases/create-checkout.use-case';
import { CreatePortalUseCase } from './application/use-cases/create-portal.use-case';
import { HandleWebhookUseCase } from './application/use-cases/handle-webhook.use-case';
import { BillingController } from './presentation/billing.controller';
import { PlanLimitsService } from './domain/services/plan-limits.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [BillingController],
  providers: [
    StripeService,
    CreateCheckoutUseCase,
    CreatePortalUseCase,
    HandleWebhookUseCase,
    {
      provide: PlanLimitsService,
      useValue: PlanLimitsService,
    },
  ],
  exports: [StripeService, PlanLimitsService],
})
export class BillingModule {}
