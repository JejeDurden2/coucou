import { Controller, Get, HttpException, Param, UseGuards } from '@nestjs/common';

import type { AuthenticatedUser } from '../../../auth';
import { CurrentUser, JwtAuthGuard } from '../../../auth';
import { GetLatestSentimentUseCase } from '../../application/use-cases/get-latest-sentiment.use-case';
import { GetSentimentHistoryUseCase } from '../../application/use-cases/get-sentiment-history.use-case';

@Controller('projects/:projectId/sentiment')
@UseGuards(JwtAuthGuard)
export class SentimentController {
  constructor(
    private readonly getLatestSentimentUseCase: GetLatestSentimentUseCase,
    private readonly getSentimentHistoryUseCase: GetSentimentHistoryUseCase,
  ) {}

  @Get('latest')
  async getLatest(@Param('projectId') projectId: string, @CurrentUser() user: AuthenticatedUser) {
    const result = await this.getLatestSentimentUseCase.execute(projectId, user.id, user.plan);

    if (!result.ok) {
      throw new HttpException(result.error.toJSON(), result.error.statusCode);
    }

    return result.value;
  }

  @Get('history')
  async getHistory(@Param('projectId') projectId: string, @CurrentUser() user: AuthenticatedUser) {
    const result = await this.getSentimentHistoryUseCase.execute(projectId, user.id, user.plan);

    if (!result.ok) {
      throw new HttpException(result.error.toJSON(), result.error.statusCode);
    }

    return result.value;
  }
}
