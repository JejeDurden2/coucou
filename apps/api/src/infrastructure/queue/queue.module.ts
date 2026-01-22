import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';

import { EMAIL_QUEUE_NAME, defaultJobOptions } from './queue.config';
import { EmailQueueService } from './email-queue.service';
import { EmailProcessor } from './email.processor';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          url: configService.get<string>('REDIS_URL', 'redis://localhost:6379'),
        },
      }),
    }),
    BullModule.registerQueue({
      name: EMAIL_QUEUE_NAME,
      defaultJobOptions,
    }),
  ],
  providers: [EmailQueueService, EmailProcessor],
  exports: [EmailQueueService],
})
export class QueueModule {}
