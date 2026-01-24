import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { QueueModule } from '../../infrastructure/queue/queue.module';
import { PrismaModule } from '../../prisma';
import { EmailModule } from '../email';
import { InactivityCheckService } from '../email/infrastructure/inactivity-check.service';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule, EmailModule, QueueModule],
  providers: [InactivityCheckService],
})
export class NotificationModule {}
