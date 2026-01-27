import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import type { AuthenticatedUser } from '../../../auth';
import { CurrentUser, JwtAuthGuard } from '../../../auth';
import { SendSupportRequestUseCase } from '../../application/use-cases/send-support-request.use-case';
import { SupportRequestDto } from '../dto/support-request.dto';

@Controller('support')
@UseGuards(JwtAuthGuard)
export class SupportController {
  constructor(private readonly sendSupportRequestUseCase: SendSupportRequestUseCase) {}

  @Post('contact')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  async contact(
    @Body() dto: SupportRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ success: boolean }> {
    const result = await this.sendSupportRequestUseCase.execute({
      userId: user.id,
      userEmail: user.email,
      plan: user.plan,
      category: dto.category,
      subject: dto.subject,
      message: dto.message,
      screenshot: dto.screenshot,
      projectId: dto.projectId,
    });

    if (!result.ok) {
      throw new HttpException(result.error.toJSON(), result.error.statusCode);
    }

    return result.value;
  }
}
