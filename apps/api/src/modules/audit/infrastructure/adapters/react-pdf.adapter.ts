import { Inject, Injectable } from '@nestjs/common';
import { renderToBuffer } from '@react-pdf/renderer';

import { Result } from '../../../../common/utils/result';
import type { DomainError } from '../../../../common/errors/domain-error';
import { LoggerService } from '../../../../common/logger';
import type { AuditPdfPort } from '../../domain/ports/audit-pdf.port';
import type { AuditOrder } from '../../domain/entities/audit-order.entity';
import {
  FILE_STORAGE_PORT,
  type FileStoragePort,
} from '../../../storage';
import { AuditPdfGenerationError } from '../../domain/errors/audit.errors';
import { AuditReportDocument } from '../pdf/audit-report.document';

const MAX_PDF_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

@Injectable()
export class ReactPdfAdapter implements AuditPdfPort {
  constructor(
    @Inject(FILE_STORAGE_PORT)
    private readonly fileStorage: FileStoragePort,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(ReactPdfAdapter.name);
  }

  async generateReport(
    auditOrder: AuditOrder,
  ): Promise<Result<{ url: string }, DomainError>> {
    const auditResult = auditOrder.resultPayload;
    if (!auditResult) {
      return Result.err(
        new AuditPdfGenerationError(
          'Aucun résultat disponible',
          auditOrder.id,
        ),
      );
    }

    try {
      const start = Date.now();

      const pdfBuffer = await renderToBuffer(
        AuditReportDocument({
          auditResult,
          brandName: auditOrder.briefPayload.brand.name,
          domain: auditOrder.briefPayload.brand.domain,
          completedAt: auditOrder.completedAt ?? new Date(),
        }),
      );

      const renderMs = Date.now() - start;
      this.logger.info('PDF rendered', {
        auditOrderId: auditOrder.id,
        sizeBytes: pdfBuffer.length,
        renderMs,
      });

      if (pdfBuffer.length > MAX_PDF_SIZE_BYTES) {
        return Result.err(
          new AuditPdfGenerationError(
            `PDF trop volumineux : ${(pdfBuffer.length / 1024 / 1024).toFixed(1)} MB (max 5 MB)`,
            auditOrder.id,
          ),
        );
      }

      const s3Key = `audit-reports/${auditOrder.id}.pdf`;
      const uploadResult = await this.fileStorage.upload(
        s3Key,
        Buffer.from(pdfBuffer),
        'application/pdf',
      );

      if (!uploadResult.ok) {
        return Result.err(uploadResult.error);
      }

      return Result.ok({ url: s3Key });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('PDF generation failed', {
        auditOrderId: auditOrder.id,
        error: message,
      });
      return Result.err(
        new AuditPdfGenerationError(message, auditOrder.id),
      );
    }
  }
}
