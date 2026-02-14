import { Inject, Injectable } from '@nestjs/common';
import type { AuditAnalysis } from '@coucou-ia/shared';

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
import { renderAuditPdf } from '../pdf/audit-report.document';

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
    const analysisDataUrl = auditOrder.analysisDataUrl;
    if (!analysisDataUrl) {
      return Result.err(
        new AuditPdfGenerationError(
          'Aucune analyse disponible (analysisDataUrl manquant)',
          auditOrder.id,
        ),
      );
    }

    try {
      const start = Date.now();

      // 1. Download analysis JSON from R2
      const downloadResult = await this.fileStorage.download(analysisDataUrl);
      if (!downloadResult.ok) {
        return Result.err(
          new AuditPdfGenerationError(
            `Échec du téléchargement de l'analyse: ${downloadResult.error.message}`,
            auditOrder.id,
          ),
        );
      }

      let analysis: AuditAnalysis;
      try {
        analysis = JSON.parse(
          downloadResult.value.toString('utf-8'),
        ) as AuditAnalysis;
      } catch {
        return Result.err(
          new AuditPdfGenerationError(
            "Échec du parsing JSON de l'analyse",
            auditOrder.id,
          ),
        );
      }

      // 2. Render PDF
      const brand = {
        name: auditOrder.briefPayload.brand.name,
        domain: auditOrder.briefPayload.brand.domain,
      };
      const pdfBuffer = await renderAuditPdf(analysis, brand);

      const renderMs = Date.now() - start;
      this.logger.info('PDF rendered', {
        auditOrderId: auditOrder.id,
        sizeBytes: pdfBuffer.length,
        renderMs,
      });

      // 3. Size validation
      if (pdfBuffer.length > MAX_PDF_SIZE_BYTES) {
        return Result.err(
          new AuditPdfGenerationError(
            `PDF trop volumineux : ${(pdfBuffer.length / 1024 / 1024).toFixed(1)} MB (max 5 MB)`,
            auditOrder.id,
          ),
        );
      }

      // 4. Upload to R2
      const s3Key = `audits/${auditOrder.id}/report.pdf`;
      const uploadResult = await this.fileStorage.upload(
        s3Key,
        pdfBuffer,
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
