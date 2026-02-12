import { Injectable, type OnModuleInit, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, QueueEvents } from 'bullmq';

import { LoggerService } from '../../common/logger';
import { EMAIL_QUEUE_NAME, defaultJobOptions } from './queue.config';
import type { EmailJobData } from './types/email-job.types';

const ADMIN_NOTIFICATION_EMAIL = 'jerome@coucou-ia.com';

export interface QueueHealthStatus {
  status: 'healthy' | 'unhealthy';
  latencyMs?: number;
}

@Injectable()
export class EmailQueueService implements OnModuleInit, OnModuleDestroy {
  private queueEvents: QueueEvents | null = null;

  constructor(
    @InjectQueue(EMAIL_QUEUE_NAME)
    private readonly emailQueue: Queue<EmailJobData>,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(EmailQueueService.name);
  }

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

    this.queueEvents = new QueueEvents(EMAIL_QUEUE_NAME, {
      connection: { url: redisUrl },
    });

    this.queueEvents.on('added', ({ jobId, name }) => {
      this.logger.info('Email job created', { jobId, jobName: name });
    });

    this.queueEvents.on('completed', ({ jobId, returnvalue }) => {
      this.logger.info('Email job completed', { jobId, result: returnvalue });
    });

    this.queueEvents.on('failed', ({ jobId, failedReason }) => {
      this.logger.error('Email job failed', { jobId, reason: failedReason });
    });

    this.logger.info('Email queue event listeners initialized');
  }

  async addJob(data: EmailJobData, options?: { delay?: number; jobId?: string }): Promise<string> {
    const job = await this.emailQueue.add(data.type, data, {
      ...defaultJobOptions,
      ...options,
    });

    this.logger.info('Email job queued', {
      jobId: job.id,
      type: data.type,
      to: data.to,
    });

    return job.id ?? '';
  }

  async getHealth(): Promise<QueueHealthStatus> {
    try {
      const start = Date.now();
      const client = await this.emailQueue.client;
      await client.ping();
      const latencyMs = Date.now() - start;

      return { status: 'healthy', latencyMs };
    } catch (error) {
      this.logger.error('Redis health check failed', error instanceof Error ? error : undefined);
      return { status: 'unhealthy' };
    }
  }

  async notifyNewUser(
    user: {
      name: string | null;
      email: string;
    },
    authMethod: 'email' | 'google',
  ): Promise<string> {
    return this.addJob({
      type: 'new-user-notification',
      to: ADMIN_NOTIFICATION_EMAIL,
      data: {
        userName: user.name ?? user.email.split('@')[0],
        userEmail: user.email,
        authMethod,
        createdAt: new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }),
      },
    });
  }

}
