import {
  Controller,
  Get,
  HttpException,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';

import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/presentation/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../auth/application/dto/auth.dto';
import { CreateAuditCheckoutUseCase } from '../application/use-cases/create-audit-checkout.use-case';
import { GetLatestAuditUseCase } from '../application/use-cases/get-latest-audit.use-case';
import { GetAuditHistoryUseCase } from '../application/use-cases/get-audit-history.use-case';
import { GetAuditPdfUseCase } from '../application/use-cases/get-audit-pdf.use-case';
import { GetReportUrlUseCase } from '../application/use-cases/get-report-url.use-case';

@Controller('projects/:projectId/audit')
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(
    private readonly createAuditCheckoutUseCase: CreateAuditCheckoutUseCase,
    private readonly getLatestAuditUseCase: GetLatestAuditUseCase,
    private readonly getAuditHistoryUseCase: GetAuditHistoryUseCase,
    private readonly getAuditPdfUseCase: GetAuditPdfUseCase,
    private readonly getReportUrlUseCase: GetReportUrlUseCase,
  ) {}

  @Get()
  async getLatest(
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.getLatestAuditUseCase.execute(
      projectId,
      user.id,
    );

    if (!result.ok) {
      throw new HttpException(result.error.toJSON(), result.error.statusCode);
    }

    return result.value;
  }

  @Get('history')
  async getHistory(
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.getAuditHistoryUseCase.execute(
      projectId,
      user.id,
    );

    if (!result.ok) {
      throw new HttpException(result.error.toJSON(), result.error.statusCode);
    }

    return result.value;
  }

  @Get(':auditId/pdf')
  async getPdf(
    @Param('projectId') projectId: string,
    @Param('auditId') auditId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Res() res: Response,
  ) {
    const result = await this.getAuditPdfUseCase.execute(
      projectId,
      auditId,
      user.id,
    );

    if (!result.ok) {
      throw new HttpException(result.error.toJSON(), result.error.statusCode);
    }

    res.redirect(302, result.value.redirectUrl);
  }

  @Get(':auditId/report-url')
  @Throttle({ short: { limit: 10, ttl: 60000 } })
  async getReportUrl(
    @Param('auditId') auditId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ url: string; expiresInSeconds: number }> {
    const result = await this.getReportUrlUseCase.execute({
      auditOrderId: auditId,
      userId: user.id,
    });

    if (!result.ok) {
      throw new HttpException(result.error.toJSON(), result.error.statusCode);
    }

    return result.value;
  }

  @Post('checkout')
  @Throttle({ short: { limit: 3, ttl: 60000 } })
  async createCheckout(
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ checkoutUrl: string }> {
    const result = await this.createAuditCheckoutUseCase.execute({
      projectId,
      userId: user.id,
      userEmail: user.email,
    });

    if (!result.ok) {
      throw result.error;
    }

    return result.value;
  }
}
