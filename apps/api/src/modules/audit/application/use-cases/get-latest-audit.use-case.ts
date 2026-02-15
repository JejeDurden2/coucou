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

    // PENDING = awaiting payment, treat as no audit for the frontend
    if (audit.status === AuditStatus.PENDING) {
      return Result.ok({ hasAudit: false });
    }

    // PAID = payment received, waiting for crawl
    if (audit.status === AuditStatus.PAID) {
      return Result.ok({
        hasAudit: true,
        auditId: audit.id,
        status: AuditStatus.PAID,
        createdAt: audit.createdAt.toISOString(),
        paidAt: audit.paidAt?.toISOString() ?? null,
      });
    }

    // CRAWLING = Twin agent crawling the site
    if (audit.status === AuditStatus.CRAWLING) {
      return Result.ok({
        hasAudit: true,
        auditId: audit.id,
        status: AuditStatus.CRAWLING,
        createdAt: audit.createdAt.toISOString(),
        paidAt: audit.paidAt?.toISOString() ?? null,
      });
    }

    // ANALYZING = crawl done, Mistral analyzing observations
    if (audit.status === AuditStatus.ANALYZING) {
      return Result.ok({
        hasAudit: true,
        auditId: audit.id,
        status: AuditStatus.ANALYZING,
        pagesAnalyzedClient: audit.pagesAnalyzedClient,
        competitorsAnalyzed: audit.competitorsAnalyzed,
      });
    }

    // COMPLETED = analysis done, return metadata
    if (audit.status === AuditStatus.COMPLETED) {
      return Result.ok({
        hasAudit: true,
        auditId: audit.id,
        status: AuditStatus.COMPLETED,
        geoScore: audit.geoScore,
        verdict: audit.verdict,
        topFindings: audit.topFindings,
        externalPresenceScore: audit.externalPresenceScore,
        actionCount: {
          critical: audit.actionCountCritical,
          high: audit.actionCountHigh,
          medium: audit.actionCountMedium,
        },
        totalActions: audit.totalActions,
        competitorsAnalyzed: audit.competitorsAnalyzed,
        pagesAnalyzedClient: audit.pagesAnalyzedClient,
        pagesAnalyzedCompetitors: audit.pagesAnalyzedCompetitors,
        completedAt: audit.completedAt!.toISOString(),
      });
    }

    // FAILED
    if (audit.status === AuditStatus.FAILED) {
      return Result.ok({
        hasAudit: true,
        auditId: audit.id,
        status: AuditStatus.FAILED,
        failureReason: audit.failureReason,
      });
    }

    // Fallback: unknown status → treat as no audit
    return Result.ok({ hasAudit: false });
  }
}
