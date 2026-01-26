import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import {
  ONBOARDING_QUEUE_NAME,
  onboardingJobOptions,
} from '../../infrastructure/queue/queue.config';
import { ProjectModule } from '../project';
import { PromptModule } from '../prompt';
import { BRAND_ANALYZER } from './application/ports/brand-analyzer.port';
import { GenerateOnboardingPromptsUseCase } from './application/use-cases/generate-onboarding-prompts.use-case';
import { ClaudeBrandAnalyzerAdapter } from './infrastructure/adapters/claude-brand-analyzer.adapter';
import { OnboardingProcessor } from './infrastructure/queue/onboarding.processor';
import { OnboardingQueueService } from './infrastructure/queue/onboarding-queue.service';
import { OnboardingController } from './presentation/controllers/onboarding.controller';

@Module({
  imports: [
    ProjectModule,
    PromptModule,
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
      useClass: ClaudeBrandAnalyzerAdapter,
    },
    OnboardingProcessor,
    OnboardingQueueService,
  ],
  exports: [OnboardingQueueService],
})
export class OnboardingModule {}
