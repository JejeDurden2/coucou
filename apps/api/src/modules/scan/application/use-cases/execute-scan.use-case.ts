import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Plan } from '@prisma/client';

import {
  ForbiddenError,
  NotFoundError,
  Result,
  ScanLimitError,
  ValidationError,
  withSpan,
} from '../../../../common';
import { LoggerService } from '../../../../common/logger';
import {
  PROJECT_REPOSITORY,
  type ProjectRepository,
} from '../../../project/domain/repositories/project.repository';
import { PROMPT_REPOSITORY, type PromptRepository } from '../../../prompt';
import {
  AllProvidersFailedError,
  getCooldownLabel,
  PromptSanitizerService,
  ThreatLevel,
  SCAN_COOLDOWN_MS,
  MAX_SCANS_PER_PERIOD,
  SCAN_REPOSITORY,
  type LLMResult,
  type ScanRepository,
} from '../../domain';
import type { LLMService } from '../ports/llm.port';
import { LLM_SERVICE } from '../ports/llm.port';
import type { ScanResponseDto } from '../dto/scan.dto';
import { LLMResponseProcessorService } from '../services/llm-response-processor.service';

type ExecuteScanError =
  | NotFoundError
  | ForbiddenError
  | AllProvidersFailedError
  | ValidationError
  | ScanLimitError;

@Injectable()
export class ExecuteScanUseCase {
  constructor(
    @Inject(forwardRef(() => PROMPT_REPOSITORY))
    private readonly promptRepository: PromptRepository,
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
    @Inject(SCAN_REPOSITORY)
    private readonly scanRepository: ScanRepository,
    @Inject(LLM_SERVICE)
    private readonly llmService: LLMService,
    private readonly responseProcessor: LLMResponseProcessorService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(ExecuteScanUseCase.name);
  }

  async execute(
    promptId: string,
    userId: string,
    plan: Plan,
  ): Promise<Result<ScanResponseDto, ExecuteScanError>> {
    return withSpan(
      'scan-module',
      'ExecuteScanUseCase.execute',
      { 'scan.promptId': promptId, 'scan.userId': userId, 'scan.plan': plan },
      async () => {
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

        // Check user-level scan quota for the period (prevents bypass via prompt deletion)
        const cooldownMs = SCAN_COOLDOWN_MS[plan];
        const periodStart = new Date(Date.now() - cooldownMs);
        const recentScans = await this.scanRepository.countUserScansInPeriod(userId, periodStart);
        const maxScans = MAX_SCANS_PER_PERIOD[plan];

        if (recentScans >= maxScans) {
          return Result.err(new ScanLimitError(recentScans, maxScans, plan));
        }

        // Check scan cooldown based on plan (per-prompt cooldown)
        if (prompt.lastScannedAt !== null) {
          const timeSinceLastScan = Date.now() - prompt.lastScannedAt.getTime();
          if (timeSinceLastScan < cooldownMs) {
            return Result.err(
              new ValidationError([
                `Ce prompt a déjà été scanné cette ${getCooldownLabel(plan)}. Prochain scan disponible bientôt.`,
              ]),
            );
          }
        }

        const analysis = PromptSanitizerService.analyze(prompt.content);

        if (analysis.level === ThreatLevel.HIGH) {
          this.logger.warn('Blocked HIGH threat prompt', {
            promptId,
            matchedPatterns: analysis.matchedPatterns,
          });
          return Result.err(
            new ValidationError([
              `Contenu suspect détecté: ${analysis.matchedPatterns.join(', ')}`,
            ]),
          );
        }

        if (analysis.level === ThreatLevel.LOW) {
          this.logger.info('Sanitized LOW threat prompt', {
            promptId,
            matchedPatterns: analysis.matchedPatterns,
          });
        }

        this.logger.info('Executing scan for prompt', { promptId, plan });

        const { successes, failures } = await this.llmService.queryByPlan(analysis.sanitized, plan);

        if (successes.length === 0) {
          this.logger.error('All LLM models failed for prompt', undefined, { promptId });
          return Result.err(
            new AllProvidersFailedError(
              failures.map((f) => ({ provider: f.provider, error: f.error })),
            ),
          );
        }

        if (failures.length > 0) {
          this.logger.warn('Partial LLM failures for prompt', {
            promptId,
            failures: failures.map((f) => ({ provider: f.provider, model: f.model })),
          });
        }

        const results: LLMResult[] = successes.map((response) =>
          this.responseProcessor.process(response, project.brandName, project.brandVariants),
        );

        const scan = await this.scanRepository.create({
          promptId,
          provider: results[0].provider,
          results,
        });

        const scanDate = new Date();
        await this.promptRepository.updateLastScannedAt(promptId, scanDate);
        await this.projectRepository.updateLastScannedAt(project.id, scanDate);

        this.logger.info('Scan completed for prompt', { scanId: scan.id, promptId });

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
      },
    );
  }
}
