import { Module } from '@nestjs/common';

import { ScanProcessor } from '../../infrastructure/queue/scan.processor';
import { ProjectModule } from '../project';
import { PromptModule } from '../prompt';
import { SCAN_JOB_REPOSITORY, SCAN_REPOSITORY } from './domain';
import { LLM_SERVICE } from './application/ports/llm.port';
import { LLMResponseProcessorService } from './application/services/llm-response-processor.service';
import {
  GetScanHistoryUseCase,
  QueueProjectScanUseCase,
  QUEUE_PROJECT_SCAN_USE_CASE,
  QueuePromptScanUseCase,
  QUEUE_PROMPT_SCAN_USE_CASE,
  ProcessScanJobUseCase,
  PROCESS_SCAN_JOB_USE_CASE,
  GetScanJobStatusUseCase,
  GET_SCAN_JOB_STATUS_USE_CASE,
} from './application/use-cases';
import { AnthropicLLMAdapter } from './infrastructure/adapters/anthropic-llm.adapter';
import { ClaudeOpusLLMAdapter } from './infrastructure/adapters/claude-opus-llm.adapter';
import { ClaudeSonnetLLMAdapter } from './infrastructure/adapters/claude-sonnet-llm.adapter';
import { GPT4oLLMAdapter } from './infrastructure/adapters/gpt4o-llm.adapter';
import { GPT52LLMAdapter } from './infrastructure/adapters/gpt52-llm.adapter';
import { LLMServiceImpl } from './infrastructure/adapters/llm.service';
import { OpenAILLMAdapter } from './infrastructure/adapters/openai-llm.adapter';
import { PrismaScanJobRepository } from './infrastructure/persistence/prisma-scan-job.repository';
import { PrismaScanRepository } from './infrastructure/persistence/prisma-scan.repository';
import { ScanController } from './presentation/controllers/scan.controller';

@Module({
  imports: [ProjectModule, PromptModule],
  controllers: [ScanController],
  providers: [
    // Use cases
    GetScanHistoryUseCase,
    {
      provide: QUEUE_PROJECT_SCAN_USE_CASE,
      useClass: QueueProjectScanUseCase,
    },
    {
      provide: QUEUE_PROMPT_SCAN_USE_CASE,
      useClass: QueuePromptScanUseCase,
    },
    {
      provide: PROCESS_SCAN_JOB_USE_CASE,
      useClass: ProcessScanJobUseCase,
    },
    {
      provide: GET_SCAN_JOB_STATUS_USE_CASE,
      useClass: GetScanJobStatusUseCase,
    },
    // Processor (domain-specific, registered here)
    ScanProcessor,
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
    // Repositories
    {
      provide: SCAN_REPOSITORY,
      useClass: PrismaScanRepository,
    },
    {
      provide: SCAN_JOB_REPOSITORY,
      useClass: PrismaScanJobRepository,
    },
  ],
  exports: [
    SCAN_REPOSITORY,
    SCAN_JOB_REPOSITORY,
    LLM_SERVICE,
    GPT52LLMAdapter,
    ClaudeSonnetLLMAdapter,
  ],
})
export class ScanModule {}
