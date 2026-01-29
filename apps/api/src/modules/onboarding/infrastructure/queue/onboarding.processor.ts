import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import type { Job } from 'bullmq';

import { ONBOARDING_QUEUE_NAME } from '../../../../infrastructure/queue/queue.config';
import { LoggerService } from '../../../../common/logger';
import { GenerateOnboardingPromptsUseCase } from '../../application/use-cases/generate-onboarding-prompts.use-case';
import type { OnboardingJobData, OnboardingJobResult } from './onboarding-job.types';

@Processor(ONBOARDING_QUEUE_NAME, {
  concurrency: 1, // Single job at a time to respect API rate limits
})
export class OnboardingProcessor extends WorkerHost {
  constructor(
    private readonly generateOnboardingPromptsUseCase: GenerateOnboardingPromptsUseCase,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(OnboardingProcessor.name);
  }

  async process(job: Job<OnboardingJobData>): Promise<OnboardingJobResult> {
    const { projectId, userId, plan } = job.data;

    this.logger.info('Processing onboarding job', {
      jobId: job.id,
      projectId,
      attempt: job.attemptsMade + 1,
    });

    const result = await this.generateOnboardingPromptsUseCase.execute(projectId, userId, plan);

    if (!result.ok) {
      this.logger.error('Onboarding job processing failed', {
        jobId: job.id,
        projectId,
        error: result.error.message,
      });
      throw new Error(result.error.message);
    }

    this.logger.info('Onboarding job processed successfully', {
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
    this.logger.error('Onboarding job failed', error, {
      jobId: job.id,
      projectId: job.data.projectId,
      attempt: job.attemptsMade,
      maxAttempts: job.opts.attempts,
    });
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<OnboardingJobData>): void {
    this.logger.info('Onboarding job completed', {
      jobId: job.id,
      projectId: job.data.projectId,
    });
  }
}
