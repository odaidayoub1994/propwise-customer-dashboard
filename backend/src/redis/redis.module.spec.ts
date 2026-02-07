jest.mock('../config/env.config', () => ({
  REDIS_HOST: 'localhost',
  REDIS_PORT: 6379,
  DB_HOST: 'localhost',
  DB_PORT: 5432,
  DB_USERNAME: 'test',
  DB_PASSWORD: 'test',
  DB_NAME: 'test',
  PORT: 4000,
  CORS_ORIGIN: '*',
  CACHE_TTL: 60,
}));

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    quit: jest.fn(),
  }));
});

import { Test, TestingModule } from '@nestjs/testing';
import { RedisModule, REDIS_CLIENT } from './redis.module';

describe('RedisModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [RedisModule],
    }).compile();
  });

  it('should compile the module', () => {
    expect(module).toBeDefined();
  });

  it('should provide REDIS_CLIENT', () => {
    const redis: unknown = module.get(REDIS_CLIENT);
    expect(redis).toBeDefined();
  });
});
