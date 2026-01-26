import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';

import { ONBOARDING_QUEUE_NAME } from '../../../../infrastructure/queue/queue.config';
import { GenerateOnboardingPromptsUseCase } from '../../application/use-cases/generate-onboarding-prompts.use-case';
import type { OnboardingJobData, OnboardingJobResult } from './onboarding-job.types';

@Processor(ONBOARDING_QUEUE_NAME, {
  concurrency: 1, // Single job at a time to respect API rate limits
})
export class OnboardingProcessor extends WorkerHost {
  private readonly logger = new Logger(OnboardingProcessor.name);

  constructor(private readonly generateOnboardingPromptsUseCase: GenerateOnboardingPromptsUseCase) {
    super();
  }

  async process(job: Job<OnboardingJobData>): Promise<OnboardingJobResult> {
    const { projectId, userId, plan } = job.data;

    this.logger.log({
      message: 'Processing onboarding job',
      jobId: job.id,
      projectId,
      attempt: job.attemptsMade + 1,
    });

    const result = await this.generateOnboardingPromptsUseCase.execute(projectId, userId, plan);

    if (!result.ok) {
      this.logger.error({
        message: 'Onboarding job processing failed',
        jobId: job.id,
        projectId,
        error: result.error.message,
      });
      throw new Error(result.error.message);
    }

    this.logger.log({
      message: 'Onboarding job processed successfully',
      jobId: job.id,
      projectId,
      promptsCreated: result.value.length,
    });

    return {
      status: 'completed',
      promptsCreated: result.value.length,
    };
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<OnboardingJobData>, error: Error): void {
    this.logger.error({
      message: 'Onboarding job failed',
      jobId: job.id,
      projectId: job.data.projectId,
      attempt: job.attemptsMade,
      maxAttempts: job.opts.attempts,
      error: error.message,
    });
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<OnboardingJobData>): void {
    this.logger.log({
      message: 'Onboarding job completed',
      jobId: job.id,
      projectId: job.data.projectId,
    });
  }
}
