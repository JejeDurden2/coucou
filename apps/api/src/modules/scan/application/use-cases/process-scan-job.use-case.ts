import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Plan, ScanJobStatus } from '@prisma/client';

import { Result, withSpan } from '../../../../common';
import { LoggerService } from '../../../../common/logger';
import type { DomainError } from '../../../../common/errors/domain-error';
import { NotFoundError } from '../../../../common/errors/domain-error';
import type { ScanJobData, ScanJobResult } from '../../../../infrastructure/queue';
import { USER_REPOSITORY, type UserRepository } from '../../../auth';
import {
  PROJECT_REPOSITORY,
  type ProjectRepository,
} from '../../../project/domain/repositories/project.repository';
import { PROMPT_REPOSITORY, type PromptRepository } from '../../../prompt';
import {
  getCooldownLabel,
  PromptSanitizerService,
  SCAN_COOLDOWN_MS,
  SCAN_JOB_REPOSITORY,
  SCAN_REPOSITORY,
  ThreatLevel,
  type LLMResult,
  type ScanJobRepository,
  type ScanRepository,
} from '../../domain';
import type { LLMService } from '../ports/llm.port';
import { LLM_SERVICE } from '../ports/llm.port';
import { LLMResponseProcessorService } from '../services/llm-response-processor.service';
import { PostScanEmailService } from '../services/post-scan-email.service';
import { MilestoneService } from '../services/milestone.service';

export const PROCESS_SCAN_JOB_USE_CASE = Symbol('PROCESS_SCAN_JOB_USE_CASE');

@Injectable()
export class ProcessScanJobUseCase {
  constructor(
    @Inject(forwardRef(() => PROMPT_REPOSITORY))
    private readonly promptRepository: PromptRepository,
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
    @Inject(SCAN_REPOSITORY)
    private readonly scanRepository: ScanRepository,
    @Inject(SCAN_JOB_REPOSITORY)
    private readonly scanJobRepository: ScanJobRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(LLM_SERVICE)
    private readonly llmService: LLMService,
    private readonly responseProcessor: LLMResponseProcessorService,
    private readonly postScanEmailService: PostScanEmailService,
    private readonly milestoneService: MilestoneService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(ProcessScanJobUseCase.name);
  }

  async execute(data: ScanJobData): Promise<Result<ScanJobResult, DomainError>> {
    return withSpan(
      'scan-module',
      'ProcessScanJobUseCase.execute',
      {
        'scan.jobId': data.scanJobId,
        'scan.projectId': data.projectId,
        'scan.userId': data.userId,
        'scan.plan': data.plan,
      },
      async () => {
        const { scanJobId, projectId, userId, plan } = data;

        // Verify job exists
        const scanJob = await this.scanJobRepository.findById(scanJobId);
        if (!scanJob) {
          return Result.err(new NotFoundError('ScanJob', scanJobId));
        }

        // Mark job as processing
        await this.scanJobRepository.update(scanJobId, {
          status: ScanJobStatus.PROCESSING,
          startedAt: new Date(),
        });

        this.logger.info('Processing scan job', { scanJobId, projectId });

        const project = await this.projectRepository.findById(projectId);
        if (!project) {
          await this.scanJobRepository.update(scanJobId, {
            status: ScanJobStatus.FAILED,
            errorMessage: `Project ${projectId} not found`,
            completedAt: new Date(),
          });
          return Result.err(new NotFoundError('Project', projectId));
        }

        // Single prompt scan or project-wide scan
        let prompts: Array<{ id: string; content: string; lastScannedAt: Date | null }>;
        if (scanJob.promptId) {
          const prompt = await this.promptRepository.findById(scanJob.promptId);
          if (!prompt) {
            await this.scanJobRepository.update(scanJobId, {
              status: ScanJobStatus.FAILED,
              errorMessage: `Prompt ${scanJob.promptId} not found`,
              completedAt: new Date(),
            });
            return Result.err(new NotFoundError('Prompt', scanJob.promptId));
          }
          prompts = [prompt];
        } else {
          prompts = await this.promptRepository.findActiveByProjectId(projectId);
        }

        let scansCreated = 0;
        let hasAtLeastOneSuccess = false;
        const errorMessages: string[] = [];

        for (const prompt of prompts) {
          try {
            const result = await this.processPrompt(prompt, project, plan);

            // Increment progress
            await this.scanJobRepository.incrementProgress(scanJobId, result.success);

            if (result.success) {
              hasAtLeastOneSuccess = true;
              scansCreated++;
            } else if (result.reason) {
              this.logger.debug('Prompt skipped', { promptId: prompt.id, reason: result.reason });
            }
          } catch (error) {
            await this.scanJobRepository.incrementProgress(scanJobId, false);
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            errorMessages.push(`Prompt ${prompt.id}: ${errorMsg}`);
            this.logger.error(
              'Error processing prompt',
              error instanceof Error ? error : undefined,
              { promptId: prompt.id },
            );
          }
        }

        // Determine final status
        const updatedJob = await this.scanJobRepository.findById(scanJobId);
        const totalProcessed = updatedJob?.processedPrompts ?? prompts.length;
        const successCount = updatedJob?.successCount ?? 0;
        const failureCount = updatedJob?.failureCount ?? 0;

        let finalStatus: ScanJobStatus;
        if (successCount === totalProcessed && failureCount === 0) {
          finalStatus = ScanJobStatus.COMPLETED;
        } else if (hasAtLeastOneSuccess) {
          finalStatus = ScanJobStatus.PARTIAL;
        } else {
          finalStatus = ScanJobStatus.FAILED;
        }

        await this.scanJobRepository.update(scanJobId, {
          status: finalStatus,
          completedAt: new Date(),
          errorMessage: errorMessages.length > 0 ? errorMessages.join('; ') : undefined,
        });

        await this.projectRepository.updateLastScannedAt(project.id, new Date());
        await this.userRepository.updateLastScanAt(userId, new Date());

        // Send post-scan email: auto scans for SOLO/PRO, manual scans for all plans
        if (
          hasAtLeastOneSuccess &&
          (data.source === 'auto' ? plan === Plan.SOLO || plan === Plan.PRO : true)
        ) {
          await this.postScanEmailService.trySend(userId, project, plan);
        }

        // Check milestones (non-blocking)
        if (hasAtLeastOneSuccess) {
          this.milestoneService.tryCheck(userId, project).catch((error) => {
            this.logger.error(
              'Milestone check failed',
              error instanceof Error ? error : undefined,
              { userId },
            );
          });
        }

        this.logger.info('Completed scan job', {
          scanJobId,
          status: finalStatus,
          scansCreated,
        });

        return Result.ok({
          status:
            finalStatus === ScanJobStatus.COMPLETED
              ? 'completed'
              : finalStatus === ScanJobStatus.PARTIAL
                ? 'partial'
                : 'failed',
          scansCreated,
          errorMessage: errorMessages.length > 0 ? errorMessages.join('; ') : undefined,
        });
      },
    );
  }

