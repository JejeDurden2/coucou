import { Controller, Get, HttpException, Param, Post, Query, UseGuards } from '@nestjs/common';

import type { AuthenticatedUser } from '../../../auth';
import { CurrentUser, JwtAuthGuard } from '../../../auth';
import {
  ExecuteProjectScanUseCase,
  ExecuteScanUseCase,
  GetScanHistoryUseCase,
} from '../../application/use-cases';

@Controller()
@UseGuards(JwtAuthGuard)
export class ScanController {
  constructor(
    private readonly executeScanUseCase: ExecuteScanUseCase,
    private readonly executeProjectScanUseCase: ExecuteProjectScanUseCase,
    private readonly getScanHistoryUseCase: GetScanHistoryUseCase,
  ) {}

  @Post('prompts/:promptId/scan')
  async scanPrompt(@Param('promptId') promptId: string, @CurrentUser() user: AuthenticatedUser) {
    const result = await this.executeScanUseCase.execute(promptId, user.id);

    if (!result.ok) {
      throw new HttpException(result.error.toJSON(), result.error.statusCode);
    }

    return result.value;
  }

  @Post('projects/:projectId/scans')
  async scanProject(@Param('projectId') projectId: string, @CurrentUser() user: AuthenticatedUser) {
    const result = await this.executeProjectScanUseCase.execute(projectId, user.id);

    if (!result.ok) {
      throw new HttpException(result.error.toJSON(), result.error.statusCode);
    }

    return result.value;
  }

  @Get('projects/:projectId/scans')
  async getScanHistory(
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query('limit') limit?: string,
  ) {
    // Validate and cap limit to prevent DoS
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    const safeLimit = Math.min(Math.max(1, parsedLimit || 50), 100);

    const result = await this.getScanHistoryUseCase.execute(projectId, user.id, safeLimit);

    if (!result.ok) {
      throw new HttpException(result.error.toJSON(), result.error.statusCode);
    }

    return result.value;
  }
}
