import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Plan } from '@coucou-ia/shared';

import type { AuthenticatedUser } from '../../../auth';
import { CurrentUser, JwtAuthGuard } from '../../../auth';
import { OnboardingQueueService } from '../../infrastructure/queue/onboarding-queue.service';
import type { EnqueuedJobResponseDto, JobStatusResponseDto } from '../dto/onboarding.dto';
import { GeneratePromptsRequestDto } from '../dto/onboarding.dto';

@Controller('onboarding')
@UseGuards(JwtAuthGuard)
export class OnboardingController {
  constructor(private readonly onboardingQueueService: OnboardingQueueService) {}

  @Post('generate-prompts')
  @HttpCode(HttpStatus.ACCEPTED)
  async generatePrompts(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: GeneratePromptsRequestDto,
  ): Promise<EnqueuedJobResponseDto> {
    const jobId = await this.onboardingQueueService.addJob({
      projectId: dto.projectId,
      userId: user.id,
      plan: user.plan as Plan,
    });

    return { jobId };
  }

  @Get('job/:jobId/status')
  async getJobStatus(@Param('jobId') jobId: string): Promise<JobStatusResponseDto> {
    return this.onboardingQueueService.getJobStatus(jobId);
  }
}
