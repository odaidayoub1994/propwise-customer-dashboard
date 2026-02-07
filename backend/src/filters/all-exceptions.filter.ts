import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const path = request.url;

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as Record<string, unknown>).message ||
            exception.message;

      this.logger.warn(
        `[AllExceptionsFilter] HTTP ${status}: ${JSON.stringify(message)} — ${request.method} ${path}`,
      );

      response.status(status).json({
        statusCode: status,
        message,
        error: exception.name,
        timestamp: new Date().toISOString(),
        path,
      });
      return;
    }

    if (exception instanceof QueryFailedError) {
      const driverError = exception.driverError as Record<string, unknown>;

      if (driverError?.code === '23505') {
        const detail = (driverError.detail as string) || '';
        const match = detail.match(/Key \((\w+)\)/);
        const field = match ? match[1] : 'field';

        this.logger.error(
          `[AllExceptionsFilter] DB constraint violation: ${exception.message}`,
        );

        response.status(409).json({
          statusCode: 409,
          message: `Duplicate value for ${field}`,
          error: 'Conflict',
          timestamp: new Date().toISOString(),
          path,
        });
        return;
      }
    }

    const error =
      exception instanceof Error ? exception : new Error(String(exception));

    this.logger.error(
      `[AllExceptionsFilter] Unhandled error: ${error.message} — ${request.method} ${path}`,
    );

    response.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      error: 'Internal Server Error',
      timestamp: new Date().toISOString(),
      path,
    });
  }
}
