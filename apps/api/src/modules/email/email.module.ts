import { Module, Global } from '@nestjs/common';

import { EMAIL_PORT } from './application/ports/email.port';
import { ResendEmailAdapter } from './infrastructure/adapters/resend-email.adapter';
import { UnsubscribeController } from './infrastructure/controllers/unsubscribe.controller';
import { PlanLimitNotificationService } from './infrastructure/services/plan-limit-notification.service';
import { UnsubscribeTokenService } from './infrastructure/services/unsubscribe-token.service';

@Global()
@Module({
  controllers: [UnsubscribeController],
  providers: [
    {
      provide: EMAIL_PORT,
      useClass: ResendEmailAdapter,
    },
    UnsubscribeTokenService,
    PlanLimitNotificationService,
  ],
  exports: [EMAIL_PORT, UnsubscribeTokenService, PlanLimitNotificationService],
})
export class EmailModule {}
