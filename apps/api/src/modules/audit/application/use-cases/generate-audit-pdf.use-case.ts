import { Inject, Injectable } from '@nestjs/common';
import { AuditStatus } from '@coucou-ia/shared';

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
import { AuditEmailNotificationService } from '../services/audit-email-notification.service';

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
    private readonly auditEmailNotificationService: AuditEmailNotificationService,
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

    // Idempotency: already completed with report
    if (auditOrder.status === AuditStatus.COMPLETED && auditOrder.reportUrl) {
      this.logger.info('PDF already generated, skipping', { auditOrderId });
      return Result.ok({ reportKey: auditOrder.reportUrl });
    }

    // 1. Generate PDF via port (download analysis from R2, render, upload)
    const pdfResult = await this.auditPdfPort.generateReport(auditOrder);
    if (!pdfResult.ok) {
      return Result.err(pdfResult.error);
    }

    // 2. Transition ANALYZING → COMPLETED
    const completedResult = auditOrder.markAnalysisCompleted();
    if (!completedResult.ok) {
      return Result.err(completedResult.error);
    }

    // 3. Attach report URL
    const attachResult = completedResult.value.attachReport(pdfResult.value.url);
    if (!attachResult.ok) {
      return Result.err(attachResult.error);
    }

    // 4. Save to DB
    await this.auditOrderRepository.save(attachResult.value);

    this.logger.info('Audit PDF generated, status COMPLETED, report attached', {
      auditOrderId,
      reportKey: pdfResult.value.url,
    });

    // 5. Send success email
    await this.auditEmailNotificationService.notifyAuditSuccess(attachResult.value);

    return Result.ok({ reportKey: pdfResult.value.url });
  }
}
