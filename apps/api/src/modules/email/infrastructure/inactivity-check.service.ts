import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { Plan } from '@prisma/client';

import { LoggerService } from '../../../common/logger';
import { EmailQueueService } from '../../../infrastructure/queue';
import { PrismaService } from '../../../prisma';
import { UnsubscribeTokenService } from './services/unsubscribe-token.service';

const FIRST_ANALYSIS_THRESHOLD_DAYS = 3;
const INACTIVITY_THRESHOLD_DAYS = 14;
const PAID_INACTIVITY_THRESHOLD_DAYS = 21;
const MIN_EMAIL_INTERVAL_DAYS = 7;
const BATCH_SIZE = 100;

interface InactiveUser {
  id: string;
  email: string;
  name: string;
  project: {
    id: string;
    brandName: string;
  } | null;
}

@Injectable()
export class InactivityCheckService {
  private readonly frontendUrl: string;
  private readonly apiUrl: string;

  constructor(
    private readonly logger: LoggerService,
    private readonly prisma: PrismaService,
    private readonly emailQueueService: EmailQueueService,
    private readonly configService: ConfigService,
    private readonly unsubscribeTokenService: UnsubscribeTokenService,
  ) {
    this.logger.setContext(InactivityCheckService.name);
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL', 'https://coucou-ia.com');
    this.apiUrl = this.configService.get<string>('API_URL', 'https://api.coucou-ia.com');
  }

  /**
   * FREE plan: Daily at 10:00 Paris time
   * Sends reactivation emails to inactive users
   */
  @Cron('0 10 * * *', {
    name: 'inactivity-check-free',
    timeZone: 'Europe/Paris',
  })
  async handleInactivityCheck(): Promise<void> {
    this.logger.info('Starting inactivity check cron job');
    const startTime = Date.now();
    let firstAnalysisEmailsSent = 0;
    let inactivityEmailsSent = 0;
    let skipped = 0;

    try {
      // First-time users (never launched an analysis, signed up 3+ days ago)
      const firstTimeResult = await this.processBatch(
        (skip, take) => this.findFirstTimeUsers(skip, take),
        (user) => this.sendFirstAnalysisEmail(user),
      );
      firstAnalysisEmailsSent = firstTimeResult.sent;
      skipped += firstTimeResult.skipped;

      // Returning inactive users (last analysis > 14 days ago)
      const returningResult = await this.processBatch(
        (skip, take) => this.findReturningInactiveUsers(skip, take),
        (user) => this.sendInactivityEmail(user),
      );
      inactivityEmailsSent = returningResult.sent;
      skipped += returningResult.skipped;
    } catch (error) {
      this.logger.error(
        'Inactivity check: critical error',
        error instanceof Error ? error : undefined,
      );
    }

    const duration = Date.now() - startTime;

    this.logger.info('Inactivity check: completed', {
      firstAnalysisEmailsSent,
      inactivityEmailsSent,
      skipped,
      durationMs: duration,
    });
  }

  /**
   * SOLO/PRO plan: Daily at 10:15 Paris time
   * Sends re-engagement emails to inactive paid users
   */
  @Cron('15 10 * * *', {
    name: 'inactivity-check-paid',
    timeZone: 'Europe/Paris',
  })
  async handlePaidInactivityCheck(): Promise<void> {
    this.logger.info('Starting paid inactivity check cron job');
    const startTime = Date.now();

    try {
      const result = await this.processBatch(
        (skip, take) => this.findPaidInactiveUsers(skip, take),
        (user) => this.sendPaidInactivityEmail(user),
      );

      this.logger.info('Paid inactivity check: completed', {
        emailsSent: result.sent,
        skipped: result.skipped,
        durationMs: Date.now() - startTime,
      });
    } catch (error) {
      this.logger.error(
        'Paid inactivity check: critical error',
        error instanceof Error ? error : undefined,
      );
    }
  }

  private async processBatch(
    findUsers: (skip: number, take: number) => Promise<InactiveUser[]>,
    sendEmail: (user: InactiveUser) => Promise<void>,
  ): Promise<{ sent: number; skipped: number }> {
    let sent = 0;
    let skipped = 0;
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const users = await findUsers(offset, BATCH_SIZE);

      this.logger.info('Inactivity check: processing batch', {
        offset,
        batchSize: users.length,
      });

      if (users.length === 0) {
        break;
      }

      for (const user of users) {
        if (!user.project) {
          skipped++;
          continue;
        }

        try {
          await sendEmail(user);
          sent++;
        } catch (error) {
          this.logger.error(
            'Inactivity check: failed to send email',
            error instanceof Error ? error : undefined,
            { userId: user.id },
          );
        }
      }

      offset += BATCH_SIZE;
      hasMore = users.length === BATCH_SIZE;
    }

