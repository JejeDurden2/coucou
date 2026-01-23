import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Job } from 'bullmq';

import { SENTIMENT_QUEUE_NAME } from '../../../../infrastructure/queue/queue.config';
import { EmailQueueService } from '../../../../infrastructure/queue/email-queue.service';
import type {
  SentimentJobData,
  SentimentJobResult,
} from '../../../../infrastructure/queue/types/sentiment-job.types';
import { ExecuteSentimentScanUseCase } from '../../application/use-cases';
import { PrismaService } from '../../../../prisma';

@Processor(SENTIMENT_QUEUE_NAME, {
  concurrency: 1, // Process 1 sentiment job at a time (LLM intensive)
})
export class SentimentProcessor extends WorkerHost {
  private readonly logger = new Logger(SentimentProcessor.name);

  constructor(
    private readonly executeSentimentScanUseCase: ExecuteSentimentScanUseCase,
    private readonly prisma: PrismaService,
    private readonly emailQueueService: EmailQueueService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async process(job: Job<SentimentJobData>): Promise<SentimentJobResult> {
    const { projectId, userId } = job.data;

    this.logger.log({
      message: 'Processing sentiment scan job',
      jobId: job.id,
      projectId,
      attempt: job.attemptsMade + 1,
    });

    const result = await this.executeSentimentScanUseCase.execute(projectId, userId);

    if (!result.ok) {
      this.logger.error({
        message: 'Sentiment scan job failed',
        jobId: job.id,
        projectId,
        error: result.error.message,
      });
      throw new Error(result.error.message);
    }

    this.logger.log({
      message: 'Sentiment scan job completed',
      jobId: job.id,
      projectId,
      scanId: result.value.id,
      globalScore: result.value.globalScore,
    });

    // Send notification email
    await this.sendNotificationEmail(projectId, userId);

    return {
      success: true,
      scanId: result.value.id,
      globalScore: result.value.globalScore,
    };
  }

  private async sendNotificationEmail(projectId: string, userId: string): Promise<void> {
    try {
      const [user, project] = await Promise.all([
        this.prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } }),
        this.prisma.project.findUnique({
          where: { id: projectId },
          select: { name: true, brandName: true },
        }),
      ]);

      if (!user || !project) {
        this.logger.warn({
          message: 'Could not send sentiment notification email - user or project not found',
          projectId,
          userId,
        });
        return;
      }

      const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'https://coucou-ia.com');
      const dashboardUrl = `${frontendUrl}/projects/${projectId}?tab=sentiment`;

      await this.emailQueueService.addJob({
        type: 'sentiment-ready',
        to: user.email,
        data: {
          userName: user.name || user.email.split('@')[0],
          brandName: project.brandName || project.name,
          dashboardUrl,
        },
      });

      this.logger.log({
        message: 'Sentiment notification email queued',
        projectId,
        userEmail: user.email,
      });
    } catch (error) {
      this.logger.error({
        message: 'Failed to queue sentiment notification email',
        projectId,
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      // Don't throw - email failure shouldn't fail the job
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<SentimentJobData>, error: Error): void {
    this.logger.error({
      message: 'Sentiment scan job failed permanently',
      jobId: job.id,
      projectId: job.data.projectId,
      attempt: job.attemptsMade,
      maxAttempts: job.opts.attempts,
      error: error.message,
    });
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<SentimentJobData>): void {
    this.logger.log({
      message: 'Sentiment scan job completed successfully',
      jobId: job.id,
      projectId: job.data.projectId,
    });
  }
}
