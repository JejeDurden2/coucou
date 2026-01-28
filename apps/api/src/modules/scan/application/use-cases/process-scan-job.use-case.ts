import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Plan, ScanJobStatus } from '@prisma/client';

import { Result, withSpan } from '../../../../common';
import type { DomainError } from '../../../../common/errors/domain-error';
import { NotFoundError } from '../../../../common/errors/domain-error';
import { EmailQueueService } from '../../../../infrastructure/queue/email-queue.service';
import type { ScanJobData, ScanJobResult } from '../../../../infrastructure/queue';
import { USER_REPOSITORY, type UserRepository } from '../../../auth';
import { UnsubscribeTokenService } from '../../../email';
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

        // Send post-scan email: auto scans for SOLO/PRO, manual scans for all plans
        if (
          hasAtLeastOneSuccess &&
          (data.source === 'auto' ? plan === Plan.SOLO || plan === Plan.PRO : true)
        ) {
          await this.trySendPostScanEmail(userId, project, plan);
        }

        // Check milestones (non-blocking)
        if (hasAtLeastOneSuccess) {
          this.tryCheckMilestones(userId, project).catch((error) => {
            this.logger.error(`Milestone check failed for user ${userId}:`, error);
          });
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
    plan: Plan,
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

      const { citationRate, citationRateChange } = await this.computeCitationSummary(project.id);

      await this.emailQueueService.addJob({
        type: 'post-scan',
        to: user.email,
        data: {
          firstName: user.name ?? user.email.split('@')[0],
          projectName: project.brandName,
          projectUrl: `${frontendUrl}/projects/${project.id}`,
          unsubscribeUrl: `${apiUrl}/email/unsubscribe?token=${unsubscribeToken}`,
          citationRate,
          citationRateChange,
          upgradeUrl: plan === Plan.FREE ? `${frontendUrl}/billing` : undefined,
        },
      });

      await this.userRepository.updateLastPostScanEmailAt(userId, new Date());

      this.logger.log(`Post-scan email queued for user ${userId}`);
    } catch (error) {
      // Don't fail the scan if email fails
      this.logger.error(`Failed to send post-scan email for user ${userId}:`, error);
    }
  }

  private async computeCitationSummary(
    projectId: string,
  ): Promise<{ citationRate?: number; citationRateChange?: number }> {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const [currentScans, previousScans] = await Promise.all([
      this.scanRepository.findByProjectIdInRange(projectId, oneWeekAgo, now),
      this.scanRepository.findByProjectIdInRange(projectId, twoWeeksAgo, oneWeekAgo),
    ]);

    if (currentScans.length === 0) {
      return {};
    }

    const totalResults = currentScans.reduce((sum, s) => sum + s.results.length, 0);
    const citedResults = currentScans.reduce(
      (sum, s) => sum + s.results.filter((r) => r.isCited).length,
      0,
    );
    const citationRate = totalResults > 0 ? Math.round((citedResults / totalResults) * 100) : 0;

    if (previousScans.length === 0) {
      return { citationRate };
    }

    const prevTotal = previousScans.reduce((sum, s) => sum + s.results.length, 0);
    const prevCited = previousScans.reduce(
      (sum, s) => sum + s.results.filter((r) => r.isCited).length,
      0,
    );
    const prevRate = prevTotal > 0 ? Math.round((prevCited / prevTotal) * 100) : 0;

    return { citationRate, citationRateChange: citationRate - prevRate };
  }

  private async tryCheckMilestones(
    userId: string,
    project: { id: string; brandName: string },
  ): Promise<void> {
    const user = await this.userRepository.findByIdWithEmailPrefs(userId);
    if (!user || !user.emailNotificationsEnabled) return;

    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    const apiUrl = this.configService.getOrThrow<string>('API_URL');
    const unsubscribeToken = this.unsubscribeTokenService.generateToken(userId);
    const firstName = user.name ?? user.email.split('@')[0];
    const projectUrl = `${frontendUrl}/projects/${project.id}`;
    const unsubscribeUrl = `${apiUrl}/email/unsubscribe?token=${unsubscribeToken}`;

    // Use count query for scan milestones (avoids loading all scan data)
    const scanCount = await this.scanRepository.countByProjectId(project.id);

    const SCAN_MILESTONES = [5, 10, 25, 50, 100];
    if (SCAN_MILESTONES.includes(scanCount)) {
      await this.emailQueueService.addJob({
        type: 'milestone-scan-count',
        to: user.email,
        data: { firstName, scanCount, brandName: project.brandName, projectUrl, unsubscribeUrl },
      });
      this.logger.log(`Scan count milestone (${scanCount}) email queued for user ${userId}`);
    }

    // First citation check: load recent scans (limited to 100 by default)
    const recentScans = await this.scanRepository.findByProjectId(project.id);
    const totalCited = recentScans.flatMap((s) => s.results).filter((r) => r.isCited).length;

    if (totalCited === 1) {
      await this.emailQueueService.addJob({
        type: 'milestone-first-citation',
        to: user.email,
        data: { firstName, brandName: project.brandName, projectUrl, unsubscribeUrl },
      });
      this.logger.log(`First citation milestone email queued for user ${userId}`);
    }
  }
}
