import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { Plan } from '@prisma/client';

import { EmailQueueService } from '../../../../infrastructure/queue';
import { PrismaService } from '../../../../prisma';
import { UnsubscribeTokenService } from './unsubscribe-token.service';

const BATCH_SIZE = 100;
const MIN_UPGRADE_EMAIL_INTERVAL_DAYS = 3;

@Injectable()
export class UpgradeCampaignService {
  private readonly logger = new Logger(UpgradeCampaignService.name);
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
   * Daily at 10:30 Paris time
   * Sends upgrade campaign emails to activated FREE users
   */
  @Cron('30 10 * * *', {
    name: 'upgrade-campaign',
    timeZone: 'Europe/Paris',
  })
  async handleUpgradeCampaign(): Promise<void> {
    this.logger.log('Starting upgrade campaign cron job');
    const startTime = Date.now();
    let emailsSent = 0;

    try {
      // U1: Day 14 — multi-model education
      emailsSent += await this.processDay14Users();

      // U2: Day 17 — auto-scan feature
      emailsSent += await this.processDay17Users();

      // U3: Day 21 — final push
      emailsSent += await this.processDay21Users();
    } catch (error) {
      this.logger.error({
        message: 'Upgrade campaign: critical error',
        error: error instanceof Error ? error.message : String(error),
      });
    }

    this.logger.log({
      message: 'Upgrade campaign: completed',
      emailsSent,
      durationMs: Date.now() - startTime,
    });
  }

  private async processDay14Users(): Promise<number> {
    return this.sendUpgradeEmail(14, 15, 'upgrade-multimodel');
  }

  private async processDay17Users(): Promise<number> {
    return this.sendUpgradeEmail(17, 18, 'upgrade-autoscan');
  }

  private async processDay21Users(): Promise<number> {
    return this.sendUpgradeEmail(21, 22, 'upgrade-final');
  }

  private async sendUpgradeEmail(
    minDays: number,
    maxDays: number,
    type: 'upgrade-multimodel' | 'upgrade-autoscan' | 'upgrade-final',
  ): Promise<number> {
    const now = new Date();
    const minDate = new Date(now.getTime() - maxDays * 24 * 60 * 60 * 1000);
    const maxDate = new Date(now.getTime() - minDays * 24 * 60 * 60 * 1000);
    const emailIntervalThreshold = new Date(
      now.getTime() - MIN_UPGRADE_EMAIL_INTERVAL_DAYS * 24 * 60 * 60 * 1000,
    );

    const users = await this.prisma.user.findMany({
      where: {
        plan: Plan.FREE,
        emailNotificationsEnabled: true,
        deletedAt: null,
        lastScanAt: { not: null }, // Must have completed at least 1 scan
        createdAt: { gte: minDate, lt: maxDate },
        subscription: null, // No active subscription
        OR: [{ lastUpgradeEmailAt: null }, { lastUpgradeEmailAt: { lt: emailIntervalThreshold } }],
      },
      select: { id: true, email: true, name: true },
      take: BATCH_SIZE,
    });

    let sent = 0;
    for (const user of users) {
      try {
        const firstName = user.name.split(' ')[0];
        const unsubscribeToken = this.unsubscribeTokenService.generateToken(user.id);
        const pricingUrl = `${this.frontendUrl}/billing`;

        await this.emailQueueService.addJob({
          type,
          to: user.email,
          data: {
            firstName,
            pricingUrl,
            unsubscribeUrl: `${this.apiUrl}/email/unsubscribe?token=${unsubscribeToken}`,
          },
        });

        await this.prisma.user.update({
          where: { id: user.id },
          data: { lastUpgradeEmailAt: now },
        });

        sent++;
      } catch (error) {
        this.logger.error({
          message: `Upgrade campaign: failed to send ${type}`,
          userId: user.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    this.logger.log({ message: `Upgrade campaign ${type}`, sent });
    return sent;
  }
}
