import { DynamicModule, Module, Type } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { PrismaModule } from './prisma';

/**
 * Minimal module for running CLI scripts.
 *
 * Unlike AppModule, this module:
 * - Does NOT use ConfigModule (feature modules provide their own ConfigService)
 * - Uses BullModule.forRoot() with direct process.env access
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
        // PrismaModule - global database access
        PrismaModule,

        // BullModule with direct env access
        // Use REDIS_PUBLIC_URL for scripts running outside Railway (railway run from local)
        // Fall back to REDIS_URL for internal Railway services
        BullModule.forRoot({
          connection: {
            url: process.env.REDIS_PUBLIC_URL || process.env.REDIS_URL || 'redis://localhost:6379',
          },
        }),

        // Feature modules specific to the script
        ...modules,
      ],
    };
  }
}
