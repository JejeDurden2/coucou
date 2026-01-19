import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Plan } from '@prisma/client';

import { ForbiddenError, NotFoundError, Result } from '../../../../common';
import { PROJECT_REPOSITORY, type ProjectRepository } from '../../../project';
import { PROMPT_REPOSITORY, type PromptRepository } from '../../../prompt';
import {
  AllProvidersFailedError,
  SCAN_REPOSITORY,
  type LLMResult,
  type ScanRepository,
} from '../../domain';
import type { LLMService } from '../ports/llm.port';
import { LLM_SERVICE } from '../ports/llm.port';
import type { ScanResponseDto } from '../dto/scan.dto';
import { LLMResponseProcessorService } from '../services/llm-response-processor.service';

type ExecuteScanError = NotFoundError | ForbiddenError | AllProvidersFailedError;

@Injectable()
export class ExecuteScanUseCase {
  private readonly logger = new Logger(ExecuteScanUseCase.name);

  constructor(
    @Inject(PROMPT_REPOSITORY)
    private readonly promptRepository: PromptRepository,
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
    @Inject(SCAN_REPOSITORY)
    private readonly scanRepository: ScanRepository,
    @Inject(LLM_SERVICE)
    private readonly llmService: LLMService,
    private readonly responseProcessor: LLMResponseProcessorService,
  ) {}

  async execute(
    promptId: string,
    userId: string,
    plan: Plan,
  ): Promise<Result<ScanResponseDto, ExecuteScanError>> {
    const prompt = await this.promptRepository.findById(promptId);

    if (!prompt) {
      return Result.err(new NotFoundError('Prompt', promptId));
    }

    const project = await this.projectRepository.findById(prompt.projectId);

    if (!project) {
      return Result.err(new NotFoundError('Project', prompt.projectId));
    }

    if (!project.belongsTo(userId)) {
      return Result.err(new ForbiddenError('You do not have access to this prompt'));
    }

    this.logger.log(`Executing scan for prompt ${promptId} with plan ${plan}`);

    const { successes, failures } = await this.llmService.queryByPlan(prompt.content, plan);

    if (successes.length === 0) {
      this.logger.error(`All LLM models failed for prompt ${promptId}`);
      return Result.err(
        new AllProvidersFailedError(
          failures.map((f) => ({ provider: f.provider, error: f.error })),
        ),
      );
    }

    if (failures.length > 0) {
      this.logger.warn(
        `Partial LLM failures for prompt ${promptId}: ${failures.map((f) => `${f.provider}/${f.model}`).join(', ')}`,
      );
    }

    const results: LLMResult[] = successes.map((response) =>
      this.responseProcessor.process(response, project.brandName, project.brandVariants),
    );

    const scan = await this.scanRepository.create({
      promptId,
      results,
    });

    await this.projectRepository.updateLastScannedAt(project.id, new Date());

    this.logger.log(`Scan ${scan.id} completed for prompt ${promptId}`);

    return Result.ok({
      id: scan.id,
      promptId: scan.promptId,
      executedAt: scan.executedAt,
      results: scan.results.map((r) => ({
        provider: r.provider,
        model: r.model,
        isCited: r.isCited,
        position: r.position,
        brandKeywords: r.brandKeywords,
        queryKeywords: r.queryKeywords,
        competitors: r.competitorMentions,
        latencyMs: r.latencyMs,
        parseSuccess: r.parseSuccess,
      })),
      isCitedByAny: scan.isCitedByAny,
      citationRate: scan.citationRate,
      providerErrors:
        failures.length > 0
          ? failures.map((f) => ({ provider: f.provider, error: f.error }))
          : undefined,
    });
  }
}
