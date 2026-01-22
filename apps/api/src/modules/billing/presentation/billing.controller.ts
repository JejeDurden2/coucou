import {
  Body,
  Controller,
  Get,
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
import { DowngradeSubscriptionUseCase } from '../application/use-cases/downgrade-subscription.use-case';
import { GetSubscriptionUseCase } from '../application/use-cases/get-subscription.use-case';
import { CancelDowngradeUseCase } from '../application/use-cases/cancel-downgrade.use-case';
import {
  CreateCheckoutDto,
  CreatePortalDto,
  type CheckoutSessionResponse,
  type PortalSessionResponse,
  type SubscriptionResponse,
  type DowngradeSubscriptionResponse,
  type CancelDowngradeResponse,
} from '../application/dto/billing.dto';

@Controller('billing')
export class BillingController {
  constructor(
    private readonly createCheckoutUseCase: CreateCheckoutUseCase,
    private readonly createPortalUseCase: CreatePortalUseCase,
    private readonly handleWebhookUseCase: HandleWebhookUseCase,
    private readonly downgradeSubscriptionUseCase: DowngradeSubscriptionUseCase,
    private readonly getSubscriptionUseCase: GetSubscriptionUseCase,
    private readonly cancelDowngradeUseCase: CancelDowngradeUseCase,
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

  @Get('subscription')
  @UseGuards(JwtAuthGuard)
  async getSubscription(@CurrentUser() user: AuthenticatedUser): Promise<SubscriptionResponse> {
    const result = await this.getSubscriptionUseCase.execute({
      userId: user.id,
    });

    if (!result.ok) {
      throw result.error;
    }

    return result.value;
  }

  @Post('downgrade')
  @UseGuards(JwtAuthGuard)
  async downgradeSubscription(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DowngradeSubscriptionResponse> {
    const result = await this.downgradeSubscriptionUseCase.execute({
      userId: user.id,
    });

    if (!result.ok) {
      throw result.error;
    }

    return result.value;
  }

  @Post('cancel-downgrade')
  @UseGuards(JwtAuthGuard)
  async cancelDowngrade(@CurrentUser() user: AuthenticatedUser): Promise<CancelDowngradeResponse> {
    const result = await this.cancelDowngradeUseCase.execute({
      userId: user.id,
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
