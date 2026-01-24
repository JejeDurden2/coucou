import { Injectable, Logger, type OnModuleInit, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, QueueEvents } from 'bullmq';

import { SCAN_QUEUE_NAME, scanJobOptions } from './queue.config';
import type { ScanJobData } from './types/scan-job.types';

@Injectable()
export class ScanQueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ScanQueueService.name);
  private queueEvents: QueueEvents | null = null;

  constructor(
    @InjectQueue(SCAN_QUEUE_NAME)
    private readonly scanQueue: Queue<ScanJobData>,
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

    this.queueEvents = new QueueEvents(SCAN_QUEUE_NAME, {
      connection: { url: redisUrl },
    });

    this.queueEvents.on('added', ({ jobId, name }) => {
      this.logger.log({
        message: 'Scan job created',
        jobId,
        jobName: name,
      });
    });

    this.queueEvents.on('completed', ({ jobId, returnvalue }) => {
      this.logger.log({
        message: 'Scan job completed',
        jobId,
        result: returnvalue,
      });
    });

    this.queueEvents.on('failed', ({ jobId, failedReason }) => {
      this.logger.error({
        message: 'Scan job failed',
        jobId,
        reason: failedReason,
      });
    });

    this.logger.log('Scan queue event listeners initialized');
  }

  async addJob(data: ScanJobData): Promise<string> {
    const job = await this.scanQueue.add('project-scan', data, scanJobOptions);

    this.logger.log({
      message: 'Scan job queued',
      jobId: job.id,
      scanJobId: data.scanJobId,
      projectId: data.projectId,
      source: data.source ?? 'manual',
    });

    return job.id ?? '';
  }
}
