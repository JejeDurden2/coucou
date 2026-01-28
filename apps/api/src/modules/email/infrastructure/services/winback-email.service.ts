import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { Plan } from '@prisma/client';

import { EmailQueueService } from '../../../../infrastructure/queue';
import { PrismaService } from '../../../../prisma';
import { UnsubscribeTokenService } from './unsubscribe-token.service';

const BATCH_SIZE = 100;

@Injectable()
export class WinbackEmailService {
  private readonly logger = new Logger(WinbackEmailService.name);
  private readonly frontendUrl: string;
  private readonly apiUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailQueueService: EmailQueueService,
    private readonly configService: ConfigService,
    private readonly unsubscribeTokenService: UnsubscribeTokenService,
  ) {
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL', 'https://coucou-ia.com');
    this.apiUrl = this.configService.get<string>('API_URL', 'https://api.coucou-ia.com');
  }

  /**
   * Daily at 11:00 Paris time
   * Sends win-back emails to churned customers
   */
  @Cron('0 11 * * *', {
    name: 'winback-emails',
    timeZone: 'Europe/Paris',
  })
  async handleWinbackEmails(): Promise<void> {
    this.logger.log('Starting win-back email cron job');
    const startTime = Date.now();
    let emailsSent = 0;

    try {
      // W1: +7 days after subscription ended
      emailsSent += await this.sendWinbackEmail(7, 8, 'winback-checkin');

      // W2: +14 days after subscription ended
      emailsSent += await this.sendWinbackEmail(14, 15, 'winback-value');

      // W3: +21 days after subscription ended
      emailsSent += await this.sendWinbackEmail(21, 22, 'winback-discount');
    } catch (error) {
      this.logger.error({
        message: 'Win-back emails: critical error',
        error: error instanceof Error ? error.message : String(error),
      });
    }

    this.logger.log({
      message: 'Win-back emails: completed',
      emailsSent,
      durationMs: Date.now() - startTime,
    });
  }

  private async sendWinbackEmail(
    minDays: number,
    maxDays: number,
    type: 'winback-checkin' | 'winback-value' | 'winback-discount',
  ): Promise<number> {
    const now = new Date();
    const minDate = new Date(now.getTime() - maxDays * 24 * 60 * 60 * 1000);
    const maxDate = new Date(now.getTime() - minDays * 24 * 60 * 60 * 1000);

    const users = await this.prisma.user.findMany({
      where: {
        plan: Plan.FREE,
        emailNotificationsEnabled: true,
        deletedAt: null,
        previousPlan: { in: [Plan.SOLO, Plan.PRO] },
        subscriptionEndedAt: { gte: minDate, lt: maxDate },
        subscription: null, // Confirm no active subscription
      },
      select: {
        id: true,
        email: true,
        name: true,
        previousPlan: true,
      },
      take: BATCH_SIZE,
    });

    let sent = 0;
    for (const user of users) {
      try {
        const firstName = user.name.split(' ')[0];
        const unsubscribeToken = this.unsubscribeTokenService.generateToken(user.id);

        if (type === 'winback-checkin') {
          await this.emailQueueService.addJob({
            type: 'winback-checkin',
            to: user.email,
            data: {
              firstName,
              dashboardUrl: `${this.frontendUrl}/projects`,
              unsubscribeUrl: `${this.apiUrl}/email/unsubscribe?token=${unsubscribeToken}`,
            },
          });
        } else if (type === 'winback-value') {
          await this.emailQueueService.addJob({
            type: 'winback-value',
            to: user.email,
            data: {
              firstName,
              pricingUrl: `${this.frontendUrl}/billing`,
              unsubscribeUrl: `${this.apiUrl}/email/unsubscribe?token=${unsubscribeToken}`,
            },
          });
        } else {
          await this.emailQueueService.addJob({
            type: 'winback-discount',
            to: user.email,
            data: {
              firstName,
              previousPlan: user.previousPlan as 'SOLO' | 'PRO',
              checkoutUrl: `${this.frontendUrl}/billing?coupon=WINBACK20`,
              unsubscribeUrl: `${this.apiUrl}/email/unsubscribe?token=${unsubscribeToken}`,
            },
          });
        }

        sent++;
      } catch (error) {
        this.logger.error({
          message: `Win-back: failed to send ${type}`,
          userId: user.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    this.logger.log({ message: `Win-back ${type}`, sent });
    return sent;
  }
}
