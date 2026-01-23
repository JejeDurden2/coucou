import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { ProjectModule } from '../project';
import { ScanModule } from '../scan';
import { SentimentProcessor, SentimentQueueService } from '../../infrastructure/queue';
import { SENTIMENT_SCAN_REPOSITORY } from './domain';
import { ExecuteSentimentScanUseCase } from './application/use-cases';
import { GetLatestSentimentUseCase } from './application/use-cases/get-latest-sentiment.use-case';
import { GetSentimentHistoryUseCase } from './application/use-cases/get-sentiment-history.use-case';
import { PrismaSentimentScanRepository } from './infrastructure/persistence/prisma-sentiment-scan.repository';
import { SentimentController } from './presentation/controllers/sentiment.controller';

@Module({
  imports: [ProjectModule, ScanModule, ScheduleModule.forRoot()],
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
  ],
  exports: [SENTIMENT_SCAN_REPOSITORY, ExecuteSentimentScanUseCase, SentimentQueueService],
})
export class SentimentModule {}
