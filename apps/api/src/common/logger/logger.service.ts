import { Injectable, LoggerService as NestLoggerService, Scope } from '@nestjs/common';
import { pino, type Logger as PinoLogger } from 'pino';
import { trace, context } from '@opentelemetry/api';

const pinoInstance: PinoLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  mixin() {
    const span = trace.getSpan(context.active());
    if (span) {
      const { traceId, spanId } = span.spanContext();
      return { traceId, spanId };
    }
    return {};
  },
  transport:
    process.env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
});

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLoggerService {
  private ctx?: string;

  setContext(ctx: string): void {
    this.ctx = ctx;
  }

  log(message: string, ...optionalParams: unknown[]): void {
    const data = this.extractData(optionalParams);
    pinoInstance.info({ context: this.ctx, ...data }, message);
  }

  info(message: string, data?: Record<string, unknown>): void {
    pinoInstance.info({ context: this.ctx, ...data }, message);
  }

  error(message: string, ...optionalParams: unknown[]): void {
    const first = optionalParams[0];
    if (first instanceof Error) {
      pinoInstance.error(
        {
          context: this.ctx,
          err: first,
          stack: first.stack,
        },
        message,
      );
    } else if (typeof first === 'string') {
      pinoInstance.error({ context: this.ctx, stack: first }, message);
    } else {
      pinoInstance.error({ context: this.ctx }, message);
    }
  }

  warn(message: string, ...optionalParams: unknown[]): void {
    const data = this.extractData(optionalParams);
    pinoInstance.warn({ context: this.ctx, ...data }, message);
  }

  debug(message: string, ...optionalParams: unknown[]): void {
    const data = this.extractData(optionalParams);
    pinoInstance.debug({ context: this.ctx, ...data }, message);
  }

  verbose(message: string, ...optionalParams: unknown[]): void {
    const data = this.extractData(optionalParams);
    pinoInstance.trace({ context: this.ctx, ...data }, message);
  }

  private extractData(params: unknown[]): Record<string, unknown> {
    if (params.length === 0) return {};
    const last = params[params.length - 1];
    if (typeof last === 'string') {
      return { context: last };
    }
    if (typeof last === 'object' && last !== null) {
      return last as Record<string, unknown>;
    }
    return {};
  }
}
