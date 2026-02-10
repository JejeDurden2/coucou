import { Module, forwardRef } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';

import { ProjectModule } from '../project';
import { ScanModule } from '../scan';
import { MistralMediumLLMAdapter } from '../scan/infrastructure/adapters/mistral-medium-llm.adapter';
import { SENTIMENT_QUEUE_NAME, sentimentJobOptions } from '../../infrastructure/queue/queue.config';
import { LoggerService } from '../../common/logger';
import { SENTIMENT_SCAN_REPOSITORY } from './domain';
import { SENTIMENT_ANALYZER } from './application/ports/sentiment-analyzer.port';
import { ExecuteSentimentScanUseCase } from './application/use-cases';
import { GetLatestSentimentUseCase } from './application/use-cases/get-latest-sentiment.use-case';
import { GetSentimentHistoryUseCase } from './application/use-cases/get-sentiment-history.use-case';
import { MistralSentimentAnalyzer } from './infrastructure/adapters/mistral-sentiment-analyzer.adapter';
import { PrismaSentimentScanRepository } from './infrastructure/persistence/prisma-sentiment-scan.repository';
import { SentimentController } from './presentation/controllers/sentiment.controller';
import { SentimentQueueService } from './infrastructure/queue/sentiment-queue.service';
import { SentimentProcessor } from './infrastructure/queue/sentiment.processor';

@Module({
  imports: [
    ProjectModule,
    forwardRef(() => ScanModule),
    ScheduleModule.forRoot(),
    BullModule.registerQueue({
      name: SENTIMENT_QUEUE_NAME,
      defaultJobOptions: sentimentJobOptions,
    }),
  ],
  controllers: [SentimentController],
  providers: [
    ExecuteSentimentScanUseCase,
    GetLatestSentimentUseCase,
    GetSentimentHistoryUseCase,
    SentimentProcessor,
    SentimentQueueService,
    {
      provide: SENTIMENT_SCAN_REPOSITORY,
      useClass: PrismaSentimentScanRepository,
    },
    {
      provide: SENTIMENT_ANALYZER,
      useFactory: (mistralAdapter: MistralMediumLLMAdapter, logger: LoggerService) =>
        new MistralSentimentAnalyzer(mistralAdapter, logger),
      inject: [MistralMediumLLMAdapter, LoggerService],
    },
  ],
  exports: [
    SENTIMENT_SCAN_REPOSITORY,
    ExecuteSentimentScanUseCase,
    SentimentQueueService,
    SENTIMENT_ANALYZER,
  ],
})
export class SentimentModule {}
