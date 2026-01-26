import { Injectable, Logger, type OnModuleInit, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, QueueEvents } from 'bullmq';

import {
  ONBOARDING_QUEUE_NAME,
  onboardingJobOptions,
} from '../../../../infrastructure/queue/queue.config';
import type { OnboardingJobData } from './onboarding-job.types';

@Injectable()
export class OnboardingQueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OnboardingQueueService.name);
  private queueEvents: QueueEvents | null = null;

  constructor(
    @InjectQueue(ONBOARDING_QUEUE_NAME)
    private readonly onboardingQueue: Queue<OnboardingJobData>,
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

    this.queueEvents = new QueueEvents(ONBOARDING_QUEUE_NAME, {
      connection: { url: redisUrl },
    });

    this.queueEvents.on('added', ({ jobId, name }) => {
      this.logger.log({
        message: 'Onboarding job created',
        jobId,
        jobName: name,
      });
    });

    this.queueEvents.on('completed', ({ jobId, returnvalue }) => {
      this.logger.log({
        message: 'Onboarding job completed',
        jobId,
        result: returnvalue,
      });
    });

    this.queueEvents.on('failed', ({ jobId, failedReason }) => {
      this.logger.error({
        message: 'Onboarding job failed',
        jobId,
        reason: failedReason,
      });
    });

    this.logger.log('Onboarding queue event listeners initialized');
  }

  async addJob(data: OnboardingJobData): Promise<string> {
    const job = await this.onboardingQueue.add('generate-prompts', data, onboardingJobOptions);

    this.logger.log({
      message: 'Onboarding job queued',
      jobId: job.id,
      projectId: data.projectId,
    });

    return job.id ?? '';
  }

  async getJobStatus(jobId: string): Promise<{ status: string; result?: unknown }> {
    const job = await this.onboardingQueue.getJob(jobId);
    if (!job) {
      return { status: 'not_found' };
    }

    const state = await job.getState();
    return {
      status: state,
      result: state === 'completed' ? job.returnvalue : undefined,
    };
  }
}
