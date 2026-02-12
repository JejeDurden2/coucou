import { Inject, Injectable } from '@nestjs/common';

import { Result } from '../../../../common/utils/result';
import type { DomainError } from '../../../../common/errors/domain-error';
import { LoggerService } from '../../../../common/logger';
import {
  AUDIT_ORDER_REPOSITORY,
  type AuditOrderRepository,
  AUDIT_PDF_PORT,
  type AuditPdfPort,
  AuditNotFoundError,
} from '../../domain';

interface GenerateAuditPdfInput {
  auditOrderId: string;
}

interface GenerateAuditPdfOutput {
  reportKey: string;
}

@Injectable()
export class GenerateAuditPdfUseCase {
  constructor(
    @Inject(AUDIT_ORDER_REPOSITORY)
    private readonly auditOrderRepository: AuditOrderRepository,
    @Inject(AUDIT_PDF_PORT)
    private readonly auditPdfPort: AuditPdfPort,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(GenerateAuditPdfUseCase.name);
  }

  async execute(
    input: GenerateAuditPdfInput,
  ): Promise<Result<GenerateAuditPdfOutput, DomainError>> {
    const { auditOrderId } = input;

    const auditOrder =
      await this.auditOrderRepository.findById(auditOrderId);
    if (!auditOrder) {
      return Result.err(new AuditNotFoundError(auditOrderId));
    }

    const pdfResult = await this.auditPdfPort.generateReport(auditOrder);
    if (!pdfResult.ok) {
      return Result.err(pdfResult.error);
    }

    const attachResult = auditOrder.attachReport(pdfResult.value.url);
    if (!attachResult.ok) {
      return Result.err(attachResult.error);
    }

    await this.auditOrderRepository.save(attachResult.value);

    this.logger.info('Audit PDF generated and attached', {
      auditOrderId,
      reportKey: pdfResult.value.url,
    });

    return Result.ok({ reportKey: pdfResult.value.url });
  }
}
