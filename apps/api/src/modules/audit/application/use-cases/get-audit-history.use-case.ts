import { Inject, Injectable } from '@nestjs/common';
import type { AuditHistoryResponseDto } from '@coucou-ia/shared';

import { Result } from '../../../../common/utils/result';
import {
  NotFoundError,
  ForbiddenError,
} from '../../../../common/errors/domain-error';
import {
  PROJECT_REPOSITORY,
  type ProjectRepository,
} from '../../../project/domain/repositories/project.repository';
import {
  AUDIT_ORDER_REPOSITORY,
  type AuditOrderRepository,
} from '../../domain';

type GetAuditHistoryError = NotFoundError | ForbiddenError;

@Injectable()
export class GetAuditHistoryUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
    @Inject(AUDIT_ORDER_REPOSITORY)
    private readonly auditOrderRepository: AuditOrderRepository,
  ) {}

  async execute(
    projectId: string,
    userId: string,
  ): Promise<Result<AuditHistoryResponseDto, GetAuditHistoryError>> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      return Result.err(new NotFoundError('Project', projectId));
    }
    if (!project.belongsTo(userId)) {
      return Result.err(new ForbiddenError('Accès refusé à ce projet'));
    }

    const audits =
      await this.auditOrderRepository.findByProjectId(projectId);

    return Result.ok({
      audits: audits.map((audit) => ({
        id: audit.id,
        status: audit.status,
        geoScore: audit.geoScore,
        createdAt: audit.createdAt.toISOString(),
      })),
    });
  }
}
