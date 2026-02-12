import { Inject, Injectable } from '@nestjs/common';
import { AuditStatus } from '@coucou-ia/shared';
import type { LatestAuditResponseDto } from '@coucou-ia/shared';

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

type GetLatestAuditError = NotFoundError | ForbiddenError;

const IN_PROGRESS_STATUSES: ReadonlySet<AuditStatus> = new Set([
  AuditStatus.PENDING,
  AuditStatus.PAID,
  AuditStatus.PROCESSING,
]);

const COMPLETED_STATUSES: ReadonlySet<AuditStatus> = new Set([
  AuditStatus.COMPLETED,
  AuditStatus.PARTIAL,
]);

@Injectable()
export class GetLatestAuditUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
    @Inject(AUDIT_ORDER_REPOSITORY)
    private readonly auditOrderRepository: AuditOrderRepository,
  ) {}

  async execute(
    projectId: string,
    userId: string,
  ): Promise<Result<LatestAuditResponseDto, GetLatestAuditError>> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      return Result.err(new NotFoundError('Project', projectId));
    }
    if (!project.belongsTo(userId)) {
      return Result.err(new ForbiddenError('Accès refusé à ce projet'));
    }

    const audit =
      await this.auditOrderRepository.findLatestByProjectId(projectId);
    if (!audit) {
      return Result.ok({ hasAudit: false });
    }

    const createdAt = audit.createdAt.toISOString();

    if (IN_PROGRESS_STATUSES.has(audit.status)) {
      return Result.ok({
        hasAudit: true,
        status: audit.status as
          | AuditStatus.PENDING
          | AuditStatus.PAID
          | AuditStatus.PROCESSING,
        createdAt,
        paidAt: audit.paidAt?.toISOString() ?? null,
        startedAt: audit.startedAt?.toISOString() ?? null,
      });
    }

    if (COMPLETED_STATUSES.has(audit.status)) {
      return Result.ok({
        hasAudit: true,
        status: audit.status as AuditStatus.COMPLETED | AuditStatus.PARTIAL,
        createdAt,
        result: audit.resultPayload!,
        reportUrl: audit.reportUrl,
        completedAt: audit.completedAt!.toISOString(),
      });
    }

    return Result.ok({
      hasAudit: true,
      status: audit.status as
        | AuditStatus.FAILED
        | AuditStatus.TIMEOUT
        | AuditStatus.SCHEMA_ERROR,
      createdAt,
      failureReason: audit.failureReason,
    });
  }
}
