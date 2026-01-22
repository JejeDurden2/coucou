import { IsEnum, IsUrl } from 'class-validator';
import { Plan, SubscriptionStatus } from '@prisma/client';

export class CreateCheckoutDto {
  @IsEnum(Plan)
  plan!: Plan;

  @IsUrl({ require_protocol: true, protocols: ['https', 'http'] })
  successUrl!: string;

  @IsUrl({ require_protocol: true, protocols: ['https', 'http'] })
  cancelUrl!: string;
}

export class CreatePortalDto {
  @IsUrl({ require_protocol: true, protocols: ['https', 'http'] })
  returnUrl!: string;
}

export interface CheckoutSessionResponse {
  url: string;
}

export interface PortalSessionResponse {
  url: string;
}

export interface SubscriptionResponse {
  plan: Plan;
  status: SubscriptionStatus | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export interface DowngradeSubscriptionResponse {
  success: boolean;
  effectiveDate: string;
  currentPlan: Plan;
  message: string;
}

export interface CancelDowngradeResponse {
  currentPlan: Plan;
  message: string;
}
