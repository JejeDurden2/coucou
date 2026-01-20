import { Module } from '@nestjs/common';

import { ProjectModule } from '../project';
import { PromptModule } from '../prompt';
import { BRAND_ANALYZER } from './application/ports/brand-analyzer.port';
import { GenerateOnboardingPromptsUseCase } from './application/use-cases/generate-onboarding-prompts.use-case';
import { ClaudeBrandAnalyzerAdapter } from './infrastructure/adapters/claude-brand-analyzer.adapter';
import { OnboardingController } from './presentation/controllers/onboarding.controller';

@Module({
  imports: [ProjectModule, PromptModule],
  controllers: [OnboardingController],
  providers: [
    GenerateOnboardingPromptsUseCase,
    {
      provide: BRAND_ANALYZER,
      useClass: ClaudeBrandAnalyzerAdapter,
    },
  ],
})
export class OnboardingModule {}
