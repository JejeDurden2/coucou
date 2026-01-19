import { Module } from '@nestjs/common';

import { ProjectModule } from '../project';
import { PromptModule } from '../prompt';
import { SCAN_REPOSITORY } from './domain';
import { LLM_SERVICE } from './application/ports/llm.port';
import { LLMResponseProcessorService } from './application/services/llm-response-processor.service';
import {
  ExecuteProjectScanUseCase,
  ExecuteScanUseCase,
  GetScanHistoryUseCase,
} from './application/use-cases';
import { AnthropicLLMAdapter } from './infrastructure/adapters/anthropic-llm.adapter';
import { ClaudeOpusLLMAdapter } from './infrastructure/adapters/claude-opus-llm.adapter';
import { ClaudeSonnetLLMAdapter } from './infrastructure/adapters/claude-sonnet-llm.adapter';
import { GPT4oLLMAdapter } from './infrastructure/adapters/gpt4o-llm.adapter';
import { GPT52LLMAdapter } from './infrastructure/adapters/gpt52-llm.adapter';
import { LLMServiceImpl } from './infrastructure/adapters/llm.service';
import { OpenAILLMAdapter } from './infrastructure/adapters/openai-llm.adapter';
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
    GPT4oLLMAdapter,
    GPT52LLMAdapter,
    ClaudeSonnetLLMAdapter,
    ClaudeOpusLLMAdapter,
    // Services
    LLMResponseProcessorService,
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
