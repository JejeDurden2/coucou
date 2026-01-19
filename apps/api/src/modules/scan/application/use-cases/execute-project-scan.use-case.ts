import { Inject, Injectable, Logger } from '@nestjs/common';
import { Plan } from '@prisma/client';

import { ForbiddenError, NotFoundError, Result } from '../../../../common';
import { PROJECT_REPOSITORY, type ProjectRepository } from '../../../project';
import { PROMPT_REPOSITORY, type PromptRepository } from '../../../prompt';
import {
  AllProvidersFailedError,
  PromptSanitizerService,
  ThreatLevel,
  SCAN_REPOSITORY,
  type LLMResult,
  type ScanRepository,
} from '../../domain';
import type { LLMService } from '../ports/llm.port';
import { LLM_SERVICE } from '../ports/llm.port';
import type { ScanResponseDto } from '../dto/scan.dto';
import { LLMResponseProcessorService } from '../services/llm-response-processor.service';

// Scan cooldown periods by plan
const SCAN_COOLDOWN_MS: Record<Plan, number> = {
  [Plan.FREE]: 7 * 24 * 60 * 60 * 1000, // 7 days
  [Plan.SOLO]: 7 * 24 * 60 * 60 * 1000, // 7 days
  [Plan.PRO]: 24 * 60 * 60 * 1000, // 1 day
};

type ExecuteProjectScanError = NotFoundError | ForbiddenError | AllProvidersFailedError;

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
    private readonly responseProcessor: LLMResponseProcessorService,
  ) {}

  async execute(
    projectId: string,
    userId: string,
    plan: Plan,
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

    this.logger.log(`Executing scan for project ${projectId} with ${prompts.length} prompts`);

    const scanResults: ScanResponseDto[] = [];
    let hasAtLeastOneSuccess = false;
    let lastAllProvidersError: AllProvidersFailedError | null = null;

    for (const prompt of prompts) {
      // Check scan cooldown based on plan
      if (prompt.lastScannedAt !== null) {
        const cooldownMs = SCAN_COOLDOWN_MS[plan];
        const timeSinceLastScan = Date.now() - prompt.lastScannedAt.getTime();
        if (timeSinceLastScan < cooldownMs) {
          const cooldownLabel = plan === Plan.PRO ? 'jour' : 'semaine';
          scanResults.push({
            id: '',
            promptId: prompt.id,
            executedAt: new Date(),
            results: [],
            isCitedByAny: false,
            citationRate: 0,
            skippedReason: `Prompt déjà scanné cette ${cooldownLabel}`,
          });
          continue;
        }
      }

      const analysis = PromptSanitizerService.analyze(prompt.content);

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

      const wasSanitized = analysis.level === ThreatLevel.LOW;
      if (wasSanitized) {
        this.logger.log(
          `Sanitized LOW threat prompt for project ${projectId}: ${analysis.matchedPatterns.join(', ')}`,
        );
      }

      const { successes, failures } = await this.llmService.queryByPlan(analysis.sanitized, plan);

      if (successes.length === 0) {
        this.logger.error(
          `All LLM models failed for prompt ${prompt.id}: ${failures.map((f) => `${f.provider}/${f.model}: ${f.error}`).join(', ')}`,
        );
        lastAllProvidersError = new AllProvidersFailedError(
          failures.map((f) => ({ provider: f.provider, error: f.error })),
        );
        scanResults.push({
          id: '',
          promptId: prompt.id,
          executedAt: new Date(),
          results: [],
          isCitedByAny: false,
          citationRate: 0,
          skippedReason: `Echec des modeles LLM: ${failures.map((f) => `${f.provider}/${f.model}`).join(', ')}`,
          providerErrors: failures.map((f) => ({ provider: f.provider, error: f.error })),
        });
        continue;
      }

      hasAtLeastOneSuccess = true;

      if (failures.length > 0) {
        this.logger.warn(
          `Partial LLM failures for prompt ${prompt.id}: ${failures.map((f) => `${f.provider}/${f.model}`).join(', ')}`,
        );
      }

      const results: LLMResult[] = successes.map((response) =>
        this.responseProcessor.process(response, project.brandName, project.brandVariants),
      );

      const scan = await this.scanRepository.create({
        promptId: prompt.id,
        results,
      });

      await this.promptRepository.updateLastScannedAt(prompt.id, new Date());

      scanResults.push({
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
        wasSanitized: wasSanitized || undefined,
        providerErrors:
          failures.length > 0
            ? failures.map((f) => ({ provider: f.provider, error: f.error }))
            : undefined,
      });
    }

    if (!hasAtLeastOneSuccess && lastAllProvidersError) {
      return Result.err(lastAllProvidersError);
    }

    await this.projectRepository.updateLastScannedAt(project.id, new Date());

    this.logger.log(`Completed ${scanResults.length} scans for project ${projectId}`);

    return Result.ok(scanResults);
  }
}
