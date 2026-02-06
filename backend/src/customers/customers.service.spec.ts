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
import { QueryCustomerDto } from './dto/query-customer.dto';

const mockRepository = {
  find: jest.fn(),
  findAndCount: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  delete: jest.fn(),
};

const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  incr: jest.fn(),
};

const mockGateway = {
  emit: jest.fn(),
};

const defaultQuery: QueryCustomerDto = {
  page: 1,
  limit: 20,
  sort_by: 'created_at',
  sort_order: 'DESC',
};

const mockCustomer: Partial<Customer> = {
  id: 'uuid-1',
  full_name: 'John Smith',
  email: 'john@example.com',
  phone_number: '+962791234567',
  created_at: new Date(),
  updated_at: new Date(),
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

  describe('findAll', () => {
    it('should return cached data on cache hit', async () => {
      const cachedResult = {
        data: [mockCustomer],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      };
      const serialized = JSON.stringify(cachedResult);
      mockRedis.get
        .mockResolvedValueOnce('5')
        .mockResolvedValueOnce(serialized);

      const result = await service.findAll(defaultQuery, false);

      // JSON.parse converts Date objects to strings
      expect(result).toEqual(JSON.parse(serialized));
      expect(mockRepository.findAndCount).not.toHaveBeenCalled();
    });

    it('should query database on cache miss and cache the result', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRepository.findAndCount.mockResolvedValue([[mockCustomer], 1]);

      const result = await service.findAll(defaultQuery, false);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: undefined,
        order: { created_at: 'DESC' },
        skip: 0,
        take: 20,
      });
      expect(result).toEqual({
        data: [mockCustomer],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      });
      expect(mockRedis.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        'EX',
        60,
      );
    });

    it('should apply search filter when q is provided', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ ...defaultQuery, q: 'john' }, false);

      const call = mockRepository.findAndCount.mock.calls[0] as unknown[];
      const args = call[0] as Record<string, unknown>;
      const where = args.where as Record<string, unknown>[];
      expect(where).toHaveLength(2);
      expect(where[0]).toHaveProperty('full_name');
      expect(where[1]).toHaveProperty('email');
    });

    it('should apply correct pagination', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ ...defaultQuery, page: 3, limit: 10 }, false);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        }),
      );
    });

    it('should apply correct sorting', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll(
        { ...defaultQuery, sort_by: 'full_name', sort_order: 'ASC' },
        false,
      );

      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { full_name: 'ASC' },
        }),
      );
    });

    it('should fall back to database when Redis throws an error', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis connection refused'));
      mockRepository.findAndCount.mockResolvedValue([[mockCustomer], 1]);

      const result = await service.findAll(defaultQuery, false);

      expect(result).toEqual({
        data: [mockCustomer],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      });
      expect(mockRedis.set).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return cached customer on cache hit', async () => {
      const serialized = JSON.stringify(mockCustomer);
      mockRedis.get.mockResolvedValue(serialized);

      const result = await service.findOne('uuid-1', false);

      expect(result).toEqual(JSON.parse(serialized));
      expect(mockRepository.findOneBy).not.toHaveBeenCalled();
    });

    it('should return customer from DB on cache miss and cache it', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRepository.findOneBy.mockResolvedValue(mockCustomer);

      const result = await service.findOne('uuid-1', false);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 'uuid-1' });
      expect(result).toEqual(mockCustomer);
      expect(mockRedis.set).toHaveBeenCalledWith(
        'customers:detail:uuid-1:false',
        JSON.stringify(mockCustomer),
        'EX',
        60,
      );
    });

    it('should throw NotFoundException when customer not found', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne('uuid-999', false)).rejects.toThrow(
        'Customer with id uuid-999 not found',
      );
    });

    it('should fall back to database when Redis throws an error', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis down'));
      mockRepository.findOneBy.mockResolvedValue(mockCustomer);

      const result = await service.findOne('uuid-1', false);

      expect(result).toEqual(mockCustomer);
    });
  });
});