    return { sent, skipped };
  }

  private async findFirstTimeUsers(skip: number, take: number): Promise<InactiveUser[]> {
    const now = new Date();
    const signupThreshold = new Date(
      now.getTime() - FIRST_ANALYSIS_THRESHOLD_DAYS * 24 * 60 * 60 * 1000,
    );
    const emailIntervalThreshold = new Date(
      now.getTime() - MIN_EMAIL_INTERVAL_DAYS * 24 * 60 * 60 * 1000,
    );

    return this.prisma.user
      .findMany({
        where: {
          plan: Plan.FREE,
          emailNotificationsEnabled: true,
          deletedAt: null,
          lastScanAt: null,
          createdAt: { lt: signupThreshold },
          OR: [
            { lastInactivityEmailAt: null },
            { lastInactivityEmailAt: { lt: emailIntervalThreshold } },
          ],
        },
        select: {
          id: true,
          email: true,
          name: true,
          projects: {
            take: 1,
            orderBy: { createdAt: 'asc' },
            select: {
              id: true,
              brandName: true,
            },
          },
        },
        skip,
        take,
        orderBy: { createdAt: 'asc' },
      })
      .then((users) =>
        users.map((user) => ({
          ...user,
          project: user.projects[0] ?? null,
        })),
      );
  }

  private async findReturningInactiveUsers(skip: number, take: number): Promise<InactiveUser[]> {
    const now = new Date();
    const inactivityThreshold = new Date(
      now.getTime() - INACTIVITY_THRESHOLD_DAYS * 24 * 60 * 60 * 1000,
    );
    const emailIntervalThreshold = new Date(
      now.getTime() - MIN_EMAIL_INTERVAL_DAYS * 24 * 60 * 60 * 1000,
    );

    return this.prisma.user
      .findMany({
        where: {
          plan: Plan.FREE,
          emailNotificationsEnabled: true,
          deletedAt: null,
          lastScanAt: { not: null, lt: inactivityThreshold },
          OR: [
            { lastInactivityEmailAt: null },
            { lastInactivityEmailAt: { lt: emailIntervalThreshold } },
          ],
        },
        select: {
          id: true,
          email: true,
          name: true,
          projects: {
            take: 1,
            orderBy: { createdAt: 'asc' },
            select: {
              id: true,
              brandName: true,
            },
          },
        },
        skip,
        take,
        orderBy: { createdAt: 'asc' },
      })
      .then((users) =>
        users.map((user) => ({
          ...user,
          project: user.projects[0] ?? null,
        })),
      );
  }

  private async sendFirstAnalysisEmail(user: InactiveUser): Promise<void> {
    const project = user.project!;
    const now = new Date();

    const unsubscribeToken = this.unsubscribeTokenService.generateToken(user.id);
    const firstName = user.name.split(' ')[0];

    await this.emailQueueService.addJob({
      type: 'first-analysis',
      to: user.email,
      data: {
        firstName,
        brandName: project.brandName,
        projectUrl: `${this.frontendUrl}/projects/${project.id}`,
        unsubscribeUrl: `${this.apiUrl}/email/unsubscribe?token=${unsubscribeToken}`,
      },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastInactivityEmailAt: now },
    });

    this.logger.info('Inactivity check: first-analysis email queued', {
      userId: user.id,
      projectId: project.id,
    });
  }

  private async sendInactivityEmail(user: InactiveUser): Promise<void> {
    const project = user.project!;
    const now = new Date();

    const unsubscribeToken = this.unsubscribeTokenService.generateToken(user.id);
    const firstName = user.name.split(' ')[0];

    await this.emailQueueService.addJob({
      type: 'inactivity',
      to: user.email,
      data: {
        firstName,
        brandName: project.brandName,
        projectUrl: `${this.frontendUrl}/projects/${project.id}`,
        unsubscribeUrl: `${this.apiUrl}/email/unsubscribe?token=${unsubscribeToken}`,
      },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastInactivityEmailAt: now },
    });

    this.logger.info('Inactivity check: inactivity email queued', {
      userId: user.id,
      projectId: project.id,
    });
  }

  private async findPaidInactiveUsers(skip: number, take: number): Promise<InactiveUser[]> {
    const now = new Date();
    const inactivityThreshold = new Date(
      now.getTime() - PAID_INACTIVITY_THRESHOLD_DAYS * 24 * 60 * 60 * 1000,
    );
    const emailIntervalThreshold = new Date(
      now.getTime() - MIN_EMAIL_INTERVAL_DAYS * 24 * 60 * 60 * 1000,
    );

    return this.prisma.user
      .findMany({
        where: {
          plan: { in: [Plan.SOLO, Plan.PRO] },
          emailNotificationsEnabled: true,
          deletedAt: null,
          lastScanAt: { not: null, lt: inactivityThreshold },
          OR: [
            { lastInactivityEmailAt: null },
            { lastInactivityEmailAt: { lt: emailIntervalThreshold } },
          ],
        },
        select: {
          id: true,
          email: true,
          name: true,
          projects: {
            take: 1,
            orderBy: { createdAt: 'asc' },
            select: {
              id: true,
              brandName: true,
            },
          },
        },
        skip,
        take,
        orderBy: { createdAt: 'asc' },
      })
      .then((users) =>
        users.map((user) => ({
          ...user,
          project: user.projects[0] ?? null,
        })),
      );
  }

  private async sendPaidInactivityEmail(user: InactiveUser): Promise<void> {
    const project = user.project!;
    const now = new Date();

    const unsubscribeToken = this.unsubscribeTokenService.generateToken(user.id);
    const firstName = user.name.split(' ')[0];

    await this.emailQueueService.addJob({
      type: 'paid-inactivity',
      to: user.email,
      data: {
        firstName,
        brandName: project.brandName,
        projectUrl: `${this.frontendUrl}/projects/${project.id}`,
        unsubscribeUrl: `${this.apiUrl}/email/unsubscribe?token=${unsubscribeToken}`,
      },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastInactivityEmailAt: now },
    });

    this.logger.info('Paid inactivity check: email queued', {
      userId: user.id,
      projectId: project.id,
    });
  }
}
