import { Inject, Injectable, Logger } from '@nestjs/common';
import type { LLMProvider } from '@prisma/client';

import { ForbiddenError, NotFoundError, Result } from '../../../../common';
import { PROJECT_REPOSITORY, type ProjectRepository } from '../../../project';
import { PROMPT_REPOSITORY, type PromptRepository } from '../../../prompt';
import {
  CompetitorExtractionService,
  MentionDetectionService,
  PromptSanitizerService,
  ThreatLevel,
  SCAN_REPOSITORY,
  type LLMResult,
  type ScanRepository,
} from '../../domain';
import type { LLMService, LLMResponse } from '../ports/llm.port';
import { LLM_SERVICE } from '../ports/llm.port';
import type { ScanResponseDto } from '../dto/scan.dto';

type ExecuteProjectScanError = NotFoundError | ForbiddenError;

@Injectable()
export class ExecuteProjectScanUseCase {
  private readonly logger = new Logger(ExecuteProjectScanUseCase.name);

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
    projectId: string,
    userId: string,
  ): Promise<Result<ScanResponseDto[], ExecuteProjectScanError>> {
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      return Result.err(new NotFoundError('Project', projectId));
    }

    if (!project.belongsTo(userId)) {
      return Result.err(new ForbiddenError('You do not have access to this project'));
    }

    const prompts = await this.promptRepository.findActiveByProjectId(projectId);

    if (prompts.length === 0) {
      return Result.ok([]);
    }

    this.logger.log(
      `Executing scan for project ${projectId} with ${prompts.length} prompts`,
    );

    const scanResults: ScanResponseDto[] = [];

    for (const prompt of prompts) {
      // Analyze prompt for potential injection attacks
      const analysis = PromptSanitizerService.analyze(prompt.content);

      // Block HIGH threat prompts entirely
      if (analysis.level === ThreatLevel.HIGH) {
        this.logger.warn(
          `Blocked HIGH threat prompt for project ${projectId}: ${analysis.matchedPatterns.join(', ')}`,
        );
        scanResults.push({
          id: '',
          promptId: prompt.id,
          executedAt: new Date(),
          results: [],
          isCitedByAny: false,
          citationRate: 0,
          skippedReason: `Prompt bloqué: contenu suspect détecté (${analysis.matchedPatterns.join(', ')})`,
        });
        continue;
      }

      // Log LOW threat prompts but continue with sanitized version
      const wasSanitized = analysis.level === ThreatLevel.LOW;
      if (wasSanitized) {
        this.logger.log(
          `Sanitized LOW threat prompt for project ${projectId}: ${analysis.matchedPatterns.join(', ')}`,
        );
      }

      const llmResponses = await this.llmService.queryAll(analysis.sanitized);

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

      const scan = await this.scanRepository.create({
        promptId: prompt.id,
        results,
      });

      scanResults.push({
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
        wasSanitized: wasSanitized || undefined,
      });
    }

    await this.projectRepository.updateLastScannedAt(project.id, new Date());

    this.logger.log(
      `Completed ${scanResults.length} scans for project ${projectId}`,
    );

    return Result.ok(scanResults);
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
