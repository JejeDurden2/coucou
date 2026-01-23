import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';

import {
  EMAIL_QUEUE_NAME,
  SCAN_QUEUE_NAME,
  SENTIMENT_QUEUE_NAME,
  defaultJobOptions,
  scanJobOptions,
  sentimentJobOptions,
} from './queue.config';
import { EmailQueueService } from './email-queue.service';
import { EmailProcessor } from './email.processor';
import { ScanQueueService } from './scan-queue.service';

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
    BullModule.registerQueue({
      name: SCAN_QUEUE_NAME,
      defaultJobOptions: scanJobOptions,
    }),
    BullModule.registerQueue({
      name: SENTIMENT_QUEUE_NAME,
      defaultJobOptions: sentimentJobOptions,
    }),
  ],
  providers: [EmailQueueService, EmailProcessor, ScanQueueService],
  exports: [EmailQueueService, ScanQueueService, BullModule],
})
export class QueueModule {}
