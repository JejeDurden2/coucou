import { Injectable, type OnModuleInit, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, QueueEvents } from 'bullmq';

import { LoggerService } from '../../common/logger';
import { SCAN_QUEUE_NAME, scanJobOptions } from './queue.config';
import type { ScanJobData } from './types/scan-job.types';

@Injectable()
export class ScanQueueService implements OnModuleInit, OnModuleDestroy {
  private queueEvents: QueueEvents | null = null;

  constructor(
    @InjectQueue(SCAN_QUEUE_NAME)
    private readonly scanQueue: Queue<ScanJobData>,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(ScanQueueService.name);
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

    this.queueEvents = new QueueEvents(SCAN_QUEUE_NAME, {
      connection: { url: redisUrl },
    });

    this.queueEvents.on('added', ({ jobId, name }) => {
      this.logger.info('Scan job created', { jobId, jobName: name });
    });

    this.queueEvents.on('completed', ({ jobId, returnvalue }) => {
      this.logger.info('Scan job completed', { jobId, result: returnvalue });
    });

    this.queueEvents.on('failed', ({ jobId, failedReason }) => {
      this.logger.error('Scan job failed', { jobId, reason: failedReason });
    });

    this.logger.info('Scan queue event listeners initialized');
  }

  async addJob(data: ScanJobData): Promise<string> {
    const job = await this.scanQueue.add('project-scan', data, scanJobOptions);

    this.logger.info('Scan job queued', {
      jobId: job.id,
      scanJobId: data.scanJobId,
      projectId: data.projectId,
      source: data.source ?? 'manual',
    });

    return job.id ?? '';
  }
}
