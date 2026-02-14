import {
  Controller,
  Get,
  Inject,
  Param,
  Query,
  Res,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';

import { LoggerService } from '../../../common/logger';
import {
  FILE_STORAGE_PORT,
  type FileStoragePort,
} from '../../storage/domain/ports/file-storage.port';
import {
  AUDIT_ORDER_REPOSITORY,
  type AuditOrderRepository,
} from '../domain/repositories/audit-order.repository';
import { AuditPdfTokenService } from '../infrastructure/services/audit-pdf-token.service';

const SIGNED_URL_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days

@Controller('audit')
export class AuditPdfDownloadController {
  constructor(
    private readonly auditPdfTokenService: AuditPdfTokenService,
    @Inject(AUDIT_ORDER_REPOSITORY)
    private readonly auditOrderRepository: AuditOrderRepository,
    @Inject(FILE_STORAGE_PORT)
    private readonly fileStorage: FileStoragePort,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(AuditPdfDownloadController.name);
  }

  @Get(':auditId/pdf/email-download')
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  async downloadPdf(
    @Param('auditId') auditId: string,
    @Query('token') token: string,
    @Res() res: Response,
  ): Promise<void> {
    if (!token) {
      throw new ForbiddenException('Token requis');
    }

    const tokenData = this.auditPdfTokenService.verifyToken(token);
    if (!tokenData || tokenData.auditOrderId !== auditId) {
      this.logger.warn('Invalid PDF download token', { auditId });
      throw new ForbiddenException('Token invalide ou expiré');
    }

    const auditOrder = await this.auditOrderRepository.findById(auditId);
    if (!auditOrder) {
      throw new NotFoundException('Audit introuvable');
    }

    if (auditOrder.userId !== tokenData.userId) {
      throw new ForbiddenException('Token invalide');
    }

    if (!auditOrder.reportUrl) {
      throw new NotFoundException('Le PDF est en cours de génération. Veuillez réessayer dans quelques instants.');
    }

    const signedUrlResult = await this.fileStorage.getSignedUrl(
      auditOrder.reportUrl,
      SIGNED_URL_EXPIRY_SECONDS,
    );

    if (!signedUrlResult.ok) {
      this.logger.error('Failed to generate signed URL for PDF', {
        auditId,
        error: signedUrlResult.error.message,
      });
      throw new NotFoundException('Impossible de générer le lien de téléchargement');
    }

    res.redirect(302, signedUrlResult.value.url);
  }
}
