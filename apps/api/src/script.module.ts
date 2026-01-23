import { DynamicModule, Module, Type } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';

import { PrismaModule } from './prisma';

/**
 * Minimal module for running CLI scripts.
 *
 * Unlike AppModule, this module:
 * - Uses BullModule.forRoot() with direct process.env access (no async ConfigService)
 * - Only loads PrismaModule globally
 * - Accepts feature modules via forFeature() for script-specific dependencies
 *
 * Usage:
 * ```ts
 * const app = await NestFactory.createApplicationContext(
 *   ScriptModule.forFeature([SentimentScriptModule])
 * );
 * ```
 */
@Module({})
export class ScriptModule {
  static forFeature(modules: Type<unknown>[] = []): DynamicModule {
    return {
      module: ScriptModule,
      imports: [
        // ConfigModule first - synchronous, makes ConfigService available
        ConfigModule.forRoot({ isGlobal: true }),

        // PrismaModule - global database access
        PrismaModule,

        // BullModule with direct env access (avoids async ConfigService race condition)
        BullModule.forRoot({
          connection: {
            url: process.env.REDIS_URL || 'redis://localhost:6379',
          },
        }),

        // Feature modules specific to the script
        ...modules,
      ],
    };
  }
}
