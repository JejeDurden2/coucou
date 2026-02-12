import { Injectable, type OnModuleInit, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, QueueEvents } from 'bullmq';

import { LoggerService } from '../../../../common/logger';
import {
  AUDIT_QUEUE_NAME,
  auditJobOptions,
  auditTimeoutCheckJobOptions,
} from '../../../../infrastructure/queue/queue.config';

export interface AuditJobData {
  auditOrderId: string;
  projectId: string;
  userId: string;
}

export interface AuditTimeoutCheckJobData {
  auditOrderId: string;
}

export interface CompleteAuditJobData {
  auditId: string;
  status: 'completed' | 'partial' | 'failed';
  error?: string;
  result?: unknown;
}

@Injectable()
export class AuditQueueService implements OnModuleInit, OnModuleDestroy {
  private queueEvents: QueueEvents | null = null;

  constructor(
    @InjectQueue(AUDIT_QUEUE_NAME)
    private readonly auditQueue: Queue<AuditJobData | AuditTimeoutCheckJobData | CompleteAuditJobData>,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(AuditQueueService.name);
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

    this.queueEvents = new QueueEvents(AUDIT_QUEUE_NAME, {
      connection: { url: redisUrl },
    });

    this.queueEvents.on('added', ({ jobId, name }) => {
      this.logger.info('Audit job created', { jobId, jobName: name });
    });

    this.queueEvents.on('completed', ({ jobId, returnvalue }) => {
      this.logger.info('Audit job completed', { jobId, result: returnvalue });
    });

    this.queueEvents.on('failed', ({ jobId, failedReason }) => {
      this.logger.error('Audit job failed', { jobId, reason: failedReason });
    });

    this.logger.info('Audit queue event listeners initialized');
  }

  async addJob(data: AuditJobData): Promise<string> {
    const job = await this.auditQueue.add('run-audit', data, auditJobOptions);

    this.logger.info('Audit job queued', {
      jobId: job.id,
      auditOrderId: data.auditOrderId,
      projectId: data.projectId,
    });

    return job.id ?? '';
  }

  async addTimeoutCheckJob(
    data: AuditTimeoutCheckJobData,
    delayMs: number,
  ): Promise<string> {
    const job = await this.auditQueue.add('check-audit-timeout', data, {
      ...auditTimeoutCheckJobOptions,
      delay: delayMs,
    });

    this.logger.info('Audit timeout check job scheduled', {
      jobId: job.id,
      auditOrderId: data.auditOrderId,
      delayMs,
    });

    return job.id ?? '';
  }

  async addCompleteJob(data: CompleteAuditJobData): Promise<string> {
    const job = await this.auditQueue.add('complete-audit', data, {
      ...auditJobOptions,
      jobId: `complete-audit-${data.auditId}`,
    });

    this.logger.info('Audit completion job queued', {
      jobId: job.id,
      auditId: data.auditId,
      status: data.status,
    });

    return job.id ?? '';
  }
}
