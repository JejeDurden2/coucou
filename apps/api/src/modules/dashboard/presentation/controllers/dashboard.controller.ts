import { Controller, Get, HttpException, Param, UseGuards } from '@nestjs/common';

import type { AuthenticatedUser } from '../../../auth';
import { CurrentUser, JwtAuthGuard } from '../../../auth';
import {
  GetDashboardStatsUseCase,
  GenerateRecommendationsUseCase,
} from '../../application/use-cases';

@Controller('projects/:projectId/dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    private readonly getDashboardStatsUseCase: GetDashboardStatsUseCase,
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
}
