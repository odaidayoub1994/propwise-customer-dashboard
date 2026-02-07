import { ArgumentsHost, HttpException, LoggerService } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { AllExceptionsFilter } from './all-exceptions.filter';

const mockJson = jest.fn();
const mockStatus = jest.fn().mockReturnValue({ json: mockJson });

const mockLogger: LoggerService = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

function createMockHost(method = 'GET', url = '/customers'): ArgumentsHost {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ method, url }),
      getResponse: () => ({ status: mockStatus }),
    }),
    getArgs: () => [],
    getArgByIndex: () => undefined,
    switchToRpc: () => ({
      getData: () => undefined,
      getContext: () => undefined,
    }),
    switchToWs: () => ({
      getData: () => undefined,
      getClient: () => undefined,
      getPattern: () => '',
    }),
    getType: () => 'http',
  } as unknown as ArgumentsHost;
}

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;

  beforeEach(() => {
    jest.clearAllMocks();
    filter = new AllExceptionsFilter(mockLogger);
  });

  it('should handle HttpException with correct status and message', () => {
    const exception = new HttpException('Not Found', 404);
    const host = createMockHost();

    filter.catch(exception, host);

    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        message: 'Not Found',
        error: 'HttpException',
        path: '/customers',
      }),
    );
    const firstCall = mockJson.mock.calls[0] as unknown[];
    expect(firstCall[0]).toHaveProperty('timestamp');
  });

  it('should handle HttpException with object response', () => {
    const exception = new HttpException(
      { message: 'Validation failed', statusCode: 400 },
      400,
    );
    const host = createMockHost('POST', '/customers');

    filter.catch(exception, host);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'Validation failed',
      }),
    );
  });

  it('should handle QueryFailedError with code 23505 and extract field name', () => {
    const exception = new QueryFailedError(
      'INSERT INTO customer ...',
      [],
      new Error('duplicate key'),
    );
    Object.assign(exception, {
      driverError: {
        code: '23505',
        detail: 'Key (email)=(john@test.com) already exists.',
      },
    });
    const host = createMockHost('POST', '/customers');

    filter.catch(exception, host);

    expect(mockStatus).toHaveBeenCalledWith(409);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 409,
        message: 'Duplicate value for email',
        error: 'Conflict',
        path: '/customers',
      }),
    );
  });

  it('should use "field" as fallback when detail does not match pattern', () => {
    const exception = new QueryFailedError(
      'INSERT INTO customer ...',
      [],
      new Error('duplicate key'),
    );
    Object.assign(exception, {
      driverError: {
        code: '23505',
        detail: 'some unusual format',
      },
    });
    const host = createMockHost();

    filter.catch(exception, host);

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Duplicate value for field',
      }),
    );
  });

  it('should handle unknown errors with 500', () => {
    const exception = new Error('Something broke');
    const host = createMockHost();

    filter.catch(exception, host);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Internal server error',
        error: 'Internal Server Error',
        path: '/customers',
      }),
    );
  });

  it('should handle non-Error exceptions with 500', () => {
    const host = createMockHost();

    filter.catch('string error', host);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Internal server error',
      }),
    );
  });

  it('should include timestamp in all responses', () => {
    const exception = new HttpException('Test', 400);
    const host = createMockHost();

    filter.catch(exception, host);

    const firstCall = mockJson.mock.calls[0] as unknown[];
    const response = firstCall[0] as Record<string, unknown>;
    expect(response.timestamp).toBeDefined();
    expect(() => new Date(response.timestamp as string)).not.toThrow();
  });
});
