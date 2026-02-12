export { EmailModule } from './email.module';
export {
  EMAIL_PORT,
  type EmailAttachment,
  type EmailPort,
  type SendEmailOptions,
} from './application/ports/email.port';
export { UnsubscribeTokenService } from './infrastructure/services/unsubscribe-token.service';
export {
  PlanLimitNotificationService,
  type LimitResourceType,
} from './infrastructure/services/plan-limit-notification.service';
export {
  generateWelcomeEmail,
  type WelcomeEmailData,
} from './infrastructure/templates/welcome.template';
export {
  generatePasswordResetEmail,
  type PasswordResetEmailData,
} from './infrastructure/templates/password-reset.template';
export {
  generatePlanUpgradeEmail,
  type PlanUpgradeEmailData,
} from './infrastructure/templates/plan-upgrade.template';
export {
  generatePlanLimitEmail,
  type PlanLimitEmailData,
  type LimitType,
} from './infrastructure/templates/plan-limit.template';
export {
  generateInactivityEmail,
  type InactivityEmailData,
} from './infrastructure/templates/inactivity.template';
export {
  generateNewUserNotificationEmail,
  type NewUserNotificationEmailData,
} from './infrastructure/templates/new-user-notification.template';
export {
  generatePlanDowngradeEmail,
  type PlanDowngradeEmailData,
} from './infrastructure/templates/plan-downgrade.template';
export {
  generateSubscriptionEndedEmail,
  type SubscriptionEndedEmailData,
} from './infrastructure/templates/subscription-ended.template';
export {
  generateAccountDeletedEmail,
  type AccountDeletedEmailData,
} from './infrastructure/templates/account-deleted.template';
export {
  generateSentimentReadyEmail,
  type SentimentReadyEmailData,
} from './infrastructure/templates/sentiment-ready.template';
export {
  generatePostScanEmail,
  type PostScanEmailData,
} from './infrastructure/templates/post-scan.template';
export {
  generateFirstAnalysisEmail,
  type FirstAnalysisEmailData,
} from './infrastructure/templates/first-analysis.template';
export {
  generateSupportRequestEmail,
  type SupportRequestEmailData,
} from './infrastructure/templates/support-request.template';
export {
  generateOnboardingCreateBrandEmail,
  type OnboardingCreateBrandEmailData,
} from './infrastructure/templates/onboarding-create-brand.template';
export {
  generateOnboardingFirstScanEmail,
  type OnboardingFirstScanEmailData,
} from './infrastructure/templates/onboarding-first-scan.template';
export {
  generateOnboardingCompetitorFomoEmail,
  type OnboardingCompetitorFomoEmailData,
} from './infrastructure/templates/onboarding-competitor-fomo.template';
export {
  generateOnboardingLastChanceEmail,
  type OnboardingLastChanceEmailData,
} from './infrastructure/templates/onboarding-last-chance.template';
export {
  generateWeeklyReportEmail,
  type WeeklyReportEmailData,
} from './infrastructure/templates/weekly-report.template';
export {
  generateDunningFirstEmail,
  type DunningFirstEmailData,
} from './infrastructure/templates/dunning-first.template';
export {
  generateDunningUrgentEmail,
  type DunningUrgentEmailData,
} from './infrastructure/templates/dunning-urgent.template';
export {
  generateDunningFinalEmail,
  type DunningFinalEmailData,
} from './infrastructure/templates/dunning-final.template';
export {
  generateUpgradeMultimodelEmail,
  type UpgradeMultimodelEmailData,
} from './infrastructure/templates/upgrade-multimodel.template';
export {
  generateUpgradeAutoscanEmail,
  type UpgradeAutoscanEmailData,
} from './infrastructure/templates/upgrade-autoscan.template';
export {
  generateUpgradeFinalEmail,
  type UpgradeFinalEmailData,
} from './infrastructure/templates/upgrade-final.template';
export {
  generateWinbackCheckinEmail,
  type WinbackCheckinEmailData,
} from './infrastructure/templates/winback-checkin.template';
export {
  generateWinbackValueEmail,
  type WinbackValueEmailData,
} from './infrastructure/templates/winback-value.template';
export {
  generateWinbackDiscountEmail,
  type WinbackDiscountEmailData,
} from './infrastructure/templates/winback-discount.template';
export {
  generateCancellationSurveyEmail,
  type CancellationSurveyEmailData,
} from './infrastructure/templates/cancellation-survey.template';
export {
  generatePostUpgradeWelcomeEmail,
  type PostUpgradeWelcomeEmailData,
} from './infrastructure/templates/post-upgrade-welcome.template';
export {
  generatePostUpgradeTipsEmail,
  type PostUpgradeTipsEmailData,
} from './infrastructure/templates/post-upgrade-tips.template';
export {
  generateMilestoneFirstCitationEmail,
  type MilestoneFirstCitationEmailData,
} from './infrastructure/templates/milestone-first-citation.template';
export {
  generateMilestoneScanCountEmail,
  type MilestoneScanCountEmailData,
} from './infrastructure/templates/milestone-scan-count.template';
export {
  generatePaidInactivityEmail,
  type PaidInactivityEmailData,
} from './infrastructure/templates/paid-inactivity.template';
export {
  generatePlanApproachingLimitEmail,
  type PlanApproachingLimitEmailData,
} from './infrastructure/templates/plan-approaching-limit.template';
export {
  generateNpsSurveyEmail,
  type NpsSurveyEmailData,
} from './infrastructure/templates/nps-survey.template';
export {
  generateFounderOutreachEmail,
  type FounderOutreachEmailData,
} from './infrastructure/templates/founder-outreach.template';
export {
  generateSoloToProNudgeEmail,
  type SoloToProNudgeEmailData,
} from './infrastructure/templates/solo-to-pro-nudge.template';
export {
  generateAuditSuccessEmail,
  type AuditSuccessEmailData,
} from './infrastructure/templates/audit-success.template';
export {
  generateAuditFailedEmail,
  type AuditFailedEmailData,
} from './infrastructure/templates/audit-failed.template';
export {
  generateAuditAdminAlertEmail,
  type AuditAdminAlertEmailData,
} from './infrastructure/templates/audit-admin-alert.template';
