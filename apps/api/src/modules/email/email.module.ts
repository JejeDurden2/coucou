import { Module, Global } from '@nestjs/common';

import { EMAIL_PORT } from './application/ports/email.port';
import { ResendEmailAdapter } from './infrastructure/adapters/resend-email.adapter';

@Global()
@Module({
  providers: [
    {
      provide: EMAIL_PORT,
      useClass: ResendEmailAdapter,
    },
  ],
  exports: [EMAIL_PORT],
})
export class EmailModule {}
