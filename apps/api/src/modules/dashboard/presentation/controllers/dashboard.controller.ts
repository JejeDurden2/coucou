import { Controller, Get, HttpException, Param, Query, UseGuards } from '@nestjs/common';

import type { AuthenticatedUser } from '../../../auth';
import { CurrentUser, JwtAuthGuard } from '../../../auth';
import {
  GetDashboardStatsUseCase,
  GetHistoricalStatsUseCase,
  GenerateRecommendationsUseCase,
} from '../../application/use-cases';

@Controller('projects/:projectId/dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    private readonly getDashboardStatsUseCase: GetDashboardStatsUseCase,
    private readonly getHistoricalStatsUseCase: GetHistoricalStatsUseCase,
    private readonly generateRecommendationsUseCase: GenerateRecommendationsUseCase,
  ) {}

  @Get()
  async getStats(@Param('projectId') projectId: string, @CurrentUser() user: AuthenticatedUser) {
    const result = await this.getDashboardStatsUseCase.execute(projectId, user.id);

    if (!result.ok) {
      throw new HttpException(result.error.toJSON(), result.error.statusCode);
    }

    return result.value;
  }

  @Get('recommendations')
  async getRecommendations(
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.generateRecommendationsUseCase.execute(projectId, user.id);

    if (!result.ok) {
      throw new HttpException(result.error.toJSON(), result.error.statusCode);
    }

    return result.value;
  }

  @Get('historical')
  async getHistoricalStats(
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query('startDate') startDateStr?: string,
    @Query('endDate') endDateStr?: string,
  ) {
    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;

    const result = await this.getHistoricalStatsUseCase.execute(
      projectId,
      user.id,
      user.plan,
      startDate,
      endDate,
    );

    if (!result.ok) {
      throw new HttpException(result.error.toJSON(), result.error.statusCode);
    }

    return result.value;
  }
}
