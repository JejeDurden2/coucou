import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import type { Job } from 'bullmq';

import {
  EMAIL_PORT,
  type EmailPort,
  generateWelcomeEmail,
  generatePasswordResetEmail,
  generatePlanUpgradeEmail,
  generatePlanLimitEmail,
  generateInactivityEmail,
  generateNewUserNotificationEmail,
  generatePlanDowngradeEmail,
  generateSubscriptionEndedEmail,
  generateAccountDeletedEmail,
  generateSentimentReadyEmail,
  generatePostScanEmail,
} from '../../modules/email';

import { EMAIL_QUEUE_NAME } from './queue.config';
import type { EmailJobData, EmailJobResult, EmailJobType } from './types/email-job.types';

const EMAIL_CONFIG: Record<
  EmailJobType,
  {
    generator: (data: never) => { html: string; text: string };
    subject: string;
  }
> = {
  welcome: {
    generator: generateWelcomeEmail as (data: never) => { html: string; text: string },
    subject: 'Bienvenue sur Coucou IA',
  },
  'password-reset': {
    generator: generatePasswordResetEmail as (data: never) => { html: string; text: string },
    subject: 'Réinitialisation de votre mot de passe',
  },
  'plan-upgrade': {
    generator: generatePlanUpgradeEmail as (data: never) => { html: string; text: string },
    subject: 'Votre nouveau plan est actif',
  },
  'plan-limit': {
    generator: generatePlanLimitEmail as (data: never) => { html: string; text: string },
    subject: 'Limite de votre plan atteinte',
  },
  inactivity: {
    generator: generateInactivityEmail as (data: never) => { html: string; text: string },
    subject: 'Votre projet attend un nouveau scan',
  },
  'new-user-notification': {
    generator: generateNewUserNotificationEmail as (data: never) => { html: string; text: string },
    subject: 'Nouvel utilisateur inscrit',
  },
  'plan-downgrade': {
    generator: generatePlanDowngradeEmail as (data: never) => { html: string; text: string },
    subject: "Confirmation d'annulation d'abonnement",
  },
  'subscription-ended': {
    generator: generateSubscriptionEndedEmail as (data: never) => { html: string; text: string },
    subject: 'Votre abonnement a pris fin',
  },
  'account-deleted': {
    generator: generateAccountDeletedEmail as (data: never) => { html: string; text: string },
    subject: 'Confirmation de suppression de compte',
  },
  'sentiment-ready': {
    generator: generateSentimentReadyEmail as (data: never) => { html: string; text: string },
    subject: 'Votre analyse sentiment est prête',
  },
  'post-scan': {
    generator: generatePostScanEmail as (data: never) => { html: string; text: string },
    subject: 'Vos nouveaux résultats GEO sont disponibles',
  },
};

@Processor(EMAIL_QUEUE_NAME, {
  concurrency: 1, // Sequential processing to avoid Resend rate limits
})
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(
    @Inject(EMAIL_PORT)
    private readonly emailPort: EmailPort,
  ) {
    super();
  }

  async process(job: Job<EmailJobData>): Promise<EmailJobResult> {
    const { type, to, data } = job.data;

    this.logger.log({
      message: 'Processing email job',
      jobId: job.id,
      type,
      to,
      attempt: job.attemptsMade + 1,
    });

    const config = EMAIL_CONFIG[type];
    if (!config) {
      this.logger.error({
        message: 'Unknown email job type',
        jobId: job.id,
        type,
      });
      throw new Error(`Unknown email job type: ${type}`);
    }

    const { html, text } = config.generator(data as never);

    await this.emailPort.send({
      to,
      subject: config.subject,
      html,
      text,
    });

    this.logger.log({
      message: 'Email sent successfully',
      jobId: job.id,
      type,
      to,
    });

    return { success: true };
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<EmailJobData>, error: Error): void {
    this.logger.error({
      message: 'Email job failed',
      jobId: job.id,
      type: job.data.type,
      to: job.data.to,
      attempt: job.attemptsMade,
      maxAttempts: job.opts.attempts,
      error: error.message,
    });
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<EmailJobData>): void {
    this.logger.log({
      message: 'Email job completed',
      jobId: job.id,
      type: job.data.type,
      to: job.data.to,
    });
  }
}
