import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth';
import { BillingModule } from './modules/billing/billing.module';
import { DashboardModule } from './modules/dashboard';
import { ProjectModule } from './modules/project';
import { PromptModule } from './modules/prompt';
import { ScanModule } from './modules/scan';
import { PrismaModule } from './prisma';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    BillingModule,
    ProjectModule,
    PromptModule,
    ScanModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
