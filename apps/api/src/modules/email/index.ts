export { EmailModule } from './email.module';
export { EMAIL_PORT, type EmailPort, type SendEmailOptions } from './application/ports/email.port';
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
