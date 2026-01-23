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
import type { LatestSentimentResponseDto, SentimentScanDto } from '../dto/sentiment.dto';

type GetLatestSentimentError = NotFoundError | ForbiddenError;

@Injectable()
export class GetLatestSentimentUseCase {
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
  ): Promise<Result<LatestSentimentResponseDto, GetLatestSentimentError>> {
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

    const scan = await this.sentimentRepository.findLatestByProjectId(projectId);
    const nextScanDate = this.getNextTuesday8AM();

    const scanDto: SentimentScanDto | null = scan
      ? {
          id: scan.id,
          projectId: scan.projectId,
          scannedAt: scan.scannedAt,
          globalScore: scan.globalScore,
          results: scan.results,
          createdAt: scan.createdAt,
        }
      : null;

    return Result.ok({
      scan: scanDto,
      nextScanDate,
    });
  }

  private getNextTuesday8AM(): Date {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 2 = Tuesday

    // Calculate days until next Tuesday
    let daysUntilTuesday = (2 - currentDay + 7) % 7;

    // If today is Tuesday, check if we're past 8 AM
    if (daysUntilTuesday === 0) {
      const parisTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
      if (parisTime.getHours() >= 8) {
        daysUntilTuesday = 7; // Next Tuesday
      }
    }

    // If daysUntilTuesday is still 0, it means we're before 8 AM on Tuesday
    if (daysUntilTuesday === 0) {
      daysUntilTuesday = 0;
    }

    const nextTuesday = new Date(now);
    nextTuesday.setDate(now.getDate() + daysUntilTuesday);

    // Set to 8:00 AM Paris time (we'll use UTC offset for Europe/Paris)
    // This is a simplified approach - in production you might use a library like date-fns-tz
    nextTuesday.setUTCHours(7, 0, 0, 0); // 7 UTC = 8 AM Paris (winter) / 9 AM Paris (summer)

    return nextTuesday;
  }
}
