import { Inject, Injectable, Logger } from '@nestjs/common';
import type { LLMProvider } from '@prisma/client';

import { ForbiddenError, NotFoundError, Result } from '../../../../common';
import { PROJECT_REPOSITORY, type ProjectRepository } from '../../../project';
import { PROMPT_REPOSITORY, type PromptRepository } from '../../../prompt';
import {
  CompetitorExtractionService,
  MentionDetectionService,
  SCAN_REPOSITORY,
  type LLMResult,
  type ScanRepository,
} from '../../domain';
import type { LLMService, LLMResponse } from '../ports/llm.port';
import { LLM_SERVICE } from '../ports/llm.port';
import type { ScanResponseDto } from '../dto/scan.dto';

type ExecuteScanError = NotFoundError | ForbiddenError;

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

    // Query all LLMs
    const llmResponses = await this.llmService.queryAll(prompt.content);

    // Process results
    const results: LLMResult[] = [];

    for (const [provider, response] of llmResponses) {
      const result = this.processLLMResponse(
        provider,
        response,
        project.brandName,
        project.brandVariants,
      );
      results.push(result);
    }

    // Save scan
    const scan = await this.scanRepository.create({
      promptId,
      results,
    });

    // Update project lastScannedAt
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
        citationContext: r.citationContext,
        position: r.position,
        competitors: r.competitors,
        latencyMs: r.latencyMs,
      })),
      isCitedByAny: scan.isCitedByAny,
      citationRate: scan.citationRate,
    });
  }

  private processLLMResponse(
    provider: LLMProvider,
    response: LLMResponse,
    brandName: string,
    brandVariants: string[],
  ): LLMResult {
    const mentionResult = MentionDetectionService.detectMention(
      response.content,
      brandName,
      brandVariants,
    );

    const competitors = CompetitorExtractionService.extractCompetitors(
      response.content,
      brandName,
    );

    return {
      provider,
      model: response.model,
      rawResponse: response.content,
      isCited: mentionResult.isCited,
      citationContext: mentionResult.citationContext,
      position: mentionResult.position,
      competitors,
      latencyMs: response.latencyMs,
    };
  }
}
