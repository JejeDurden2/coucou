import { Inject, Injectable } from '@nestjs/common';
import { Plan } from '@prisma/client';

import { NotFoundError, ForbiddenError } from '../../../../common/errors/domain-error';
import { Result } from '../../../../common/utils/result';
import {
  PROJECT_REPOSITORY,
  type ProjectRepository,
} from '../../../project/domain/repositories/project.repository';
import {
  SENTIMENT_SCAN_REPOSITORY,
  type SentimentScanRepository,
} from '../../domain/repositories/sentiment-scan.repository';
import type { SentimentHistoryDto } from '../dto/sentiment.dto';

type GetSentimentHistoryError = NotFoundError | ForbiddenError;

const SENTIMENT_RETENTION_DAYS: Record<Plan, number> = {
  [Plan.FREE]: 0, // No access
  [Plan.SOLO]: 180,
  [Plan.PRO]: 365 * 10, // "unlimited"
};

@Injectable()
export class GetSentimentHistoryUseCase {
  constructor(
    @Inject(SENTIMENT_SCAN_REPOSITORY)
    private readonly sentimentRepository: SentimentScanRepository,
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(
    projectId: string,
    userId: string,
    plan: Plan,
  ): Promise<Result<SentimentHistoryDto, GetSentimentHistoryError>> {
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      return Result.err(new NotFoundError('Project', projectId));
    }

    if (!project.belongsTo(userId)) {
      return Result.err(new ForbiddenError("Vous n'avez pas accès à ce projet"));
    }

    if (plan === Plan.FREE) {
      return Result.err(
        new ForbiddenError("Plan SOLO ou PRO requis pour accéder à l'analyse sentiment"),
      );
    }

    // Apply retention based on plan
    const retentionDays = SENTIMENT_RETENTION_DAYS[plan];
    const since = new Date();
    since.setDate(since.getDate() - retentionDays);

    const scans = await this.sentimentRepository.findHistoryByProjectId(projectId, since);

    return Result.ok({
      scans: scans.map((scan) => ({
        date: scan.scannedAt,
        score: scan.globalScore,
      })),
    });
  }
}
