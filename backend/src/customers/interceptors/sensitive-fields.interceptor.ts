import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import logger from '../../config/logger';

const SENSITIVE_FIELDS = ['national_id', 'internal_notes'];

function stripSensitive(obj: Record<string, unknown>): Record<string, unknown> {
  const copy = { ...obj };
  for (const field of SENSITIVE_FIELDS) {
    delete copy[field];
  }
  return copy;
}

@Injectable()
export class SensitiveFieldsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const isInternal = request.headers['x-internal'] === 'true';

    if (isInternal) {
      logger.debug(
        `[SensitiveFieldsInterceptor] Internal mode — passing all fields for ${request.path}`,
      );
      return next.handle();
    }

    logger.debug(
      `[SensitiveFieldsInterceptor] Stripping sensitive fields for ${request.path}`,
    );

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
