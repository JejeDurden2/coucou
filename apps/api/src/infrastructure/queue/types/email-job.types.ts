import type {
  WelcomeEmailData,
  PasswordResetEmailData,
  PlanUpgradeEmailData,
  PlanLimitEmailData,
  InactivityEmailData,
  NewUserNotificationEmailData,
  PlanDowngradeEmailData,
  SubscriptionEndedEmailData,
  AccountDeletedEmailData,
} from '../../../modules/email';

export type EmailJobType =
  | 'welcome'
  | 'password-reset'
  | 'plan-upgrade'
  | 'plan-limit'
  | 'inactivity'
  | 'new-user-notification'
  | 'plan-downgrade'
  | 'subscription-ended'
  | 'account-deleted';

export type EmailJobData =
  | { type: 'welcome'; to: string; data: WelcomeEmailData }
  | { type: 'password-reset'; to: string; data: PasswordResetEmailData }
  | { type: 'plan-upgrade'; to: string; data: PlanUpgradeEmailData }
  | { type: 'plan-limit'; to: string; data: PlanLimitEmailData }
  | { type: 'inactivity'; to: string; data: InactivityEmailData }
  | { type: 'new-user-notification'; to: string; data: NewUserNotificationEmailData }
  | { type: 'plan-downgrade'; to: string; data: PlanDowngradeEmailData }
  | { type: 'subscription-ended'; to: string; data: SubscriptionEndedEmailData }
  | { type: 'account-deleted'; to: string; data: AccountDeletedEmailData };

export interface EmailJobResult {
  success: boolean;
  messageId?: string;
  error?: string;
}
