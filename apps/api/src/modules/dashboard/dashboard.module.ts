import { Module } from '@nestjs/common';

import { ProjectModule } from '../project';
import { PromptModule } from '../prompt';
import { ScanModule } from '../scan';
import { GetDashboardStatsUseCase } from './application/use-cases';
import { DashboardController } from './presentation/controllers/dashboard.controller';

@Module({
  imports: [ProjectModule, PromptModule, ScanModule],
  controllers: [DashboardController],
  providers: [GetDashboardStatsUseCase],
})
export class DashboardModule {}
