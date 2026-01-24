import { Module, Global, forwardRef } from '@nestjs/common';

import { QueueModule } from '../../infrastructure/queue/queue.module';
import { EMAIL_PORT } from './application/ports/email.port';
import { ResendEmailAdapter } from './infrastructure/adapters/resend-email.adapter';
import { UnsubscribeController } from './infrastructure/controllers/unsubscribe.controller';
import { InactivityCheckService } from './infrastructure/inactivity-check.service';
import { UnsubscribeTokenService } from './infrastructure/services/unsubscribe-token.service';

@Global()
@Module({
  imports: [forwardRef(() => QueueModule)],
  controllers: [UnsubscribeController],
  providers: [
    {
      provide: EMAIL_PORT,
      useClass: ResendEmailAdapter,
    },
    InactivityCheckService,
    UnsubscribeTokenService,
  ],
  exports: [EMAIL_PORT, UnsubscribeTokenService],
})
export class EmailModule {}
