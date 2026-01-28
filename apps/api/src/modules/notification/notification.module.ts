import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { QueueModule } from '../../infrastructure/queue/queue.module';
import { PrismaModule } from '../../prisma';
import { EmailModule } from '../email';
import { InactivityCheckService } from '../email/infrastructure/inactivity-check.service';
import { OnboardingEmailService } from '../email/infrastructure/services/onboarding-email.service';
import { UpgradeCampaignService } from '../email/infrastructure/services/upgrade-campaign.service';
import { WeeklyReportService } from '../email/infrastructure/services/weekly-report.service';
import { WinbackEmailService } from '../email/infrastructure/services/winback-email.service';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule, EmailModule, QueueModule],
  providers: [
    InactivityCheckService,
    OnboardingEmailService,
    UpgradeCampaignService,
    WeeklyReportService,
    WinbackEmailService,
  ],
})
export class NotificationModule {}
