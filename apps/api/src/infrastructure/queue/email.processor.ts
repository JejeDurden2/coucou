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
  generateFirstAnalysisEmail,
  generateOnboardingCreateBrandEmail,
  generateOnboardingFirstScanEmail,
  generateOnboardingCompetitorFomoEmail,
  generateOnboardingLastChanceEmail,
  generateWeeklyReportEmail,
  generateDunningFirstEmail,
  generateDunningUrgentEmail,
  generateDunningFinalEmail,
  generateUpgradeMultimodelEmail,
  generateUpgradeAutoscanEmail,
  generateUpgradeFinalEmail,
  generateWinbackCheckinEmail,
  generateWinbackValueEmail,
  generateWinbackDiscountEmail,
  generateCancellationSurveyEmail,
  generatePostUpgradeWelcomeEmail,
  generatePostUpgradeTipsEmail,
  generateMilestoneFirstCitationEmail,
  generateMilestoneScanCountEmail,
  generatePaidInactivityEmail,
  generatePlanApproachingLimitEmail,
  generateNpsSurveyEmail,
  generateFounderOutreachEmail,
  generateSoloToProNudgeEmail,
} from '../../modules/email';

import { EMAIL_QUEUE_NAME } from './queue.config';
import type { EmailJobData, EmailJobResult, EmailJobType } from './types/email-job.types';

type EmailGenerator = (data: never) => { html: string; text: string };

