import { Inject, Injectable, Logger } from '@nestjs/common';
import type { LLMProvider } from '@prisma/client';

import { ForbiddenError, NotFoundError, Result } from '../../../../common';
import { PROJECT_REPOSITORY, type ProjectRepository } from '../../../project';
import { PROMPT_REPOSITORY, type PromptRepository } from '../../../prompt';
import {
  AllProvidersFailedError,
  GEOResponseParserService,
  SCAN_REPOSITORY,
  type LLMResult,
  type ScanRepository,
} from '../../domain';
import type { LLMService, LLMResponse } from '../ports/llm.port';
import { LLM_SERVICE } from '../ports/llm.port';
import type { ScanResponseDto } from '../dto/scan.dto';

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
  ) {}

  async execute(
    promptId: string,
    userId: string,
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

    this.logger.log(`Executing scan for prompt ${promptId}`);

    const { successes, failures } = await this.llmService.queryAll(prompt.content);

    if (successes.size === 0) {
      this.logger.error(`All LLM providers failed for prompt ${promptId}`);
      return Result.err(
        new AllProvidersFailedError(
          failures.map((f) => ({ provider: f.provider, error: f.error })),
        ),
      );
    }

    if (failures.length > 0) {
      this.logger.warn(
        `Partial LLM failures for prompt ${promptId}: ${failures.map((f) => f.provider).join(', ')}`,
      );
    }

    const results: LLMResult[] = [];
    for (const [provider, response] of successes) {
      const result = this.processLLMResponse(
        provider,
        response,
        project.brandName,
        project.brandVariants,
      );
      results.push(result);
    }

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

  private processLLMResponse(
    provider: LLMProvider,
    response: LLMResponse,
    brandName: string,
    brandVariants: string[],
  ): LLMResult {
    const parseResult = GEOResponseParserService.parse(response.content);

    if (!parseResult.success || !parseResult.response) {
      this.logger.warn(`Failed to parse GEO response from ${provider}: ${parseResult.error}`);
      return {
        provider,
        model: response.model,
        rawResponse: response.content,
        isCited: false,
        position: null,
        brandKeywords: [],
        queryKeywords: [],
        competitorMentions: [],
        latencyMs: response.latencyMs,
        parseSuccess: false,
      };
    }

    const insights = GEOResponseParserService.extractInsights(
      parseResult.response,
      brandName,
      brandVariants,
    );

    return {
      provider,
      model: response.model,
      rawResponse: response.content,
      isCited: insights.position !== null,
      position: insights.position,
      brandKeywords: insights.brandKeywords,
      queryKeywords: insights.queryKeywords,
      competitorMentions: insights.competitors,
      latencyMs: response.latencyMs,
      parseSuccess: true,
    };
  }
}
