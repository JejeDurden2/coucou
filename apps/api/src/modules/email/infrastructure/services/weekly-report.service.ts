import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';

import { LoggerService } from '../../../../common/logger';
import { EmailQueueService } from '../../../../infrastructure/queue';
import { PrismaService } from '../../../../prisma';
import { UnsubscribeTokenService } from './unsubscribe-token.service';

const BATCH_SIZE = 100;

interface ScanResultEntry {
  isCited?: boolean;
  competitors?: string[];
}

interface WeeklyReportUser {
  id: string;
  email: string;
  name: string;
  plan: string;
  lastWeeklyReportAt: Date | null;
  projects: Array<{
    id: string;
    brandName: string;
    prompts: Array<{
      id: string;
      scans: Array<{
        results: unknown;
        executedAt: Date;
      }>;
    }>;
  }>;
}

interface ScanMetrics {
  citationRate: number;
  citationRateChange: number;
  totalPrompts: number;
  citedPrompts: number;
  topCompetitors: string[];
}

@Injectable()
export class WeeklyReportService {
  private readonly frontendUrl: string;
  private readonly apiUrl: string;

  constructor(
    private readonly logger: LoggerService,
    private readonly prisma: PrismaService,
    private readonly emailQueueService: EmailQueueService,
    private readonly configService: ConfigService,
    private readonly unsubscribeTokenService: UnsubscribeTokenService,
  ) {
    this.logger.setContext(WeeklyReportService.name);
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL', 'https://coucou-ia.com');
    this.apiUrl = this.configService.get<string>('API_URL', 'https://api.coucou-ia.com');
  }

  /**
   * Monday at 09:00 Paris time
   * Sends weekly visibility reports to active users
   */
  @Cron('0 9 * * 1', {
    name: 'weekly-report',
    timeZone: 'Europe/Paris',
  })
  async handleWeeklyReport(): Promise<void> {
    this.logger.info('Starting weekly report cron job');
    const startTime = Date.now();
    let emailsSent = 0;
    let offset = 0;
    let hasMore = true;

    try {
      while (hasMore) {
        const users = await this.findEligibleUsers(offset, BATCH_SIZE);

        if (users.length === 0) break;

        for (const user of users) {
          try {
            const sent = await this.sendReportForUser(user);
            if (sent) emailsSent++;
          } catch (error) {
            this.logger.error(
              'Weekly report: failed for user',
              error instanceof Error ? error : undefined,
              { userId: user.id },
            );
          }
        }

        offset += BATCH_SIZE;
        hasMore = users.length === BATCH_SIZE;
      }
    } catch (error) {
      this.logger.error(
        'Weekly report: critical error',
        error instanceof Error ? error : undefined,
      );
    }

    this.logger.info('Weekly report: completed', {
      emailsSent,
      durationMs: Date.now() - startTime,
    });
  }

  private async findEligibleUsers(skip: number, take: number): Promise<WeeklyReportUser[]> {
    const now = new Date();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return this.prisma.user.findMany({
      where: {
        emailNotificationsEnabled: true,
        deletedAt: null,
        lastScanAt: { not: null },
        OR: [{ lastWeeklyReportAt: null }, { lastWeeklyReportAt: { lt: oneWeekAgo } }],
      },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        lastWeeklyReportAt: true,
        projects: {
          take: 1,
          orderBy: { lastScannedAt: 'desc' },
          select: {
            id: true,
            brandName: true,
            prompts: {
              where: { isActive: true },
              select: {
                id: true,
                scans: {
                  where: { executedAt: { gte: twoWeeksAgo } },
                  orderBy: { executedAt: 'desc' },
                  take: 10,
                  select: { results: true, executedAt: true },
                },
              },
            },
          },
        },
      },
      skip,
      take,
      orderBy: { createdAt: 'asc' },
    });
  }

  private async sendReportForUser(user: WeeklyReportUser): Promise<boolean> {
    const project = user.projects[0];
    if (!project || project.prompts.length === 0) return false;

    const metrics = this.computeMetrics(project.prompts);
    if (metrics.totalPrompts === 0) return false;

    const firstName = user.name.split(' ')[0];
    const unsubscribeToken = this.unsubscribeTokenService.generateToken(user.id);

    await this.emailQueueService.addJob({
      type: 'weekly-report',
      to: user.email,
      data: {
        firstName,
        brandName: project.brandName,
        projectUrl: `${this.frontendUrl}/projects/${project.id}`,
        citationRate: metrics.citationRate,
        citationRateChange: metrics.citationRateChange,
        totalPrompts: metrics.totalPrompts,
        citedPrompts: metrics.citedPrompts,
        topCompetitors: metrics.topCompetitors,
        plan: user.plan as 'FREE' | 'SOLO' | 'PRO',
        unsubscribeUrl: `${this.apiUrl}/email/unsubscribe?token=${unsubscribeToken}`,
      },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastWeeklyReportAt: new Date() },
    });

    return true;
  }

  private computeMetrics(
    prompts: Array<{
      scans: Array<{ results: unknown; executedAt: Date }>;
    }>,
  ): ScanMetrics {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    let thisWeekCited = 0;
    let thisWeekTotal = 0;
    let lastWeekCited = 0;
    let lastWeekTotal = 0;
    const competitorCounts = new Map<string, number>();

    for (const prompt of prompts) {
      for (const scan of prompt.scans) {
        const results = scan.results as ScanResultEntry[];
        if (!Array.isArray(results)) continue;

        const isThisWeek = scan.executedAt >= oneWeekAgo;
        const isLastWeek = scan.executedAt >= twoWeeksAgo && scan.executedAt < oneWeekAgo;

        const isCitedInAnyScan = results.some((r) => r.isCited);

        if (isThisWeek) {
          thisWeekTotal++;
          if (isCitedInAnyScan) thisWeekCited++;
        } else if (isLastWeek) {
          lastWeekTotal++;
          if (isCitedInAnyScan) lastWeekCited++;
        }

        // Collect competitors from this week
        if (isThisWeek) {
          for (const result of results) {
            if (result.competitors) {
              for (const comp of result.competitors) {
                competitorCounts.set(comp, (competitorCounts.get(comp) ?? 0) + 1);
              }
            }
          }
        }
      }
    }

    const citationRate = thisWeekTotal > 0 ? Math.round((thisWeekCited / thisWeekTotal) * 100) : 0;
    const lastWeekRate = lastWeekTotal > 0 ? Math.round((lastWeekCited / lastWeekTotal) * 100) : 0;
    const citationRateChange = citationRate - lastWeekRate;

    const topCompetitors = [...competitorCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name);

    return {
      citationRate,
      citationRateChange,
      totalPrompts: thisWeekTotal || prompts.length,
      citedPrompts: thisWeekCited,
      topCompetitors,
    };
  }
}
