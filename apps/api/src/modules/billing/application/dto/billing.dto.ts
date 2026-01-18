import { IsEnum, IsUrl } from 'class-validator';
import { Plan } from '@prisma/client';

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
