import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth';
import { BillingModule } from './modules/billing/billing.module';
import { DashboardModule } from './modules/dashboard';
import { EmailModule } from './modules/email';
import { NotificationModule } from './modules/notification';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { ProjectModule } from './modules/project';
import { PromptModule } from './modules/prompt';
import { ScanModule } from './modules/scan';
import { PrismaModule } from './prisma';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 3, // 3 requests per second
      },
      {
        name: 'medium',
        ttl: 10000, // 10 seconds
        limit: 20, // 20 requests per 10 seconds
      },
      {
        name: 'long',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
      {
        name: 'scan',
        ttl: 3600000, // 1 hour
        limit: 50, // 50 scan operations per hour (global fallback)
      },
    ]),
    PrismaModule,
    EmailModule,
    AuthModule,
    BillingModule,
    ProjectModule,
    PromptModule,
    ScanModule,
    DashboardModule,
    OnboardingModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
