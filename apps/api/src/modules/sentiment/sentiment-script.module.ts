import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { SENTIMENT_QUEUE_NAME, sentimentJobOptions } from '../../infrastructure/queue/queue.config';
import { SENTIMENT_SCAN_REPOSITORY } from './domain';
import { PrismaSentimentScanRepository } from './infrastructure/persistence/prisma-sentiment-scan.repository';
import { SentimentQueueService } from './infrastructure/queue/sentiment-queue.service';

/**
 * Minimal module for sentiment-related scripts.
 *
 * This module provides only what's needed for:
 * - Queuing sentiment scan jobs
 * - Querying sentiment scan history
 *
 * It does NOT include:
 * - SentimentProcessor (job processing happens in the main app)
 * - ExecuteSentimentScanUseCase (LLM dependencies)
 * - HTTP controllers
 * - Cron scheduling (ScheduleModule not loaded)
 */
@Module({
  imports: [
    BullModule.registerQueue({
      name: SENTIMENT_QUEUE_NAME,
      defaultJobOptions: sentimentJobOptions,
    }),
  ],
  providers: [
    SentimentQueueService,
    {
      provide: SENTIMENT_SCAN_REPOSITORY,
      useClass: PrismaSentimentScanRepository,
    },
  ],
  exports: [SentimentQueueService],
})
export class SentimentScriptModule {}