const EMAIL_CONFIG: Record<EmailJobType, { generator: EmailGenerator; subject: string }> = {
  welcome: {
    generator: generateWelcomeEmail as EmailGenerator,
    subject: 'Bienvenue sur Coucou IA',
  },
  'password-reset': {
    generator: generatePasswordResetEmail as EmailGenerator,
    subject: 'Réinitialisation de votre mot de passe',
  },
  'plan-upgrade': {
    generator: generatePlanUpgradeEmail as EmailGenerator,
    subject: 'Votre nouveau plan est actif',
  },
  'plan-limit': {
    generator: generatePlanLimitEmail as EmailGenerator,
    subject: 'Limite de votre plan atteinte',
  },
  inactivity: {
    generator: generateInactivityEmail as EmailGenerator,
    subject: 'Votre projet attend une nouvelle analyse',
  },
  'first-analysis': {
    generator: generateFirstAnalysisEmail as EmailGenerator,
    subject: 'Découvrez votre visibilité dans les IA',
  },
  'new-user-notification': {
    generator: generateNewUserNotificationEmail as EmailGenerator,
    subject: 'Nouvel utilisateur inscrit',
  },
  'plan-downgrade': {
    generator: generatePlanDowngradeEmail as EmailGenerator,
    subject: "Confirmation d'annulation d'abonnement",
  },
  'subscription-ended': {
    generator: generateSubscriptionEndedEmail as EmailGenerator,
    subject: 'Votre abonnement a pris fin',
  },
  'account-deleted': {
    generator: generateAccountDeletedEmail as EmailGenerator,
    subject: 'Confirmation de suppression de compte',
  },
  'sentiment-ready': {
    generator: generateSentimentReadyEmail as EmailGenerator,
    subject: 'Votre analyse sentiment est prête',
  },
  'post-scan': {
    generator: generatePostScanEmail as EmailGenerator,
    subject: 'Vos nouveaux résultats GEO sont disponibles',
  },
  // Onboarding drip
  'onboarding-create-brand': {
    generator: generateOnboardingCreateBrandEmail as EmailGenerator,
    subject: 'Créez votre marque en 30 secondes',
  },
  'onboarding-first-scan': {
    generator: generateOnboardingFirstScanEmail as EmailGenerator,
    subject: 'Découvrez ce que les IA disent de votre marque',
  },
  'onboarding-competitor-fomo': {
    generator: generateOnboardingCompetitorFomoEmail as EmailGenerator,
    subject: 'Vos concurrents sont peut-être déjà cités par les IA',
  },
  'onboarding-last-chance': {
    generator: generateOnboardingLastChanceEmail as EmailGenerator,
    subject: 'Dernière chance : votre analyse gratuite vous attend',
  },
  // Weekly report
  'weekly-report': {
    generator: generateWeeklyReportEmail as EmailGenerator,
    subject: 'Votre rapport de visibilité IA hebdomadaire',
  },
  // Dunning
  'dunning-first': {
    generator: generateDunningFirstEmail as EmailGenerator,
    subject: "Votre paiement n'a pas abouti",
  },
  'dunning-urgent': {
    generator: generateDunningUrgentEmail as EmailGenerator,
    subject: "Action requise : votre abonnement risque d'être suspendu",
  },
  'dunning-final': {
    generator: generateDunningFinalEmail as EmailGenerator,
    subject: 'Dernier rappel avant suspension de votre compte',
  },
  // Upgrade campaign
  'upgrade-multimodel': {
    generator: generateUpgradeMultimodelEmail as EmailGenerator,
    subject: 'Vous analysez 1 modèle IA. Vos concurrents en utilisent 3.',
  },
  'upgrade-autoscan': {
    generator: generateUpgradeAutoscanEmail as EmailGenerator,
    subject: 'Vos analyses automatiques vous attendent',
  },
  'upgrade-final': {
    generator: generateUpgradeFinalEmail as EmailGenerator,
    subject: 'Votre plan gratuit a ses limites',
  },
  // Win-back
  'winback-checkin': {
    generator: generateWinbackCheckinEmail as EmailGenerator,
    subject: 'Comment va votre visibilité IA ?',
  },
  'winback-value': {
    generator: generateWinbackValueEmail as EmailGenerator,
    subject: 'Ce qui a changé dans les IA cette semaine',
  },
  'winback-discount': {
    generator: generateWinbackDiscountEmail as EmailGenerator,
    subject: 'Offre spéciale : -20% sur votre abonnement Coucou IA pendant 3 mois',
  },
  // Cancellation
  'cancellation-survey': {
    generator: generateCancellationSurveyEmail as EmailGenerator,
    subject: 'Pourquoi nous quittez-vous ?',
  },
  // Post-upgrade onboarding
  'post-upgrade-welcome': {
    generator: generatePostUpgradeWelcomeEmail as EmailGenerator,
    subject: 'Tirez le maximum de votre nouveau plan',
  },
  'post-upgrade-tips': {
    generator: generatePostUpgradeTipsEmail as EmailGenerator,
    subject: '3 astuces pour maximiser votre visibilité IA',
  },
  // Milestones
  'milestone-first-citation': {
    generator: generateMilestoneFirstCitationEmail as EmailGenerator,
    subject: 'Votre marque a été citée par une IA !',
  },
  'milestone-scan-count': {
    generator: generateMilestoneScanCountEmail as EmailGenerator,
    subject: 'Continuez sur cette lancée !',
  },
  // Paid inactivity
  'paid-inactivity': {
    generator: generatePaidInactivityEmail as EmailGenerator,
    subject: 'Vos analyses automatiques tournent — consultez vos résultats',
  },
  // Approaching limit
  'plan-approaching-limit': {
    generator: generatePlanApproachingLimitEmail as EmailGenerator,
    subject: 'Vous approchez de la limite de votre plan',
  },
  // NPS
  'nps-survey': {
    generator: generateNpsSurveyEmail as EmailGenerator,
    subject: 'Que pensez-vous de Coucou IA ?',
  },
  // Founder
  'founder-outreach': {
    generator: generateFounderOutreachEmail as EmailGenerator,
    subject: 'Jérôme de Coucou IA — un petit message personnel',
  },
  // Solo to Pro
  'solo-to-pro-nudge': {
    generator: generateSoloToProNudgeEmail as EmailGenerator,
    subject: 'Vous exploitez déjà la majorité de votre plan Solo',
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
