import { Module } from '@nestjs/common';

import { ProjectModule } from '../project';
import { PromptModule } from '../prompt';
import { SCAN_REPOSITORY } from './domain';
import { LLM_SERVICE } from './application/ports/llm.port';
import {
  ExecuteProjectScanUseCase,
  ExecuteScanUseCase,
  GetScanHistoryUseCase,
} from './application/use-cases';
import { OpenAILLMAdapter } from './infrastructure/adapters/openai-llm.adapter';
import { AnthropicLLMAdapter } from './infrastructure/adapters/anthropic-llm.adapter';
import { LLMServiceImpl } from './infrastructure/adapters/llm.service';
import { PrismaScanRepository } from './infrastructure/persistence/prisma-scan.repository';
import { ScanController } from './presentation/controllers/scan.controller';

@Module({
  imports: [ProjectModule, PromptModule],
  controllers: [ScanController],
  providers: [
    // Use cases
    ExecuteScanUseCase,
    ExecuteProjectScanUseCase,
    GetScanHistoryUseCase,
    // LLM adapters
    OpenAILLMAdapter,
    AnthropicLLMAdapter,
    // Services
    {
      provide: LLM_SERVICE,
      useClass: LLMServiceImpl,
    },
    // Repository
    {
      provide: SCAN_REPOSITORY,
      useClass: PrismaScanRepository,
    },
  ],
  exports: [SCAN_REPOSITORY, LLM_SERVICE],
})
export class ScanModule {}
