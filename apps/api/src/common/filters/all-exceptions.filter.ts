import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { DomainError } from '../errors/domain-error';

interface ErrorResponse {
  code: string;
  message: string;
  details?: unknown;
  timestamp: string;
  path: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = 500;
    let body: Omit<ErrorResponse, 'timestamp' | 'path'> = {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    };

    if (exception instanceof DomainError) {
      status = exception.statusCode;
      body = exception.toJSON() as typeof body;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, unknown>;
        body = {
          code: (resObj['code'] as string) ?? 'HTTP_ERROR',
          message: (resObj['message'] as string) ?? exception.message,
        };
        if (resObj['details']) {
          body.details = resObj['details'];
        }
      } else {
        body = { code: 'HTTP_ERROR', message: String(res) };
      }
    } else if (exception instanceof Error) {
      this.logger.error('Unhandled exception', exception.stack, {
        path: request.url,
        method: request.method,
      });
    }

    const errorResponse: ErrorResponse = {
      ...body,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}
