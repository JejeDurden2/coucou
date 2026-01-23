import {
  Injectable,
  Logger,
  type OnModuleInit,
  type OnModuleDestroy,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Queue, QueueEvents } from 'bullmq';
import { Plan } from '@prisma/client';

import { SENTIMENT_QUEUE_NAME, sentimentJobOptions } from './queue.config';
import type { SentimentJobData } from './types/sentiment-job.types';
import { PrismaService } from '../../prisma';
import { SENTIMENT_SCAN_REPOSITORY, type SentimentScanRepository } from '../../modules/sentiment';

@Injectable()
export class SentimentQueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SentimentQueueService.name);
  private queueEvents: QueueEvents | null = null;

  constructor(
    @InjectQueue(SENTIMENT_QUEUE_NAME)
    private readonly sentimentQueue: Queue<SentimentJobData>,
    @Inject(SENTIMENT_SCAN_REPOSITORY)
    private readonly sentimentRepository: SentimentScanRepository,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit(): void {
    this.setupEventListeners();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.queueEvents) {
      await this.queueEvents.close();
    }
  }

  private setupEventListeners(): void {
    const redisUrl = this.configService.get<string>('REDIS_URL', 'redis://localhost:6379');

    this.queueEvents = new QueueEvents(SENTIMENT_QUEUE_NAME, {
      connection: { url: redisUrl },
    });

    this.queueEvents.on('added', ({ jobId, name }) => {
      this.logger.log({
        message: 'Sentiment job created',
        jobId,
        jobName: name,
      });
    });

    this.queueEvents.on('completed', ({ jobId, returnvalue }) => {
      this.logger.log({
        message: 'Sentiment job completed',
        jobId,
        result: returnvalue,
      });
    });

    this.queueEvents.on('failed', ({ jobId, failedReason }) => {
      this.logger.error({
        message: 'Sentiment job failed',
        jobId,
        reason: failedReason,
      });
    });

    this.logger.log('Sentiment queue event listeners initialized');
  }

  /**
   * Manually enqueue a sentiment scan job for a project
   */
  async addJob(data: SentimentJobData): Promise<string> {
    const job = await this.sentimentQueue.add('sentiment-scan', data, sentimentJobOptions);

    this.logger.log({
      message: 'Sentiment job queued',
      jobId: job.id,
      projectId: data.projectId,
    });

    return job.id ?? '';
  }

  /**
   * Cron job: runs every Tuesday at 8:00 AM (Europe/Paris)
   * Enqueues sentiment scans for all eligible projects (SOLO/PRO plans)
   */
  @Cron('0 8 * * 2', {
    name: 'weekly-sentiment-scan',
    timeZone: 'Europe/Paris',
  })
  async scheduleWeeklySentimentScans(): Promise<void> {
    this.logger.log('Starting weekly sentiment scan scheduling');

    try {
      const eligibleProjects = await this.findEligibleProjects();
      let enqueuedCount = 0;

      for (const project of eligibleProjects) {
        const hasRecentScan = await this.hasRecentSentimentScan(project.id);

        if (hasRecentScan) {
          this.logger.debug({
            message: 'Skipping project - recent scan exists',
            projectId: project.id,
          });
          continue;
        }

        await this.addJob({
          projectId: project.id,
          userId: project.userId,
        });
        enqueuedCount++;
      }

      this.logger.log({
        message: 'Weekly sentiment scan scheduling completed',
        eligibleProjects: eligibleProjects.length,
        enqueuedJobs: enqueuedCount,
        skipped: eligibleProjects.length - enqueuedCount,
      });
    } catch (error) {
      this.logger.error({
        message: 'Failed to schedule weekly sentiment scans',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Find all projects belonging to users with SOLO or PRO plans
   */
  private async findEligibleProjects(): Promise<{ id: string; userId: string }[]> {
    const projects = await this.prisma.project.findMany({
      where: {
        user: {
          plan: {
            in: [Plan.SOLO, Plan.PRO],
          },
        },
      },
      select: {
        id: true,
        userId: true,
      },
    });

    return projects;
  }

  /**
   * Check if a sentiment scan exists for the project this week
   * (since last Monday 00:00)
   */
  private async hasRecentSentimentScan(projectId: string): Promise<boolean> {
    const startOfWeek = this.getStartOfWeek();
    const history = await this.sentimentRepository.findHistoryByProjectId(projectId, startOfWeek);
    return history.length > 0;
  }

  /**
   * Get the start of the current week (Monday 00:00 Europe/Paris)
   */
  private getStartOfWeek(): Date {
    const now = new Date();
    const day = now.getDay();
    // getDay() returns 0 for Sunday, 1 for Monday, etc.
    // We want Monday as the start of the week
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }
}
