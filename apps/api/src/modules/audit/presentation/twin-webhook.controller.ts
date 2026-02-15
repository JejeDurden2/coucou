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
import { twinCrawlResultLenientSchema } from '@coucou-ia/shared';

import { LoggerService } from '../../../common/logger';
import { AuditQueueService } from '../infrastructure/queue/audit-queue.service';
import type { HandleCrawlCompleteJobData } from '../infrastructure/queue/audit-queue.service';

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

  @Post('crawl-complete')
  @HttpCode(HttpStatus.OK)
  @SkipThrottle()
  async handleCrawlComplete(
    @Headers('authorization') authHeader: string | undefined,
    @Body() body: unknown,
  ): Promise<{ received: true }> {
    // 1. Verify Bearer token
    if (!this.callbackSecret || !this.verifyToken(authHeader)) {
      this.logger.warn('Twin crawl-complete webhook rejected: invalid authorization');
      throw new UnauthorizedException('Invalid authorization');
    }

    // 2. Validate payload shape (lenient — observations validated in use case)
    const parsed = twinCrawlResultLenientSchema.safeParse(body);
    if (!parsed.success) {
      this.logger.warn('Twin crawl-complete webhook rejected: invalid payload', {
        errors: parsed.error.issues.map((i) => `${String(i.path.join('.'))}: ${i.message}`),
      });
      throw new BadRequestException('Invalid payload');
    }

    const { auditId, status } = parsed.data;

    // 3. Enqueue async processing
    await this.auditQueueService.addHandleCrawlCompleteJob({
      auditId,
      status,
      observations: parsed.data.observations,
      error: parsed.data.error,
      meta: parsed.data.meta as HandleCrawlCompleteJobData['meta'],
    });

    this.logger.info('Twin crawl-complete webhook accepted', { auditId, status });

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
