import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Plan } from '@prisma/client';

import { LoggerService } from '../../../common/logger';
import { PrismaService } from '../../../prisma';
import {
  PROJECT_REPOSITORY,
  type ProjectRepository,
} from '../../project/domain/repositories/project.repository';
import {
  QUEUE_PROJECT_SCAN_USE_CASE,
  type QueueProjectScanUseCase,
} from '../application/use-cases';
import { calculateNextAutoScan } from '../application/utils/next-auto-scan.util';

interface ProjectToScan {
  id: string;
  userId: string;
}

@Injectable()
export class AutoScanService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
    @Inject(QUEUE_PROJECT_SCAN_USE_CASE)
    private readonly queueProjectScanUseCase: QueueProjectScanUseCase,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(AutoScanService.name);
  }

  /**
   * SOLO plan: Monday and Thursday at 9:30 Paris time
   */
  @Cron('30 9 * * 1,4', {
    name: 'auto-scan-solo',
    timeZone: 'Europe/Paris',
  })
  async handleSoloAutoScan(): Promise<void> {
    this.logger.info('Starting SOLO auto-scan cron job');
    await this.processAutoScans(Plan.SOLO);
  }

  /**
   * PRO plan: Daily at 8:30 Paris time
   */
  @Cron('30 8 * * *', {
    name: 'auto-scan-pro',
    timeZone: 'Europe/Paris',
  })
  async handleProAutoScan(): Promise<void> {
    this.logger.info('Starting PRO auto-scan cron job');
    await this.processAutoScans(Plan.PRO);
  }

  private async processAutoScans(plan: Plan): Promise<void> {
    const startTime = Date.now();
    let successCount = 0;
    let errorCount = 0;

    try {
      const projects = await this.findProjectsByPlan(plan);

      this.logger.info('Auto-scan: found projects', {
        plan,
        projectCount: projects.length,
      });

      if (projects.length === 0) {
        return;
      }

      const now = new Date();
      const nextAutoScanAt = calculateNextAutoScan(plan, now);

      for (const project of projects) {
        try {
          // Queue the scan job
          const result = await this.queueProjectScanUseCase.execute({
            projectId: project.id,
            userId: project.userId,
            plan,
            source: 'auto',
          });

          if (result.ok) {
            // Update auto-scan timestamps
            await this.projectRepository.updateAutoScanDates(project.id, now, nextAutoScanAt);
            successCount++;

            this.logger.info('Auto-scan: project queued', {
              projectId: project.id,
              jobId: result.value.jobId,
              source: 'auto',
            });
          } else {
            errorCount++;
            this.logger.warn('Auto-scan: failed to queue project', {
              projectId: project.id,
              error: result.error.message,
            });
          }
        } catch (error) {
          errorCount++;
          this.logger.error(
            'Auto-scan: error processing project',
            error instanceof Error ? error : undefined,
            { projectId: project.id },
          );
        }
      }
    } catch (error) {
      this.logger.error('Auto-scan: critical error', error instanceof Error ? error : undefined, {
        plan,
      });
    }

    const duration = Date.now() - startTime;

    this.logger.info('Auto-scan: completed', {
      plan,
      successCount,
      errorCount,
      durationMs: duration,
    });
  }

  private async findProjectsByPlan(plan: Plan): Promise<ProjectToScan[]> {
    return this.prisma.project.findMany({
      where: {
        user: {
          plan,
        },
      },
      select: {
        id: true,
        userId: true,
      },
    });
  }
}
