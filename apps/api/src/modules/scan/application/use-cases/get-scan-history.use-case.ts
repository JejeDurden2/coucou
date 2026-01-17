import { Inject, Injectable } from '@nestjs/common';

import { ForbiddenError, NotFoundError, Result } from '../../../../common';
import { PROJECT_REPOSITORY, type ProjectRepository } from '../../../project';
import { SCAN_REPOSITORY, type ScanRepository } from '../../domain';
import type { ScanHistoryDto } from '../dto/scan.dto';

type GetScanHistoryError = NotFoundError | ForbiddenError;

@Injectable()
export class GetScanHistoryUseCase {
  constructor(
    @Inject(SCAN_REPOSITORY)
    private readonly scanRepository: ScanRepository,
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(
    projectId: string,
    userId: string,
    limit = 50,
  ): Promise<Result<ScanHistoryDto, GetScanHistoryError>> {
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      return Result.err(new NotFoundError('Project', projectId));
    }

    if (!project.belongsTo(userId)) {
      return Result.err(new ForbiddenError('You do not have access to this project'));
    }

    const scans = await this.scanRepository.findByProjectId(projectId, limit);

    return Result.ok({
      scans: scans.map((scan) => ({
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
      })),
      total: scans.length,
    });
  }
}
