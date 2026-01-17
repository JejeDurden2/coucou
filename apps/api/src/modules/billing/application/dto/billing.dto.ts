import { IsEnum, IsString } from 'class-validator';
import { Plan } from '@prisma/client';

export class CreateCheckoutDto {
  @IsEnum(Plan)
  plan!: Plan;

  @IsString()
  successUrl!: string;

  @IsString()
  cancelUrl!: string;
}

export class CreatePortalDto {
  @IsString()
  returnUrl!: string;
}

export interface CheckoutSessionResponse {
  url: string;
}

export interface PortalSessionResponse {
  url: string;
}
