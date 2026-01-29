import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Plan, ScanJobStatus } from '@prisma/client';

import {
  ForbiddenError,
  NotFoundError,
  Result,
  ScanLimitError,
  ValidationError,
} from '../../../../common';
import { LoggerService } from '../../../../common/logger';
import { ScanQueueService } from '../../../../infrastructure/queue';
import {
  PROJECT_REPOSITORY,
  type ProjectRepository,
} from '../../../project/domain/repositories/project.repository';
import { PROMPT_REPOSITORY, type PromptRepository } from '../../../prompt';
import {
  getCooldownLabel,
  MAX_SCANS_PER_PERIOD,
  SCAN_COOLDOWN_MS,
  SCAN_JOB_REPOSITORY,
  SCAN_REPOSITORY,
  type ScanJobRepository,
  type ScanRepository,
} from '../../domain';

export interface QueuePromptScanInput {
  promptId: string;
  userId: string;
  plan: Plan;
}

export interface QueuePromptScanResponse {
  jobId: string;
  status: ScanJobStatus;
  totalPrompts: number;
  createdAt: Date;
}

type QueuePromptScanError = NotFoundError | ForbiddenError | ScanLimitError | ValidationError;

export const QUEUE_PROMPT_SCAN_USE_CASE = Symbol('QUEUE_PROMPT_SCAN_USE_CASE');

@Injectable()
export class QueuePromptScanUseCase {
  constructor(
    @Inject(forwardRef(() => PROMPT_REPOSITORY))
    private readonly promptRepository: PromptRepository,
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
    @Inject(SCAN_REPOSITORY)
    private readonly scanRepository: ScanRepository,
    @Inject(SCAN_JOB_REPOSITORY)
    private readonly scanJobRepository: ScanJobRepository,
    private readonly scanQueueService: ScanQueueService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(QueuePromptScanUseCase.name);
  }

  async execute(
    input: QueuePromptScanInput,
  ): Promise<Result<QueuePromptScanResponse, QueuePromptScanError>> {
    const { promptId, userId, plan } = input;

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

    // Check user-level scan quota for the period
    const cooldownMs = SCAN_COOLDOWN_MS[plan];
    const periodStart = new Date(Date.now() - cooldownMs);
    const recentScans = await this.scanRepository.countUserScansInPeriod(userId, periodStart);
    const maxScans = MAX_SCANS_PER_PERIOD[plan];

    if (recentScans >= maxScans) {
      return Result.err(new ScanLimitError(recentScans, maxScans, plan));
    }

    // Check per-prompt cooldown
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

    // Create scan job record with promptId
    const scanJob = await this.scanJobRepository.create({
      projectId: project.id,
      userId,
      promptId,
      totalPrompts: 1,
    });

    // Queue the job for background processing
    await this.scanQueueService.addJob({
      scanJobId: scanJob.id,
      projectId: project.id,
      userId,
      plan,
    });

    this.logger.info('Queued scan job for prompt', { scanJobId: scanJob.id, promptId });

    return Result.ok({
      jobId: scanJob.id,
      status: scanJob.status,
      totalPrompts: scanJob.totalPrompts,
      createdAt: scanJob.createdAt,
    });
  }
}
