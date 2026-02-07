import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { stripSensitive } from '../utils/strip-sensitive';
import { isInternalRequest } from '../utils/is-internal-request';

@Injectable()
export class SensitiveFieldsInterceptor implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const isInternal = isInternalRequest(
      request.headers['x-internal'] as string | undefined,
    );

    if (isInternal) {
      this.logger.debug?.(
        `[SensitiveFieldsInterceptor] Internal mode — passing all fields for ${request.path}`,
      );
      return next.handle();
    }

    this.logger.debug?.(
      `[SensitiveFieldsInterceptor] Stripping sensitive fields for ${request.path}`,
    );

    // Last line of defense — strip sensitive fields from HTTP responses for public requests
    return next.handle().pipe(
      map((data: unknown) => {
        if (!data || typeof data !== 'object') return data;

        const record = data as Record<string, unknown>;

        // Paginated response with data array
        if (Array.isArray(record.data)) {
          return {
            ...record,
            data: record.data.map((item: Record<string, unknown>) =>
              stripSensitive(item),
            ),
          };
        }

        // Single object response
        return stripSensitive(record);
      }),
    );
  }
}
