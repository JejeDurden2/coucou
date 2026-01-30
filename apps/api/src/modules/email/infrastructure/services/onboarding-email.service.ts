import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { Plan } from '@prisma/client';

import { LoggerService } from '../../../../common/logger';
import { EmailQueueService } from '../../../../infrastructure/queue';
import { PrismaService } from '../../../../prisma';
import { UnsubscribeTokenService } from './unsubscribe-token.service';

const BATCH_SIZE = 100;

@Injectable()
export class OnboardingEmailService {
  private readonly frontendUrl: string;
  private readonly apiUrl: string;

  constructor(
    private readonly logger: LoggerService,
    private readonly prisma: PrismaService,
    private readonly emailQueueService: EmailQueueService,
    private readonly configService: ConfigService,
    private readonly unsubscribeTokenService: UnsubscribeTokenService,
  ) {
    this.logger.setContext(OnboardingEmailService.name);
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL', 'https://coucou-ia.com');
    this.apiUrl = this.configService.get<string>('API_URL', 'https://api.coucou-ia.com');
  }

  /**
   * Daily at 09:00 Paris time
   * Sends onboarding drip emails (E2-E5) to new users
   */
  @Cron('0 9 * * *', {
    name: 'onboarding-drip',
    timeZone: 'Europe/Paris',
  })
  async handleOnboardingDrip(): Promise<void> {
    this.logger.info('Starting onboarding drip cron job');
    const startTime = Date.now();
    let emailsSent = 0;

    try {
      // E2: Day 1 — users who registered 1 day ago, have no project
      emailsSent += await this.processDay1Users();

      // E3: Day 3 — users who have a project but no scan
      emailsSent += await this.processDay3Users();

      // E4: Day 5 — users still haven't scanned
      emailsSent += await this.processDay5Users();

      // E5: Day 7 — last chance
      emailsSent += await this.processDay7Users();
    } catch (error) {
      this.logger.error(
        'Onboarding drip: critical error',
        error instanceof Error ? error : undefined,
      );
    }

    this.logger.info('Onboarding drip: completed', {
      emailsSent,
      durationMs: Date.now() - startTime,
    });
  }

  private async processDay1Users(): Promise<number> {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    // Users registered between 1-2 days ago with no projects
    const users = await this.prisma.user.findMany({
      where: {
        plan: Plan.FREE,
        emailNotificationsEnabled: true,
        deletedAt: null,
        lastScanAt: null,
        createdAt: { gte: twoDaysAgo, lt: dayAgo },
        projects: { none: {} },
      },
      select: { id: true, email: true, name: true },
      take: BATCH_SIZE,
    });

    let sent = 0;
    for (const user of users) {
      try {
        const firstName = user.name.split(' ')[0];
        const unsubscribeToken = this.unsubscribeTokenService.generateToken(user.id);

        await this.emailQueueService.addJob({
          type: 'onboarding-create-brand',
          to: user.email,
          data: {
            firstName,
            dashboardUrl: `${this.frontendUrl}/projects`,
            unsubscribeUrl: `${this.apiUrl}/email/unsubscribe?token=${unsubscribeToken}`,
          },
        });
        sent++;
      } catch (error) {
        this.logger.error(
          'Onboarding drip: failed to send E2',
          error instanceof Error ? error : undefined,
          { userId: user.id },
        );
      }
    }

    this.logger.info('Onboarding E2 (create-brand)', { sent });
    return sent;
  }

  private async processDay3Users(): Promise<number> {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);

    // Users registered 3-4 days ago with a project but no scan
    const users = await this.prisma.user.findMany({
      where: {
        plan: Plan.FREE,
        emailNotificationsEnabled: true,
        deletedAt: null,
        lastScanAt: null,
        createdAt: { gte: fourDaysAgo, lt: threeDaysAgo },
        projects: { some: {} },
      },
      select: {
        id: true,
        email: true,
        name: true,
        projects: {
          take: 1,
          orderBy: { createdAt: 'asc' },
          select: { id: true, brandName: true },
        },
      },
      take: BATCH_SIZE,
    });

