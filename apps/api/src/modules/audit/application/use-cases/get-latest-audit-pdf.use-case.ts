import { Inject, Injectable } from '@nestjs/common';

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
  AuditReportNotAvailableError,
  REPORT_STATUSES,
} from '../../domain';
import {
  FILE_STORAGE_PORT,
  type FileStoragePort,
} from '../../../storage';

const PDF_SIGNED_URL_EXPIRY_SECONDS = 3600; // 1 hour

interface GetLatestAuditPdfOutput {
  url: string;
  expiresInSeconds: number;
}

type GetLatestAuditPdfError =
  | NotFoundError
  | ForbiddenError
  | AuditReportNotAvailableError
  | DomainError;

@Injectable()
export class GetLatestAuditPdfUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
    @Inject(AUDIT_ORDER_REPOSITORY)
    private readonly auditOrderRepository: AuditOrderRepository,
    @Inject(FILE_STORAGE_PORT)
    private readonly fileStorage: FileStoragePort,
  ) {}

  async execute(
    projectId: string,
    userId: string,
  ): Promise<Result<GetLatestAuditPdfOutput, GetLatestAuditPdfError>> {
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
      return Result.err(new NotFoundError('Audit', projectId));
    }

    if (!REPORT_STATUSES.has(audit.status)) {
      return Result.err(
        new AuditReportNotAvailableError(audit.id, audit.status),
      );
    }

    const reportKey = audit.reportUrl;
    if (!reportKey) {
      return Result.err(
        new AuditReportNotAvailableError(audit.id, audit.status),
      );
    }

    const signedResult = await this.fileStorage.getSignedUrl(
      reportKey,
      PDF_SIGNED_URL_EXPIRY_SECONDS,
    );
    if (!signedResult.ok) {
      return Result.err(signedResult.error);
    }

    return Result.ok({
      url: signedResult.value.url,
      expiresInSeconds: PDF_SIGNED_URL_EXPIRY_SECONDS,
    });
  }
}
