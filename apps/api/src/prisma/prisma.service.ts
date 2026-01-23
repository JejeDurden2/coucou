import { Injectable, OnModuleDestroy, OnModuleInit, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import pg from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private pool: pg.Pool;

  constructor(@Optional() private readonly configService?: ConfigService) {
    // Support both ConfigService injection and direct env access (for scripts)
    const connectionString = configService?.get<string>('DATABASE_URL') ?? process.env.DATABASE_URL;
    const isProduction = (configService?.get('NODE_ENV') ?? process.env.NODE_ENV) === 'production';

    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    const pool = new pg.Pool({
      connectionString,
      ssl: isProduction ? { rejectUnauthorized: false } : undefined,
    });
    const adapter = new PrismaPg(pool);

    super({ adapter });

    this.pool = pool;
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    await this.pool.end();
  }
}
