import { Module, forwardRef } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { AuthModule } from '../auth';
import { ProjectModule } from '../project';
import { PromptModule } from '../prompt';
import { AutoScanService } from './infrastructure/auto-scan.service';
import { SCAN_JOB_REPOSITORY, SCAN_REPOSITORY } from './domain';
import { LLM_SERVICE } from './application/ports/llm.port';
import { LLMResponseProcessorService } from './application/services/llm-response-processor.service';
import { PostScanEmailService } from './application/services/post-scan-email.service';
import { MilestoneService } from './application/services/milestone.service';
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
import { ClaudeSonnetLLMAdapter } from './infrastructure/adapters/claude-sonnet-llm.adapter';
import { GPT52LLMAdapter } from './infrastructure/adapters/gpt52-llm.adapter';
import { LLMServiceImpl } from './infrastructure/adapters/llm.service';
import { MistralSmallLLMAdapter } from './infrastructure/adapters/mistral-small-llm.adapter';
import { MistralMediumLLMAdapter } from './infrastructure/adapters/mistral-medium-llm.adapter';
import { PrismaScanJobRepository } from './infrastructure/persistence/prisma-scan-job.repository';
import { PrismaScanRepository } from './infrastructure/persistence/prisma-scan.repository';
import { ScanController } from './presentation/controllers/scan.controller';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => ProjectModule),
    forwardRef(() => PromptModule),
    ScheduleModule.forRoot(),
  ],
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
    // Auto-scan cron service
    AutoScanService,
    // LLM adapters
    GPT52LLMAdapter,
    ClaudeSonnetLLMAdapter,
    MistralSmallLLMAdapter,
    MistralMediumLLMAdapter,
    // Services
    LLMResponseProcessorService,
    PostScanEmailService,
    MilestoneService,
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
    MistralSmallLLMAdapter,
    MistralMediumLLMAdapter,
    QUEUE_PROMPT_SCAN_USE_CASE,
    PROCESS_SCAN_JOB_USE_CASE,
  ],
})
export class ScanModule {}
