import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/presentation/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../auth/application/dto/auth.dto';
import { CreateCheckoutUseCase } from '../application/use-cases/create-checkout.use-case';
import { CreatePortalUseCase } from '../application/use-cases/create-portal.use-case';
import { HandleWebhookUseCase } from '../application/use-cases/handle-webhook.use-case';
import {
  CreateCheckoutDto,
  CreatePortalDto,
  type CheckoutSessionResponse,
  type PortalSessionResponse,
} from '../application/dto/billing.dto';

@Controller('billing')
export class BillingController {
  constructor(
    private readonly createCheckoutUseCase: CreateCheckoutUseCase,
    private readonly createPortalUseCase: CreatePortalUseCase,
    private readonly handleWebhookUseCase: HandleWebhookUseCase,
  ) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async createCheckout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCheckoutDto,
  ): Promise<CheckoutSessionResponse> {
    const result = await this.createCheckoutUseCase.execute({
      userId: user.id,
      plan: dto.plan,
      successUrl: dto.successUrl,
      cancelUrl: dto.cancelUrl,
    });

    if (!result.ok) {
      throw result.error;
    }

    return result.value;
  }

  @Post('portal')
  @UseGuards(JwtAuthGuard)
  async createPortal(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePortalDto,
  ): Promise<PortalSessionResponse> {
    const result = await this.createPortalUseCase.execute({
      userId: user.id,
      returnUrl: dto.returnUrl,
    });

    if (!result.ok) {
      throw result.error;
    }

    return result.value;
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ): Promise<{ received: boolean }> {
    const rawBody = req.rawBody?.toString() ?? '';
    await this.handleWebhookUseCase.execute(rawBody, signature);
    return { received: true };
  }
}
