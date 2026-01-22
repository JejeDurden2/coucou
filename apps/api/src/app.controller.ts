import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';
import { EmailQueueService, type QueueHealthStatus } from './infrastructure/queue';

interface HealthCheckResponse {
  status: 'ok' | 'degraded';
  timestamp: string;
  services: {
    redis: QueueHealthStatus;
  };
}

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly emailQueueService: EmailQueueService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async getHealth(): Promise<HealthCheckResponse> {
    const redis = await this.emailQueueService.getHealth();

    return {
      status: redis.status === 'healthy' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services: { redis },
    };
  }
}
