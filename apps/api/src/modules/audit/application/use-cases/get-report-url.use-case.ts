import { Inject, Injectable } from '@nestjs/common';

import { Result } from '../../../../common/utils/result';
import type { DomainError } from '../../../../common/errors/domain-error';
import { ForbiddenError } from '../../../../common/errors/domain-error';
import { LoggerService } from '../../../../common/logger';
import {
  AUDIT_ORDER_REPOSITORY,
  type AuditOrderRepository,
  AuditNotFoundError,
  AuditReportNotAvailableError,
} from '../../domain';
import {
  FILE_STORAGE_PORT,
  type FileStoragePort,
} from '../../../storage';

const SIGNED_URL_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days

interface GetReportUrlInput {
  auditOrderId: string;
  userId: string;
}

interface GetReportUrlOutput {
  url: string;
  expiresInSeconds: number;
}

@Injectable()
export class GetReportUrlUseCase {
  constructor(
    @Inject(AUDIT_ORDER_REPOSITORY)
    private readonly auditOrderRepository: AuditOrderRepository,
    @Inject(FILE_STORAGE_PORT)
    private readonly fileStorage: FileStoragePort,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(GetReportUrlUseCase.name);
  }

  async execute(
    input: GetReportUrlInput,
  ): Promise<Result<GetReportUrlOutput, DomainError>> {
    const { auditOrderId, userId } = input;

    const auditOrder =
      await this.auditOrderRepository.findById(auditOrderId);
    if (!auditOrder) {
      return Result.err(new AuditNotFoundError(auditOrderId));
    }

    if (auditOrder.userId !== userId) {
      return Result.err(new ForbiddenError('Accès refusé'));
    }

    const reportKey = auditOrder.reportUrl;
    if (!reportKey) {
      return Result.err(
        new AuditReportNotAvailableError(auditOrderId, auditOrder.status),
      );
    }

    const signedResult = await this.fileStorage.getSignedUrl(
      reportKey,
      SIGNED_URL_EXPIRY_SECONDS,
    );
    if (!signedResult.ok) {
      return Result.err(signedResult.error);
    }

    return Result.ok({
      url: signedResult.value.url,
      expiresInSeconds: SIGNED_URL_EXPIRY_SECONDS,
    });
  }
}
