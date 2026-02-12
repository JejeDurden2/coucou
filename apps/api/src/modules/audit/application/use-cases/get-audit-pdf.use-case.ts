import { Inject, Injectable } from '@nestjs/common';
import { AuditStatus } from '@coucou-ia/shared';

import { Result } from '../../../../common/utils/result';
import type { DomainError } from '../../../../common/errors/domain-error';
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
  AUDIT_PDF_PORT,
  type AuditPdfPort,
  AuditNotFoundError,
  AuditReportNotAvailableError,
} from '../../domain';

interface GetAuditPdfOutput {
  redirectUrl: string;
}

type GetAuditPdfError =
  | NotFoundError
  | ForbiddenError
  | AuditNotFoundError
  | AuditReportNotAvailableError
  | DomainError;

const REPORT_STATUSES: ReadonlySet<AuditStatus> = new Set([
  AuditStatus.COMPLETED,
  AuditStatus.PARTIAL,
]);

@Injectable()
export class GetAuditPdfUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
    @Inject(AUDIT_ORDER_REPOSITORY)
    private readonly auditOrderRepository: AuditOrderRepository,
    @Inject(AUDIT_PDF_PORT)
    private readonly auditPdfPort: AuditPdfPort,
  ) {}

  async execute(
    projectId: string,
    auditId: string,
    userId: string,
  ): Promise<Result<GetAuditPdfOutput, GetAuditPdfError>> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      return Result.err(new NotFoundError('Project', projectId));
    }
    if (!project.belongsTo(userId)) {
      return Result.err(new ForbiddenError('Accès refusé à ce projet'));
    }

    const audit = await this.auditOrderRepository.findById(auditId);
    if (!audit || audit.projectId !== projectId) {
      return Result.err(new AuditNotFoundError(auditId));
    }

    if (!REPORT_STATUSES.has(audit.status)) {
      return Result.err(
        new AuditReportNotAvailableError(auditId, audit.status),
      );
    }

    const generateResult = await this.auditPdfPort.generateReport(audit);
    if (!generateResult.ok) {
      return Result.err(generateResult.error);
    }

    const attachResult = audit.attachReport(generateResult.value.url);
    if (attachResult.ok) {
      await this.auditOrderRepository.save(attachResult.value);
    }

    return Result.ok({ redirectUrl: generateResult.value.url });
  }
}
