import { Inject, Injectable, Logger } from '@nestjs/common';
import { Plan, ScanJobStatus } from '@prisma/client';

import { ForbiddenError, NotFoundError, Result, ScanLimitError } from '../../../../common';
import { ScanQueueService } from '../../../../infrastructure/queue';
import { PROJECT_REPOSITORY, type ProjectRepository } from '../../../project';
import { PROMPT_REPOSITORY, type PromptRepository } from '../../../prompt';
import {
  MAX_SCANS_PER_PERIOD,
  SCAN_COOLDOWN_MS,
  SCAN_JOB_REPOSITORY,
  SCAN_REPOSITORY,
  type ScanJobRepository,
  type ScanRepository,
} from '../../domain';

export interface QueueProjectScanInput {
  projectId: string;
  userId: string;
  plan: Plan;
}

export interface QueueProjectScanResponse {
  jobId: string;
  status: ScanJobStatus;
  totalPrompts: number;
  createdAt: Date;
}

type QueueProjectScanError = NotFoundError | ForbiddenError | ScanLimitError;

export const QUEUE_PROJECT_SCAN_USE_CASE = Symbol('QUEUE_PROJECT_SCAN_USE_CASE');

@Injectable()
export class QueueProjectScanUseCase {
  private readonly logger = new Logger(QueueProjectScanUseCase.name);

  constructor(
    @Inject(PROMPT_REPOSITORY)
    private readonly promptRepository: PromptRepository,
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
    @Inject(SCAN_REPOSITORY)
    private readonly scanRepository: ScanRepository,
    @Inject(SCAN_JOB_REPOSITORY)
    private readonly scanJobRepository: ScanJobRepository,
    private readonly scanQueueService: ScanQueueService,
  ) {}

  async execute(
    input: QueueProjectScanInput,
  ): Promise<Result<QueueProjectScanResponse, QueueProjectScanError>> {
    const { projectId, userId, plan } = input;

    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      return Result.err(new NotFoundError('Project', projectId));
    }

    if (!project.belongsTo(userId)) {
      return Result.err(new ForbiddenError('You do not have access to this project'));
    }

    // Check user-level scan quota for the period
    const cooldownMs = SCAN_COOLDOWN_MS[plan];
    const periodStart = new Date(Date.now() - cooldownMs);
    const recentScans = await this.scanRepository.countUserScansInPeriod(userId, periodStart);
    const maxScans = MAX_SCANS_PER_PERIOD[plan];

    if (recentScans >= maxScans) {
      return Result.err(new ScanLimitError(recentScans, maxScans, plan));
    }

    const prompts = await this.promptRepository.findActiveByProjectId(projectId);

    if (prompts.length === 0) {
      // Create a completed job with 0 prompts
      const scanJob = await this.scanJobRepository.create({
        projectId,
        userId,
        totalPrompts: 0,
      });

      const completedJob = await this.scanJobRepository.update(scanJob.id, {
        status: ScanJobStatus.COMPLETED,
        completedAt: new Date(),
      });

      return Result.ok({
        jobId: completedJob.id,
        status: completedJob.status,
        totalPrompts: 0,
        createdAt: completedJob.createdAt,
      });
    }

    // Create scan job record
    const scanJob = await this.scanJobRepository.create({
      projectId,
      userId,
      totalPrompts: prompts.length,
    });

    // Queue the job for background processing
    await this.scanQueueService.addJob({
      scanJobId: scanJob.id,
      projectId,
      userId,
      plan,
    });

    this.logger.log(
      `Queued scan job ${scanJob.id} for project ${projectId} with ${prompts.length} prompts`,
    );

    return Result.ok({
      jobId: scanJob.id,
      status: scanJob.status,
      totalPrompts: scanJob.totalPrompts,
      createdAt: scanJob.createdAt,
    });
  }
}
