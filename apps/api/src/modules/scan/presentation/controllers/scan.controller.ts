import { Controller, Get, Inject, Param, Post, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { unwrapOrThrow } from '../../../../common';
import type { AuthenticatedUser } from '../../../auth';
import { CurrentUser, JwtAuthGuard } from '../../../auth';
import {
  GetScanHistoryUseCase,
  QueueProjectScanUseCase,
  QUEUE_PROJECT_SCAN_USE_CASE,
  QueuePromptScanUseCase,
  QUEUE_PROMPT_SCAN_USE_CASE,
  GetScanJobStatusUseCase,
  GET_SCAN_JOB_STATUS_USE_CASE,
} from '../../application/use-cases';

@Controller()
@UseGuards(JwtAuthGuard)
export class ScanController {
  constructor(
    private readonly getScanHistoryUseCase: GetScanHistoryUseCase,
    @Inject(QUEUE_PROJECT_SCAN_USE_CASE)
    private readonly queueProjectScanUseCase: QueueProjectScanUseCase,
    @Inject(QUEUE_PROMPT_SCAN_USE_CASE)
    private readonly queuePromptScanUseCase: QueuePromptScanUseCase,
    @Inject(GET_SCAN_JOB_STATUS_USE_CASE)
    private readonly getScanJobStatusUseCase: GetScanJobStatusUseCase,
  ) {}

  @Post('prompts/:promptId/scan')
  @Throttle({ scan: { limit: 20, ttl: 3600000 } }) // 20 scans per hour per user
  async scanPrompt(@Param('promptId') promptId: string, @CurrentUser() user: AuthenticatedUser) {
    return unwrapOrThrow(
      await this.queuePromptScanUseCase.execute({ promptId, userId: user.id, plan: user.plan }),
    );
  }

  @Post('projects/:projectId/scans')
  @Throttle({ scan: { limit: 10, ttl: 3600000 } }) // 10 project scans per hour per user
  async scanProject(@Param('projectId') projectId: string, @CurrentUser() user: AuthenticatedUser) {
    return unwrapOrThrow(
      await this.queueProjectScanUseCase.execute({ projectId, userId: user.id, plan: user.plan }),
    );
  }

  @Get('projects/:projectId/scan-jobs/:jobId')
  async getScanJobStatus(
    @Param('projectId') projectId: string,
    @Param('jobId') jobId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return unwrapOrThrow(
      await this.getScanJobStatusUseCase.execute({ jobId, projectId, userId: user.id }),
    );
  }

  @Get('projects/:projectId/scans')
  async getScanHistory(
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    const safeLimit = Math.min(Math.max(1, parsedLimit || 50), 100);

    return unwrapOrThrow(await this.getScanHistoryUseCase.execute(projectId, user.id, safeLimit));
  }
}
