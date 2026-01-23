import { Injectable, Logger, Module } from '@nestjs/common';
import { InjectQueue, BullModule } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { SENTIMENT_QUEUE_NAME, sentimentJobOptions } from '../../infrastructure/queue/queue.config';
import type { SentimentJobData } from '../../infrastructure/queue/types/sentiment-job.types';

/**
 * Simplified queue service for scripts.
 * Only provides addJob() - no event listeners, no cron, no ConfigService dependency.
 */
@Injectable()
export class SentimentScriptQueueService {
  private readonly logger = new Logger(SentimentScriptQueueService.name);

  constructor(
    @InjectQueue(SENTIMENT_QUEUE_NAME)
    private readonly sentimentQueue: Queue<SentimentJobData>,
  ) {}

  async addJob(data: SentimentJobData): Promise<string> {
    const job = await this.sentimentQueue.add('sentiment-scan', data, sentimentJobOptions);

    this.logger.log({
      message: 'Sentiment job queued',
      jobId: job.id,
      projectId: data.projectId,
    });

    return job.id ?? '';
  }
}

/**
 * Minimal module for sentiment-related scripts.
 *
 * Uses SentimentScriptQueueService instead of the full SentimentQueueService
 * to avoid ConfigService and event listener dependencies.
 */
@Module({
  imports: [
    BullModule.registerQueue({
      name: SENTIMENT_QUEUE_NAME,
      defaultJobOptions: sentimentJobOptions,
    }),
  ],
  providers: [SentimentScriptQueueService],
  exports: [SentimentScriptQueueService],
})
export class SentimentScriptModule {}
