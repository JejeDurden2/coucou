import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { Plan } from '@prisma/client';

import { EmailQueueService } from '../../../infrastructure/queue';
import { PrismaService } from '../../../prisma';
import { UnsubscribeTokenService } from './services/unsubscribe-token.service';

const INACTIVITY_THRESHOLD_DAYS = 14;
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
  private readonly logger = new Logger(InactivityCheckService.name);
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
   * FREE plan: Daily at 10:00 Paris time
   * Sends reactivation emails to inactive users
   */
  @Cron('0 10 * * *', {
    name: 'inactivity-check-free',
    timeZone: 'Europe/Paris',
  })
  async handleInactivityCheck(): Promise<void> {
    this.logger.log('Starting inactivity check cron job');
    const startTime = Date.now();
    let emailsSent = 0;
    let skipped = 0;
    let offset = 0;

    try {
      // Process in batches
      let hasMore = true;
      while (hasMore) {
        const inactiveUsers = await this.findInactiveUsers(offset, BATCH_SIZE);

        this.logger.log({
          message: 'Inactivity check: processing batch',
          offset,
          batchSize: inactiveUsers.length,
        });

        if (inactiveUsers.length === 0) {
          hasMore = false;
          break;
        }

        for (const user of inactiveUsers) {
          if (!user.project) {
            skipped++;
            continue;
          }

          try {
            await this.sendInactivityEmail(user);
            emailsSent++;
          } catch (error) {
            this.logger.error({
              message: 'Inactivity check: failed to send email',
              userId: user.id,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }

        offset += BATCH_SIZE;
        hasMore = inactiveUsers.length === BATCH_SIZE;
      }
    } catch (error) {
      this.logger.error({
        message: 'Inactivity check: critical error',
        error: error instanceof Error ? error.message : String(error),
      });
    }

    const duration = Date.now() - startTime;

    this.logger.log({
      message: 'Inactivity check: completed',
      emailsSent,
      skipped,
      durationMs: duration,
    });
  }

  private async findInactiveUsers(skip: number, take: number): Promise<InactiveUser[]> {
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
          OR: [{ lastScanAt: null }, { lastScanAt: { lt: inactivityThreshold } }],
          AND: [
            {
              OR: [
                { lastInactivityEmailAt: null },
                { lastInactivityEmailAt: { lt: emailIntervalThreshold } },
              ],
            },
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

    this.logger.log({
      message: 'Inactivity check: email queued',
      userId: user.id,
      email: user.email,
      projectId: project.id,
    });
  }
}
