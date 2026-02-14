import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AuditResult } from '@coucou-ia/shared';

import { LoggerService } from '../../../../common/logger';
import { EmailQueueService } from '../../../../infrastructure/queue/email-queue.service';
import { UnsubscribeTokenService } from '../../../email';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../../auth';
import type { AuditOrder } from '../../domain';
import { AuditPdfTokenService } from '../../infrastructure/services/audit-pdf-token.service';

@Injectable()
export class AuditEmailNotificationService {
  private readonly frontendUrl: string;
  private readonly adminNotificationEmail: string;
  private readonly supportEmail: string;

  constructor(
    private readonly emailQueueService: EmailQueueService,
    private readonly unsubscribeTokenService: UnsubscribeTokenService,
    private readonly configService: ConfigService,
    private readonly auditPdfTokenService: AuditPdfTokenService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(AuditEmailNotificationService.name);
    this.frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    this.adminNotificationEmail = this.configService.getOrThrow<string>('ADMIN_NOTIFICATION_EMAIL');
    this.supportEmail = this.configService.get<string>(
      'this.supportEmail',
      'support@coucou-ia.com',
    );
  }

  async notifyAuditSuccess(auditOrder: AuditOrder): Promise<void> {
    try {
      const user = await this.loadUser(auditOrder.userId);
      if (!user) return;

      if (!user.emailNotificationsEnabled) {
        this.logger.info('Skipping audit success email — notifications disabled', {
          userId: auditOrder.userId,
          auditOrderId: auditOrder.id,
        });
        return;
      }

      const score = auditOrder.geoScore;
      if (score === null) {
        this.logger.warn('Skipping audit success email — no geoScore', {
          auditOrderId: auditOrder.id,
        });
        return;
      }

      const keyPoints = auditOrder.topFindings.length > 0
        ? auditOrder.topFindings.slice(0, 3)
        : this.extractKeyPointsFromPayload(auditOrder.resultPayload);

      const actionCount = auditOrder.totalActions
        ?? this.countActionsFromPayload(auditOrder.resultPayload);

      const unsubscribeToken = this.unsubscribeTokenService.generateToken(auditOrder.userId);
      const apiUrl = this.configService.getOrThrow<string>('API_URL');
      const pdfToken = this.auditPdfTokenService.generateToken(auditOrder.id, auditOrder.userId);

      await this.emailQueueService.addJob({
        type: 'audit-success',
        to: user.email,
        data: {
          firstName: this.extractFirstName(user.name),
          brandName: auditOrder.briefPayload.brand.name,
          score,
          verdict: auditOrder.verdict,
          externalPresenceScore: auditOrder.externalPresenceScore,
          keyPoints,
          actionCount,
          reportUrl: `${this.frontendUrl}/projects/${auditOrder.projectId}/audit`,
          pdfUrl: `${apiUrl}/audit/${auditOrder.id}/pdf/email-download?token=${pdfToken}`,
          unsubscribeUrl: `${apiUrl}/email/unsubscribe?token=${unsubscribeToken}`,
        },
      });

      this.logger.info('Audit success email queued', {
        auditOrderId: auditOrder.id,
        userId: auditOrder.userId,
        score,
      });
    } catch (error) {
      this.logger.error('Failed to queue audit success email', error instanceof Error ? error : undefined, {
        auditOrderId: auditOrder.id,
      });
    }
  }

  async notifyAuditFailed(auditOrder: AuditOrder): Promise<void> {
    await this.sendFailureNotifications(auditOrder, 'FAILED');
  }

  async notifyAuditTimeout(auditOrder: AuditOrder): Promise<void> {
    await this.sendFailureNotifications(auditOrder, 'TIMEOUT');
  }

  async notifyAuditSchemaError(auditOrder: AuditOrder): Promise<void> {
    await this.sendFailureNotifications(auditOrder, 'SCHEMA_ERROR');
  }

  private async sendFailureNotifications(
    auditOrder: AuditOrder,
    status: 'FAILED' | 'TIMEOUT' | 'SCHEMA_ERROR',
  ): Promise<void> {
    try {
      const user = await this.loadUser(auditOrder.userId);
      if (!user) return;

      // User notification (respects preferences)
      if (user.emailNotificationsEnabled) {
        const unsubscribeToken = this.unsubscribeTokenService.generateToken(auditOrder.userId);
        const apiUrl = this.configService.getOrThrow<string>('API_URL');

        await this.emailQueueService.addJob({
          type: 'audit-failed',
          to: user.email,
          data: {
            firstName: this.extractFirstName(user.name),
            brandName: auditOrder.briefPayload.brand.name,
            supportEmail: this.supportEmail,
            unsubscribeUrl: `${apiUrl}/email/unsubscribe?token=${unsubscribeToken}`,
            refunded: false,
            refundAmountCents: auditOrder.amountCents,
          },
        });

        this.logger.info('Audit failure email queued for user', {
          auditOrderId: auditOrder.id,
          userId: auditOrder.userId,
          status,
        });
      }

      // Admin alert (always sent)
      const executionDuration = this.computeDuration(auditOrder.startedAt, auditOrder.failedAt);

      await this.emailQueueService.addJob({
        type: 'audit-admin-alert',
        to: this.adminNotificationEmail,
        data: {
          auditOrderId: auditOrder.id,
          brandName: auditOrder.briefPayload.brand.name,
          projectId: auditOrder.projectId,
          userId: auditOrder.userId,
          userEmail: user.email,
          status,
          failureReason: auditOrder.failureReason,
          twinAgentId: auditOrder.twinAgentId,
          startedAt: auditOrder.startedAt?.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }) ?? null,
          failedAt: auditOrder.failedAt?.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }) ?? new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }),
          executionDuration,
          refundStatus: 'not_applicable',
          refundId: null,
          amountCents: auditOrder.amountCents,
        },
      });

      this.logger.info('Audit admin alert email queued', {
        auditOrderId: auditOrder.id,
        status,
      });
    } catch (error) {
      this.logger.error('Failed to queue audit failure emails', error instanceof Error ? error : undefined, {
        auditOrderId: auditOrder.id,
        status,
      });
    }
  }

  private async loadUser(userId: string): Promise<{
    email: string;
    name: string;
    emailNotificationsEnabled: boolean;
  } | null> {
    const prefs = await this.userRepository.findByIdWithEmailPrefs(userId);

    if (!prefs) {
      this.logger.warn('User not found for audit notification', { userId });
      return null;
    }

    return prefs;
  }

  private extractFirstName(name: string): string {
    return name.split(' ')[0];
  }

  private extractKeyPointsFromPayload(resultPayload: AuditResult | null): string[] {
    if (!resultPayload) return [];

    return [
      ...resultPayload.geoScore.mainStrengths.slice(0, 2),
      ...resultPayload.geoScore.mainWeaknesses.slice(0, 1),
    ].slice(0, 3);
  }

  private countActionsFromPayload(resultPayload: AuditResult | null): number {
    if (!resultPayload) return 0;

    return (
      resultPayload.actionPlan.quickWins.length +
      resultPayload.actionPlan.shortTerm.length +
      resultPayload.actionPlan.mediumTerm.length
    );
  }

  private computeDuration(startedAt: Date | null, failedAt: Date | null): string | null {
    if (!startedAt || !failedAt) return null;

    const durationMs = failedAt.getTime() - startedAt.getTime();
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  }
}
