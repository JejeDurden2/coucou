import { config } from 'dotenv';
import { INestApplicationContext, Type } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { LoggerService } from './logger';
import { ScriptModule } from '../script.module';

// Load .env file before NestJS starts
config();

const logger = new LoggerService();
logger.setContext('ScriptBootstrap');

/**
 * Bootstrap a NestJS script with minimal module loading.
 *
 * This function creates an application context with only the necessary
 * modules for the script, avoiding the full AppModule which loads
 * all domain modules, guards, throttlers, etc.
 *
 * @param modules - Feature modules to load (e.g., SentimentScriptModule)
 * @param callback - Async function to execute with the app context
 * @returns The result of the callback function
 *
 * @example
 * ```ts
 * await bootstrapScript([SentimentScriptModule], async (app) => {
 *   const queue = app.get(SentimentQueueService);
 *   await queue.addJob({ projectId: '123', userId: '456' });
 * });
 * ```
 */
export async function bootstrapScript<T>(
  modules: Type<unknown>[],
  callback: (app: INestApplicationContext) => Promise<T>,
): Promise<T> {
  let app: INestApplicationContext | undefined;

  try {
    app = await NestFactory.createApplicationContext(ScriptModule.forFeature(modules), {
      logger: ['error', 'warn', 'log'],
    });

    return await callback(app);
  } catch (error) {
    logger.error('Script execution failed', error instanceof Error ? error : undefined);
    throw error;
  } finally {
    if (app) {
      await app.close();
    }
  }
}
