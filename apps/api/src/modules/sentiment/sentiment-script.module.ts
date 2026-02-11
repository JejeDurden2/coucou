import { Inject, Injectable, Module } from '@nestjs/common';
import { InjectQueue, BullModule } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { SENTIMENT_QUEUE_NAME, sentimentJobOptions } from '../../infrastructure/queue/queue.config';
import type { SentimentJobData } from '../../infrastructure/queue/types/sentiment-job.types';
import { LoggerService } from '../../common/logger';

/**
 * Simplified queue service for scripts.
 * Only provides addJob() - no event listeners, no cron, no ConfigService dependency.
 */
@Injectable()
export class SentimentScriptQueueService {
  constructor(
    @InjectQueue(SENTIMENT_QUEUE_NAME)
    private readonly sentimentQueue: Queue<SentimentJobData>,
    @Inject(LoggerService)
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(SentimentScriptQueueService.name);
  }

  async addJob(data: SentimentJobData): Promise<string> {
    const job = await this.sentimentQueue.add('sentiment-scan', data, sentimentJobOptions);

    this.logger.info('Sentiment job queued', { jobId: job.id, projectId: data.projectId });

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
