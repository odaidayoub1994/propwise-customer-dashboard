jest.mock('../config/env.config', () => ({
  REDIS_HOST: 'localhost',
  REDIS_PORT: 6379,
  CACHE_TTL: 60,
}));

import { Test, TestingModule } from '@nestjs/testing';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { CacheService } from './cache.service';
import { REDIS_CLIENT } from '../redis/redis.module';

const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  incr: jest.fn(),
};

const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

describe('CacheService', () => {
  let service: CacheService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        { provide: REDIS_CLIENT, useValue: mockRedis },
        { provide: WINSTON_MODULE_NEST_PROVIDER, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    it('should return parsed JSON on cache hit', async () => {
      const data = { id: '1', name: 'Test' };
      mockRedis.get.mockResolvedValue(JSON.stringify(data));

      const result = await service.get('test-key');

      expect(result).toEqual(data);
      expect(mockRedis.get).toHaveBeenCalledWith('test-key');
      expect(mockLogger.debug).toHaveBeenCalledWith(
        '[CacheService] Cache hit for key: test-key',
      );
    });

    it('should return null on cache miss', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await service.get('missing-key');

      expect(result).toBeNull();
      expect(mockLogger.debug).not.toHaveBeenCalled();
    });

    it('should return null and log warning on Redis error', async () => {
      mockRedis.get.mockRejectedValue(new Error('Connection refused'));

      const result = await service.get('error-key');

      expect(result).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        '[CacheService] Redis get error: Connection refused',
      );
    });
  });

  describe('set', () => {
    it('should call redis.set with JSON and TTL', async () => {
      const data = { id: '1', name: 'Test' };

      await service.set('test-key', data);

      expect(mockRedis.set).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify(data),
        'EX',
        60,
      );
    });

    it('should log warning on Redis error without throwing', async () => {
      mockRedis.set.mockRejectedValue(new Error('Write failed'));

      await expect(service.set('key', 'data')).resolves.toBeUndefined();

      expect(mockLogger.warn).toHaveBeenCalledWith(
        '[CacheService] Redis set error: Write failed',
      );
    });
  });

  describe('getVersion', () => {
    it('should return version string when key exists', async () => {
      mockRedis.get.mockResolvedValue('5');

      const result = await service.getVersion('version-key');

      expect(result).toBe('5');
      expect(mockRedis.get).toHaveBeenCalledWith('version-key');
    });

    it('should return "0" when key does not exist', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await service.getVersion('missing-key');

      expect(result).toBe('0');
    });

    it('should return "0" and log warning on Redis error', async () => {
      mockRedis.get.mockRejectedValue(new Error('Timeout'));

      const result = await service.getVersion('error-key');

      expect(result).toBe('0');
      expect(mockLogger.warn).toHaveBeenCalledWith(
        '[CacheService] Redis getVersion error: Timeout',
      );
    });
  });

  describe('increment', () => {
    it('should call redis.incr', async () => {
      mockRedis.incr.mockResolvedValue(6);

      await service.increment('counter-key');

      expect(mockRedis.incr).toHaveBeenCalledWith('counter-key');
    });

    it('should log warning on Redis error without throwing', async () => {
      mockRedis.incr.mockRejectedValue(new Error('INCR failed'));

      await expect(service.increment('key')).resolves.toBeUndefined();

      expect(mockLogger.warn).toHaveBeenCalledWith(
        '[CacheService] Redis increment error: INCR failed',
      );
    });
  });

  describe('deleteKeys', () => {
    it('should call redis.del with provided keys', async () => {
      mockRedis.del.mockResolvedValue(2);

      await service.deleteKeys('key1', 'key2');

      expect(mockRedis.del).toHaveBeenCalledWith('key1', 'key2');
    });

    it('should skip redis.del when no keys provided', async () => {
      await service.deleteKeys();

      expect(mockRedis.del).not.toHaveBeenCalled();
    });

    it('should log warning on Redis error without throwing', async () => {
      mockRedis.del.mockRejectedValue(new Error('DEL failed'));

      await expect(service.deleteKeys('key1')).resolves.toBeUndefined();

      expect(mockLogger.warn).toHaveBeenCalledWith(
        '[CacheService] Redis deleteKeys error: DEL failed',
      );
    });
  });
});
