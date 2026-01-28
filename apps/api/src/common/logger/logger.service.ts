import { Injectable, LoggerService as NestLoggerService, Scope } from '@nestjs/common';
import { pino, type Logger as PinoLogger, type TransportTargetOptions } from 'pino';
import { trace, context } from '@opentelemetry/api';

function buildTransport(): { targets: TransportTargetOptions[] } | undefined {
  const targets: TransportTargetOptions[] = [];

  if (process.env.NODE_ENV === 'development') {
    targets.push({ target: 'pino-pretty', options: { colorize: true }, level: 'debug' });
  }

  if (process.env.BETTERSTACK_SOURCE_TOKEN) {
    targets.push({
      target: '@logtail/pino',
      options: { sourceToken: process.env.BETTERSTACK_SOURCE_TOKEN },
      level: 'info',
    });
  }

  return targets.length > 0 ? { targets } : undefined;
}

const transport = buildTransport();

const pinoInstance: PinoLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  // formatters not allowed with multi-transport targets
  ...(transport
    ? {}
    : {
        formatters: {
          level: (label) => ({ level: label }),
        },
      }),
  mixin() {
    const span = trace.getSpan(context.active());
    if (span) {
      const { traceId, spanId } = span.spanContext();
      return { traceId, spanId };
    }
    return {};
  },
  transport,
});

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLoggerService {
  private ctx?: string;

  setContext(ctx: string): void {
    this.ctx = ctx;
  }

  /** @deprecated Use info() with structured data instead */
  log(message: string, ...optionalParams: unknown[]): void {
    const data = this.extractData(optionalParams);
    pinoInstance.info({ context: this.ctx, ...data }, message);
  }

  info(message: string, data?: Record<string, unknown>): void {
    pinoInstance.info({ context: this.ctx, ...data }, message);
  }

  error(
    message: string,
    errorOrData?: Error | Record<string, unknown>,
    data?: Record<string, unknown>,
  ): void {
    if (errorOrData instanceof Error) {
      pinoInstance.error(
        {
          context: this.ctx,
          err: { message: errorOrData.message, name: errorOrData.name },
          stack: errorOrData.stack,
          ...data,
        },
        message,
      );
    } else {
      pinoInstance.error({ context: this.ctx, ...errorOrData }, message);
    }
  }

  warn(message: string, data?: Record<string, unknown>): void {
    pinoInstance.warn({ context: this.ctx, ...data }, message);
  }

  debug(message: string, data?: Record<string, unknown>): void {
    pinoInstance.debug({ context: this.ctx, ...data }, message);
  }

  verbose(message: string, data?: Record<string, unknown>): void {
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