    let sent = 0;
    for (const user of users) {
      const project = user.projects[0];
      if (!project) continue;

      try {
        const firstName = user.name.split(' ')[0];
        const unsubscribeToken = this.unsubscribeTokenService.generateToken(user.id);

        await this.emailQueueService.addJob({
          type: 'onboarding-first-scan',
          to: user.email,
          data: {
            firstName,
            brandName: project.brandName,
            projectUrl: `${this.frontendUrl}/projects/${project.id}`,
            unsubscribeUrl: `${this.apiUrl}/email/unsubscribe?token=${unsubscribeToken}`,
          },
        });
        sent++;
      } catch (error) {
        this.logger.error(
          'Onboarding drip: failed to send E3',
          error instanceof Error ? error : undefined,
          { userId: user.id },
        );
      }
    }

    this.logger.info('Onboarding E3 (first-scan)', { sent });
    return sent;
  }

  private async processDay5Users(): Promise<number> {
    const now = new Date();
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    const sixDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);

    const users = await this.prisma.user.findMany({
      where: {
        plan: Plan.FREE,
        emailNotificationsEnabled: true,
        deletedAt: null,
        lastScanAt: null,
        createdAt: { gte: sixDaysAgo, lt: fiveDaysAgo },
      },
      select: {
        id: true,
        email: true,
        name: true,
        projects: {
          take: 1,
          orderBy: { createdAt: 'asc' },
          select: { id: true, brandName: true },
        },
      },
      take: BATCH_SIZE,
    });

    let sent = 0;
    for (const user of users) {
      const project = user.projects[0];
      const projectUrl = project
        ? `${this.frontendUrl}/projects/${project.id}`
        : `${this.frontendUrl}/projects`;

      try {
        const firstName = user.name.split(' ')[0];
        const unsubscribeToken = this.unsubscribeTokenService.generateToken(user.id);

        await this.emailQueueService.addJob({
          type: 'onboarding-competitor-fomo',
          to: user.email,
          data: {
            firstName,
            projectUrl,
            unsubscribeUrl: `${this.apiUrl}/email/unsubscribe?token=${unsubscribeToken}`,
          },
        });
        sent++;
      } catch (error) {
        this.logger.error(
          'Onboarding drip: failed to send E4',
          error instanceof Error ? error : undefined,
          { userId: user.id },
        );
      }
    }

    this.logger.info('Onboarding E4 (competitor-fomo)', { sent });
    return sent;
  }

  private async processDay7Users(): Promise<number> {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const eightDaysAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);

    const users = await this.prisma.user.findMany({
      where: {
        plan: Plan.FREE,
        emailNotificationsEnabled: true,
        deletedAt: null,
        lastScanAt: null,
        createdAt: { gte: eightDaysAgo, lt: sevenDaysAgo },
      },
      select: {
        id: true,
        email: true,
        name: true,
        projects: {
          take: 1,
          orderBy: { createdAt: 'asc' },
          select: { id: true, brandName: true },
        },
      },
      take: BATCH_SIZE,
    });

    let sent = 0;
    for (const user of users) {
      const project = user.projects[0];
      const projectUrl = project
        ? `${this.frontendUrl}/projects/${project.id}`
        : `${this.frontendUrl}/projects`;

      try {
        const firstName = user.name.split(' ')[0];
        const unsubscribeToken = this.unsubscribeTokenService.generateToken(user.id);

        await this.emailQueueService.addJob({
          type: 'onboarding-last-chance',
          to: user.email,
          data: {
            firstName,
            projectUrl,
            unsubscribeUrl: `${this.apiUrl}/email/unsubscribe?token=${unsubscribeToken}`,
          },
        });
        sent++;
      } catch (error) {
        this.logger.error(
          'Onboarding drip: failed to send E5',
          error instanceof Error ? error : undefined,
          { userId: user.id },
        );
      }
    }

    this.logger.info('Onboarding E5 (last-chance)', { sent });
    return sent;
  }
}
