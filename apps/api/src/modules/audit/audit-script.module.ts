import { Inject, Injectable, Module } from '@nestjs/common';
import { InjectQueue, BullModule } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { LoggerService } from '../../common/logger';
import {
  AUDIT_QUEUE_NAME,
  AUDIT_PDF_QUEUE_NAME,
  auditJobOptions,
  auditAnalyzeJobOptions,
  auditPdfJobOptions,
} from '../../infrastructure/queue/queue.config';
import { AUDIT_ORDER_REPOSITORY } from './domain/repositories/audit-order.repository';
import { PrismaAuditOrderRepository } from './infrastructure/persistence/prisma-audit-order.repository';

export interface AuditRunJobData {
  auditOrderId: string;
  projectId: string;
  userId: string;
}

export interface AuditAnalyzeJobData {
  auditOrderId: string;
}

export interface AuditPdfJobData {
  auditOrderId: string;
}

/**
 * Simplified queue service for audit scripts.
 * Only provides addJob methods - no event listeners, no ConfigService dependency.
 */
@Injectable()
export class AuditScriptQueueService {
  constructor(
    @InjectQueue(AUDIT_QUEUE_NAME)
    private readonly auditQueue: Queue,
    @InjectQueue(AUDIT_PDF_QUEUE_NAME)
    private readonly pdfQueue: Queue,
    @Inject(LoggerService)
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(AuditScriptQueueService.name);
  }

  async addRunAuditJob(data: AuditRunJobData): Promise<string> {
    const job = await this.auditQueue.add('run-audit', data, auditJobOptions);
    this.logger.info('run-audit job queued', { jobId: job.id, auditOrderId: data.auditOrderId });
    return job.id ?? '';
  }

  async addAnalyzeJob(data: AuditAnalyzeJobData): Promise<string> {
    const job = await this.auditQueue.add('analyze-with-mistral', data, auditAnalyzeJobOptions);
    this.logger.info('analyze-with-mistral job queued', { jobId: job.id, auditOrderId: data.auditOrderId });
    return job.id ?? '';
  }

  async addPdfJob(data: AuditPdfJobData): Promise<string> {
    const job = await this.pdfQueue.add('generate-pdf', data, auditPdfJobOptions);
    this.logger.info('generate-pdf job queued', { jobId: job.id, auditOrderId: data.auditOrderId });
    return job.id ?? '';
  }
}

/**
 * Minimal module for audit-related scripts.
 *
 * Uses AuditScriptQueueService instead of the full AuditQueueService/AuditPdfQueueService
 * to avoid ConfigService and event listener dependencies.
 */
@Module({
  imports: [
    BullModule.registerQueue(
      { name: AUDIT_QUEUE_NAME, defaultJobOptions: auditJobOptions },
      { name: AUDIT_PDF_QUEUE_NAME, defaultJobOptions: auditPdfJobOptions },
    ),
  ],
  providers: [
    AuditScriptQueueService,
    {
      provide: AUDIT_ORDER_REPOSITORY,
      useClass: PrismaAuditOrderRepository,
    },
  ],
  exports: [AuditScriptQueueService, AUDIT_ORDER_REPOSITORY],
})
export class AuditScriptModule {}
