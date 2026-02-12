import type {
  WelcomeEmailData,
  PasswordResetEmailData,
  PlanUpgradeEmailData,
  PlanLimitEmailData,
  InactivityEmailData,
  FirstAnalysisEmailData,
  NewUserNotificationEmailData,
  PlanDowngradeEmailData,
  SubscriptionEndedEmailData,
  AccountDeletedEmailData,
  SentimentReadyEmailData,
  PostScanEmailData,
  OnboardingCreateBrandEmailData,
  OnboardingFirstScanEmailData,
  OnboardingCompetitorFomoEmailData,
  OnboardingLastChanceEmailData,
  WeeklyReportEmailData,
  DunningFirstEmailData,
  DunningUrgentEmailData,
  DunningFinalEmailData,
  UpgradeMultimodelEmailData,
  UpgradeAutoscanEmailData,
  UpgradeFinalEmailData,
  WinbackCheckinEmailData,
  WinbackValueEmailData,
  WinbackDiscountEmailData,
  CancellationSurveyEmailData,
  PostUpgradeWelcomeEmailData,
  PostUpgradeTipsEmailData,
  MilestoneFirstCitationEmailData,
  MilestoneScanCountEmailData,
  PaidInactivityEmailData,
  PlanApproachingLimitEmailData,
  NpsSurveyEmailData,
  FounderOutreachEmailData,
  SoloToProNudgeEmailData,
  AuditSuccessEmailData,
  AuditFailedEmailData,
  AuditAdminAlertEmailData,
} from '../../../modules/email';

export type EmailJobType =
  | 'welcome'
  | 'password-reset'
  | 'plan-upgrade'
  | 'plan-limit'
  | 'inactivity'
  | 'first-analysis'
  | 'new-user-notification'
  | 'plan-downgrade'
  | 'subscription-ended'
  | 'account-deleted'
  | 'sentiment-ready'
  | 'post-scan'
  // Onboarding drip
  | 'onboarding-create-brand'
  | 'onboarding-first-scan'
  | 'onboarding-competitor-fomo'
  | 'onboarding-last-chance'
  // Weekly report
  | 'weekly-report'
  // Dunning
  | 'dunning-first'
  | 'dunning-urgent'
  | 'dunning-final'
  // Upgrade campaign
  | 'upgrade-multimodel'
  | 'upgrade-autoscan'
  | 'upgrade-final'
  // Win-back
  | 'winback-checkin'
  | 'winback-value'
  | 'winback-discount'
  // Cancellation
  | 'cancellation-survey'
  // Post-upgrade onboarding
  | 'post-upgrade-welcome'
  | 'post-upgrade-tips'
  // Milestones
  | 'milestone-first-citation'
  | 'milestone-scan-count'
  // Paid inactivity
  | 'paid-inactivity'
  // Approaching limit
  | 'plan-approaching-limit'
  // NPS
  | 'nps-survey'
  // Founder
  | 'founder-outreach'
  // Solo to Pro
  | 'solo-to-pro-nudge'
  // Audit notifications
  | 'audit-success'
  | 'audit-failed'
  | 'audit-admin-alert';

export type EmailJobData =
  | { type: 'welcome'; to: string; data: WelcomeEmailData }
  | { type: 'password-reset'; to: string; data: PasswordResetEmailData }
  | { type: 'plan-upgrade'; to: string; data: PlanUpgradeEmailData }
  | { type: 'plan-limit'; to: string; data: PlanLimitEmailData }
  | { type: 'inactivity'; to: string; data: InactivityEmailData }
  | { type: 'first-analysis'; to: string; data: FirstAnalysisEmailData }
  | { type: 'new-user-notification'; to: string; data: NewUserNotificationEmailData }
  | { type: 'plan-downgrade'; to: string; data: PlanDowngradeEmailData }
  | { type: 'subscription-ended'; to: string; data: SubscriptionEndedEmailData }
  | { type: 'account-deleted'; to: string; data: AccountDeletedEmailData }
  | { type: 'sentiment-ready'; to: string; data: SentimentReadyEmailData }
  | { type: 'post-scan'; to: string; data: PostScanEmailData }
  // Onboarding drip
  | { type: 'onboarding-create-brand'; to: string; data: OnboardingCreateBrandEmailData }
  | { type: 'onboarding-first-scan'; to: string; data: OnboardingFirstScanEmailData }
  | { type: 'onboarding-competitor-fomo'; to: string; data: OnboardingCompetitorFomoEmailData }
  | { type: 'onboarding-last-chance'; to: string; data: OnboardingLastChanceEmailData }
  // Weekly report
  | { type: 'weekly-report'; to: string; data: WeeklyReportEmailData }
  // Dunning
  | { type: 'dunning-first'; to: string; data: DunningFirstEmailData }
  | { type: 'dunning-urgent'; to: string; data: DunningUrgentEmailData }
  | { type: 'dunning-final'; to: string; data: DunningFinalEmailData }
  // Upgrade campaign
  | { type: 'upgrade-multimodel'; to: string; data: UpgradeMultimodelEmailData }
  | { type: 'upgrade-autoscan'; to: string; data: UpgradeAutoscanEmailData }
  | { type: 'upgrade-final'; to: string; data: UpgradeFinalEmailData }
  // Win-back
  | { type: 'winback-checkin'; to: string; data: WinbackCheckinEmailData }
  | { type: 'winback-value'; to: string; data: WinbackValueEmailData }
  | { type: 'winback-discount'; to: string; data: WinbackDiscountEmailData }
  // Cancellation
  | { type: 'cancellation-survey'; to: string; data: CancellationSurveyEmailData }
  // Post-upgrade onboarding
  | { type: 'post-upgrade-welcome'; to: string; data: PostUpgradeWelcomeEmailData }
  | { type: 'post-upgrade-tips'; to: string; data: PostUpgradeTipsEmailData }
  // Milestones
  | { type: 'milestone-first-citation'; to: string; data: MilestoneFirstCitationEmailData }
  | { type: 'milestone-scan-count'; to: string; data: MilestoneScanCountEmailData }
  // Paid inactivity
  | { type: 'paid-inactivity'; to: string; data: PaidInactivityEmailData }
  // Approaching limit
  | { type: 'plan-approaching-limit'; to: string; data: PlanApproachingLimitEmailData }
  // NPS
  | { type: 'nps-survey'; to: string; data: NpsSurveyEmailData }
  // Founder
  | { type: 'founder-outreach'; to: string; data: FounderOutreachEmailData }
  // Solo to Pro
  | { type: 'solo-to-pro-nudge'; to: string; data: SoloToProNudgeEmailData }
  // Audit notifications
  | { type: 'audit-success'; to: string; data: AuditSuccessEmailData }
  | { type: 'audit-failed'; to: string; data: AuditFailedEmailData }
  | { type: 'audit-admin-alert'; to: string; data: AuditAdminAlertEmailData };

export interface EmailJobResult {
  success: boolean;
  messageId?: string;
  error?: string;
}
