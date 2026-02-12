import {
  Injectable,
  type OnModuleInit,
  type OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, QueueEvents } from 'bullmq';

import { LoggerService } from '../../../../common/logger';
import {
  AUDIT_PDF_QUEUE_NAME,
  auditPdfJobOptions,
} from '../../../../infrastructure/queue/queue.config';

export interface AuditPdfJobData {
  auditOrderId: string;
}

@Injectable()
export class AuditPdfQueueService implements OnModuleInit, OnModuleDestroy {
  private queueEvents: QueueEvents | null = null;

  constructor(
    @InjectQueue(AUDIT_PDF_QUEUE_NAME)
    private readonly pdfQueue: Queue<AuditPdfJobData>,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(AuditPdfQueueService.name);
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
    const redisUrl = this.configService.get<string>(
      'REDIS_URL',
      'redis://localhost:6379',
    );

    this.queueEvents = new QueueEvents(AUDIT_PDF_QUEUE_NAME, {
      connection: { url: redisUrl },
    });

    this.queueEvents.on('added', ({ jobId, name }) => {
      this.logger.info('PDF job created', { jobId, jobName: name });
    });

    this.queueEvents.on('completed', ({ jobId }) => {
      this.logger.info('PDF job completed', { jobId });
    });

    this.queueEvents.on('failed', ({ jobId, failedReason }) => {
      this.logger.error('PDF job failed', { jobId, reason: failedReason });
    });

    this.logger.info('Audit PDF queue event listeners initialized');
  }

  async addJob(data: AuditPdfJobData): Promise<string> {
    const job = await this.pdfQueue.add(
      'generate-pdf',
      data,
      auditPdfJobOptions,
    );

    this.logger.info('PDF job queued', {
      jobId: job.id,
      auditOrderId: data.auditOrderId,
    });

    return job.id ?? '';
  }
}
