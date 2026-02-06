import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { SensitiveFieldsInterceptor } from './sensitive-fields.interceptor';

function createMockContext(headers: Record<string, string>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        headers,
        path: '/customers',
      }),
    }),
  } as unknown as ExecutionContext;
}

function createMockCallHandler(data: unknown): CallHandler {
  return { handle: () => of(data) };
}

describe('SensitiveFieldsInterceptor', () => {
  let interceptor: SensitiveFieldsInterceptor;

  beforeEach(() => {
    interceptor = new SensitiveFieldsInterceptor();
  });

  it('should strip sensitive fields from single object without x-internal', (done) => {
    const context = createMockContext({});
    const handler = createMockCallHandler({
      id: '1',
      full_name: 'John',
      email: 'john@test.com',
      national_id: '123',
      internal_notes: 'VIP',
    });

    interceptor.intercept(context, handler).subscribe((result) => {
      expect(result).toEqual({
        id: '1',
        full_name: 'John',
        email: 'john@test.com',
      });
      done();
    });
  });

  it('should strip sensitive fields from paginated response without x-internal', (done) => {
    const context = createMockContext({});
    const handler = createMockCallHandler({
      data: [
        { id: '1', full_name: 'John', national_id: '123', internal_notes: 'A' },
        { id: '2', full_name: 'Jane', national_id: '456', internal_notes: 'B' },
      ],
      meta: { total: 2, page: 1, limit: 20, totalPages: 1 },
    });

    interceptor.intercept(context, handler).subscribe((result) => {
      const res = result as Record<string, unknown>;
      expect(res.data).toEqual([
        { id: '1', full_name: 'John' },
        { id: '2', full_name: 'Jane' },
      ]);
      expect(res.meta).toEqual({ total: 2, page: 1, limit: 20, totalPages: 1 });
      done();
    });
  });

  it('should preserve all fields with x-internal: true', (done) => {
    const context = createMockContext({ 'x-internal': 'true' });
    const handler = createMockCallHandler({
      id: '1',
      full_name: 'John',
      national_id: '123',
      internal_notes: 'VIP',
    });

    interceptor.intercept(context, handler).subscribe((result) => {
      expect(result).toEqual({
        id: '1',
        full_name: 'John',
        national_id: '123',
        internal_notes: 'VIP',
      });
      done();
    });
  });

  it('should pass through response with no sensitive fields unchanged', (done) => {
    const context = createMockContext({});
    const handler = createMockCallHandler({
      id: '1',
      full_name: 'John',
      email: 'john@test.com',
    });

    interceptor.intercept(context, handler).subscribe((result) => {
      expect(result).toEqual({
        id: '1',
        full_name: 'John',
        email: 'john@test.com',
      });
      done();
    });
  });
});