  private async processPrompt(
    prompt: { id: string; content: string; lastScannedAt: Date | null },
    project: { id: string; brandName: string; brandVariants: string[] },
    plan: Plan,
  ): Promise<{ success: boolean; reason?: string }> {
    // Check scan cooldown based on plan
    if (prompt.lastScannedAt !== null) {
      const cooldownMs = SCAN_COOLDOWN_MS[plan];
      const timeSinceLastScan = Date.now() - prompt.lastScannedAt.getTime();
      if (timeSinceLastScan < cooldownMs) {
        return { success: false, reason: `Prompt déjà scanné cette ${getCooldownLabel(plan)}` };
      }
    }

    const analysis = PromptSanitizerService.analyze(prompt.content);

    if (analysis.level === ThreatLevel.HIGH) {
      this.logger.warn('Blocked HIGH threat prompt', {
        projectId: project.id,
        matchedPatterns: analysis.matchedPatterns,
      });
      return { success: false, reason: `Contenu suspect: ${analysis.matchedPatterns.join(', ')}` };
    }

    const wasSanitized = analysis.level === ThreatLevel.LOW;
    if (wasSanitized) {
      this.logger.info('Sanitized LOW threat prompt', {
        projectId: project.id,
        matchedPatterns: analysis.matchedPatterns,
      });
    }

    const { successes, failures } = await this.llmService.queryByPlan(analysis.sanitized, plan);

    if (successes.length === 0) {
      this.logger.error('All LLM models failed for prompt', undefined, {
        promptId: prompt.id,
        failures: failures.map((f) => ({
          provider: f.provider,
          model: f.model,
          error: f.error,
        })),
      });
      return {
        success: false,
        reason: `Echec des modeles LLM: ${failures.map((f) => `${f.provider}/${f.model}`).join(', ')}`,
      };
    }

    if (failures.length > 0) {
      this.logger.warn('Partial LLM failures for prompt', {
        promptId: prompt.id,
        failures: failures.map((f) => ({ provider: f.provider, model: f.model })),
      });
    }

    const results: LLMResult[] = successes.map((response) =>
      this.responseProcessor.process(response, project.brandName, project.brandVariants),
    );

    await this.scanRepository.create({
      promptId: prompt.id,
      provider: results[0].provider,
      results,
    });

    await this.promptRepository.updateLastScannedAt(prompt.id, new Date());

    return { success: true };
  }
}
