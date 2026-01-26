import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Plan, ScanJobStatus } from '@prisma/client';

import { Result } from '../../../../common';
import type { DomainError } from '../../../../common/errors/domain-error';
import { NotFoundError } from '../../../../common/errors/domain-error';
import { EmailQueueService } from '../../../../infrastructure/queue/email-queue.service';
import type { ScanJobData, ScanJobResult } from '../../../../infrastructure/queue';
import { USER_REPOSITORY, type UserRepository } from '../../../auth';
import { UnsubscribeTokenService } from '../../../email/infrastructure/services/unsubscribe-token.service';
import { PROJECT_REPOSITORY, type ProjectRepository } from '../../../project';
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

export const PROCESS_SCAN_JOB_USE_CASE = Symbol('PROCESS_SCAN_JOB_USE_CASE');

@Injectable()
export class ProcessScanJobUseCase {
  private readonly logger = new Logger(ProcessScanJobUseCase.name);

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
    private readonly emailQueueService: EmailQueueService,
    private readonly unsubscribeTokenService: UnsubscribeTokenService,
    private readonly configService: ConfigService,
  ) {}

  async execute(data: ScanJobData): Promise<Result<ScanJobResult, DomainError>> {
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

    this.logger.log(`Processing scan job ${scanJobId} for project ${projectId}`);

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
          this.logger.debug(`Prompt ${prompt.id} skipped: ${result.reason}`);
        }
      } catch (error) {
        await this.scanJobRepository.incrementProgress(scanJobId, false);
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        errorMessages.push(`Prompt ${prompt.id}: ${errorMsg}`);
        this.logger.error(`Error processing prompt ${prompt.id}:`, error);
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

    // Send post-scan teaser email for SOLO/PRO users on auto scans
    if (data.source === 'auto' && (plan === Plan.SOLO || plan === Plan.PRO)) {
      await this.trySendPostScanEmail(userId, project);
    }

    this.logger.log(
      `Completed scan job ${scanJobId}: status=${finalStatus}, scans=${scansCreated}`,
    );

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
      this.logger.warn(
        `Blocked HIGH threat prompt for project ${project.id}: ${analysis.matchedPatterns.join(', ')}`,
      );
      return { success: false, reason: `Contenu suspect: ${analysis.matchedPatterns.join(', ')}` };
    }

    const wasSanitized = analysis.level === ThreatLevel.LOW;
    if (wasSanitized) {
      this.logger.log(
        `Sanitized LOW threat prompt for project ${project.id}: ${analysis.matchedPatterns.join(', ')}`,
      );
    }

    const { successes, failures } = await this.llmService.queryByPlan(analysis.sanitized, plan);

    if (successes.length === 0) {
      this.logger.error(
        `All LLM models failed for prompt ${prompt.id}: ${failures.map((f) => `${f.provider}/${f.model}: ${f.error}`).join(', ')}`,
      );
      return {
        success: false,
        reason: `Echec des modeles LLM: ${failures.map((f) => `${f.provider}/${f.model}`).join(', ')}`,
      };
    }

    if (failures.length > 0) {
      this.logger.warn(
        `Partial LLM failures for prompt ${prompt.id}: ${failures.map((f) => `${f.provider}/${f.model}`).join(', ')}`,
      );
    }

    const results: LLMResult[] = successes.map((response) =>
      this.responseProcessor.process(response, project.brandName, project.brandVariants),
    );

    await this.scanRepository.create({
      promptId: prompt.id,
      results,
    });

    await this.promptRepository.updateLastScannedAt(prompt.id, new Date());

    return { success: true };
  }

  private async trySendPostScanEmail(
    userId: string,
    project: { id: string; brandName: string },
  ): Promise<void> {
    try {
      const user = await this.userRepository.findByIdWithEmailPrefs(userId);
      if (!user) {
        this.logger.warn(`User ${userId} not found for post-scan email`);
        return;
      }

      // Check if user has email notifications enabled
      if (!user.emailNotificationsEnabled) {
        this.logger.debug(
          `User ${userId} has email notifications disabled, skipping post-scan email`,
        );
        return;
      }

      // Check if we already sent an email today
      if (user.lastPostScanEmailAt) {
        const today = new Date();
        const lastSent = new Date(user.lastPostScanEmailAt);
        if (
          lastSent.getFullYear() === today.getFullYear() &&
          lastSent.getMonth() === today.getMonth() &&
          lastSent.getDate() === today.getDate()
        ) {
          this.logger.debug(`User ${userId} already received post-scan email today, skipping`);
          return;
        }
      }

      const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
      const apiUrl = this.configService.getOrThrow<string>('API_URL');
      const unsubscribeToken = this.unsubscribeTokenService.generateToken(userId);

      await this.emailQueueService.addJob({
        type: 'post-scan',
        to: user.email,
        data: {
          firstName: user.name ?? user.email.split('@')[0],
          projectName: project.brandName,
          projectUrl: `${frontendUrl}/projects/${project.id}`,
          unsubscribeUrl: `${apiUrl}/email/unsubscribe?token=${unsubscribeToken}`,
        },
      });

      await this.userRepository.updateLastPostScanEmailAt(userId, new Date());

      this.logger.log(`Post-scan email queued for user ${userId}`);
    } catch (error) {
      // Don't fail the scan if email fails
      this.logger.error(`Failed to send post-scan email for user ${userId}:`, error);
    }
  }
}
