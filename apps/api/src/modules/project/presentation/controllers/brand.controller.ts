import { Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { Plan } from '@coucou-ia/shared';

import type { AuthenticatedUser } from '../../../auth';
import { CurrentUser, JwtAuthGuard } from '../../../auth';
import { OnboardingQueueService } from '../../../onboarding/infrastructure/queue/onboarding-queue.service';
import type {
  EnqueuedJobResponseDto,
  JobStatusResponseDto,
} from '../../../onboarding/presentation/dto/onboarding.dto';

@Controller('projects/:projectId/brand')
@UseGuards(JwtAuthGuard)
export class BrandController {
  constructor(private readonly onboardingQueueService: OnboardingQueueService) {}

  @Post('analyze')
  @HttpCode(HttpStatus.ACCEPTED)
  async analyzeBrand(
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<EnqueuedJobResponseDto> {
    const jobId = await this.onboardingQueueService.addJob({
      projectId,
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
