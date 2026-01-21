import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Plan } from '@prisma/client';

import { PrismaService } from '../../prisma';
import { EMAIL_PORT, type EmailPort, generateInactivityEmail } from '../email';

interface InactiveProject {
  id: string;
  brandName: string;
  lastScannedAt: Date | null;
  user: {
    id: string;
    email: string;
    name: string;
    plan: Plan;
  };
}

@Injectable()
export class InactivityNotificationService {
  private readonly logger = new Logger(InactivityNotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @Inject(EMAIL_PORT) private readonly emailPort: EmailPort,
  ) {}

  /**
   * Runs every day at 9:00 AM to check for inactive projects
   * and send re-engagement emails
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleInactivityCheck(): Promise<void> {
    this.logger.log('Starting inactivity check...');

    try {
      const inactiveProjects = await this.findInactiveProjects();
      this.logger.log(`Found ${inactiveProjects.length} inactive projects`);

      for (const project of inactiveProjects) {
        await this.sendInactivityEmail(project);
      }

      this.logger.log('Inactivity check completed');
    } catch (error) {
      this.logger.error('Failed to run inactivity check', error);
    }
  }

  private async findInactiveProjects(): Promise<InactiveProject[]> {
    const now = new Date();

    // FREE users: 30 days inactivity threshold
    const freeThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    // Paid users: 14 days inactivity threshold
    const paidThreshold = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Find projects that haven't been scanned in a while
    // We use a raw query approach with OR conditions for different plans
    const projects = await this.prisma.project.findMany({
      where: {
        OR: [
          // FREE users with no scan in 30+ days
          {
            user: { plan: Plan.FREE },
            OR: [
              { lastScannedAt: { lt: freeThreshold } },
              { lastScannedAt: null, createdAt: { lt: freeThreshold } },
            ],
          },
          // Paid users with no scan in 14+ days
          {
            user: { plan: { in: [Plan.SOLO, Plan.PRO] } },
            OR: [
              { lastScannedAt: { lt: paidThreshold } },
              { lastScannedAt: null, createdAt: { lt: paidThreshold } },
            ],
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            plan: true,
          },
        },
      },
    });

    // Filter to only send one email per user (pick the most recent project)
    const userProjectMap = new Map<string, InactiveProject>();
    for (const project of projects) {
      const existing = userProjectMap.get(project.user.id);
      if (
        !existing ||
        (project.lastScannedAt &&
          (!existing.lastScannedAt || project.lastScannedAt > existing.lastScannedAt))
      ) {
        userProjectMap.set(project.user.id, project as InactiveProject);
      }
    }

    return Array.from(userProjectMap.values());
  }

  private async sendInactivityEmail(project: InactiveProject): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'https://coucou-ia.com';

    const lastScanDate = project.lastScannedAt ?? new Date(0);
    const daysSinceLastScan = Math.floor(
      (Date.now() - lastScanDate.getTime()) / (24 * 60 * 60 * 1000),
    );

    const { html, text } = generateInactivityEmail({
      userName: project.user.name,
      brandName: project.brandName,
      lastScanDate: lastScanDate.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      daysSinceLastScan,
      dashboardUrl: `${frontendUrl}/projects/${project.id}`,
    });

    try {
      await this.emailPort.send({
        to: project.user.email,
        subject: `${project.brandName} n'a pas été analysée depuis ${daysSinceLastScan} jours`,
        html,
        text,
      });

      this.logger.log(`Inactivity email sent to ${project.user.email} for project ${project.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to send inactivity email to ${project.user.email} for project ${project.id}`,
        error,
      );
    }
  }
}
