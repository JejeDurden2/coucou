import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { EmailModule } from '../email';
import { PrismaModule } from '../../prisma';
import { InactivityNotificationService } from './inactivity-notification.service';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule, EmailModule],
  providers: [InactivityNotificationService],
})
export class NotificationModule {}
