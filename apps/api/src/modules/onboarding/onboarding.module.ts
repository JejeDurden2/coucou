import { forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import {
  ONBOARDING_QUEUE_NAME,
  onboardingJobOptions,
} from '../../infrastructure/queue/queue.config';
import { WebScraperModule } from '../../common/infrastructure/web-scraper/web-scraper.module';
import { WebScraperService } from '../../common/infrastructure/web-scraper/web-scraper.service';
import { LoggerService } from '../../common/logger';
import { ProjectModule } from '../project';
import { PromptModule } from '../prompt';
import { ScanModule } from '../scan';
import { MistralMediumLLMAdapter } from '../scan/infrastructure/adapters/mistral-medium-llm.adapter';
import { BRAND_ANALYZER } from './application/ports/brand-analyzer.port';
import { GenerateOnboardingPromptsUseCase } from './application/use-cases/generate-onboarding-prompts.use-case';
import { MistralBrandAnalyzerAdapter } from './infrastructure/adapters/mistral-brand-analyzer.adapter';
import { OnboardingProcessor } from './infrastructure/queue/onboarding.processor';
import { OnboardingQueueService } from './infrastructure/queue/onboarding-queue.service';
import { OnboardingController } from './presentation/controllers/onboarding.controller';

@Module({
  imports: [
    forwardRef(() => ProjectModule),
    PromptModule,
    forwardRef(() => ScanModule),
    WebScraperModule,
    BullModule.registerQueue({
      name: ONBOARDING_QUEUE_NAME,
      defaultJobOptions: onboardingJobOptions,
    }),
  ],
  controllers: [OnboardingController],
  providers: [
    GenerateOnboardingPromptsUseCase,
    {
      provide: BRAND_ANALYZER,
      useFactory: (
        mistralMedium: MistralMediumLLMAdapter,
        webScraper: WebScraperService,
        logger: LoggerService,
      ) => new MistralBrandAnalyzerAdapter(mistralMedium, webScraper, logger),
      inject: [MistralMediumLLMAdapter, WebScraperService, LoggerService],
    },
    OnboardingProcessor,
    OnboardingQueueService,
  ],
  exports: [OnboardingQueueService],
})
export class OnboardingModule {}
