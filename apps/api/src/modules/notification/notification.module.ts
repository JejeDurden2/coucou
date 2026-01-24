import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { EmailModule } from '../email';
import { PrismaModule } from '../../prisma';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule, EmailModule],
  providers: [],
})
export class NotificationModule {}
