jest.mock('../config/env.config', () => ({
  REDIS_HOST: 'localhost',
  REDIS_PORT: 6379,
  DB_HOST: 'localhost',
  DB_PORT: 5432,
  DB_USERNAME: 'test',
  DB_PASSWORD: 'test',
  DB_NAME: 'test',
  PORT: 3000,
  CORS_ORIGIN: '*',
}));

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CustomersService } from './customers.service';
import { Customer } from './entities/customer.entity';
import { CustomersGateway } from './customers.gateway';
import { REDIS_CLIENT } from '../redis/redis.module';

export const mockRepository = {
  find: jest.fn(),
  findAndCount: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  delete: jest.fn(),
};

export const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  incr: jest.fn(),
};

export const mockGateway = {
  emit: jest.fn(),
};

describe('CustomersService', () => {
  let service: CustomersService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        { provide: getRepositoryToken(Customer), useValue: mockRepository },
        { provide: REDIS_CLIENT, useValue: mockRedis },
        { provide: CustomersGateway, useValue: mockGateway },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
