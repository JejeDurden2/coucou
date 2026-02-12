import {
  Controller,
  Post,
  Headers,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SkipThrottle } from '@nestjs/throttler';
import { twinWebhookPayloadLenientSchema } from '@coucou-ia/shared';

import { LoggerService } from '../../../common/logger';
import { AuditQueueService } from '../infrastructure/queue/audit-queue.service';

@Controller('webhooks/twin')
export class TwinWebhookController {
  private readonly callbackSecret: string;

  constructor(
    private readonly auditQueueService: AuditQueueService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(TwinWebhookController.name);
    this.callbackSecret = this.configService.get<string>('TWIN_CALLBACK_SECRET', '');
  }

  @Post('audit')
  @HttpCode(HttpStatus.OK)
  @SkipThrottle()
  async handleTwinWebhook(
    @Headers('authorization') authHeader: string | undefined,
    @Body() body: unknown,
  ): Promise<{ received: true }> {
    // 1. Verify Bearer token
    if (!this.callbackSecret || !this.verifyToken(authHeader)) {
      this.logger.warn('Twin webhook rejected: invalid authorization');
      throw new UnauthorizedException('Invalid authorization');
    }

    // 2. Validate payload shape (lenient — result validated strictly in use case)
    const parsed = twinWebhookPayloadLenientSchema.safeParse(body);
    if (!parsed.success) {
      this.logger.warn('Twin webhook rejected: invalid payload', {
        errors: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      });
      throw new BadRequestException('Invalid payload');
    }

    const { auditId, status } = parsed.data;

    // 3. Enqueue async processing (result passed as unknown for strict validation in use case)
    await this.auditQueueService.addCompleteJob({
      auditId,
      status,
      error: parsed.data.error,
      result: parsed.data.result,
    });

    this.logger.info('Twin webhook accepted', { auditId, status });

    // 4. Return immediately
    return { received: true };
  }

  private verifyToken(authHeader: string | undefined): boolean {
    if (!authHeader) return false;

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return false;

    return parts[1] === this.callbackSecret;
  }
}
