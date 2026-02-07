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
  CACHE_TTL: 60,
}));

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
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

const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
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

const mockCustomerWithSensitive: Partial<Customer> = {
  ...mockCustomer,
  national_id: '1234567890',
  internal_notes: 'VIP client',
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
        { provide: WINSTON_MODULE_NEST_PROVIDER, useValue: mockLogger },
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

    it('should strip sensitive fields from cached data in public mode', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRepository.findAndCount.mockResolvedValue([
        [mockCustomerWithSensitive],
        1,
      ]);

      const result = await service.findAll(defaultQuery, false);
      const res = result as { data: Record<string, unknown>[] };

      expect(res.data[0]).not.toHaveProperty('national_id');
      expect(res.data[0]).not.toHaveProperty('internal_notes');

      const setCalls = mockRedis.set.mock.calls as unknown[][];
      const cachedJson = setCalls[0][1] as string;
      const cached = JSON.parse(cachedJson) as {
        data: Record<string, unknown>[];
      };
      expect(cached.data[0]).not.toHaveProperty('national_id');
      expect(cached.data[0]).not.toHaveProperty('internal_notes');
    });

    it('should preserve sensitive fields in cached data in internal mode', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRepository.findAndCount.mockResolvedValue([
        [mockCustomerWithSensitive],
        1,
      ]);

      const result = await service.findAll(defaultQuery, true);
      const res = result as { data: Record<string, unknown>[] };

      expect(res.data[0].national_id).toBe('1234567890');
      expect(res.data[0].internal_notes).toBe('VIP client');
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

    it('should filter by date_from only (open-ended)', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll(
        { ...defaultQuery, date_from: '2026-01-01' },
        false,
      );

      const call = mockRepository.findAndCount.mock.calls[0] as unknown[];
      const args = call[0] as Record<string, unknown>;
      const where = args.where as Record<string, unknown>[];
      expect(where).toHaveLength(1);
      expect(where[0]).toHaveProperty('created_at');
    });

    it('should filter by date_to only (open-ended)', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ ...defaultQuery, date_to: '2026-12-31' }, false);

      const call = mockRepository.findAndCount.mock.calls[0] as unknown[];
      const args = call[0] as Record<string, unknown>;
      const where = args.where as Record<string, unknown>[];
      expect(where).toHaveLength(1);
      expect(where[0]).toHaveProperty('created_at');
    });

    it('should filter by both date_from and date_to', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll(
        { ...defaultQuery, date_from: '2026-01-01', date_to: '2026-12-31' },
        false,
      );

      const call = mockRepository.findAndCount.mock.calls[0] as unknown[];
      const args = call[0] as Record<string, unknown>;
      const where = args.where as Record<string, unknown>[];
      expect(where).toHaveLength(1);
      expect(where[0]).toHaveProperty('created_at');
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
        expect.any(String),
        'EX',
        60,
      );
    });

    it('should strip sensitive fields for public mode', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRepository.findOneBy.mockResolvedValue(mockCustomerWithSensitive);

      const result = await service.findOne('uuid-1', false);

      expect(result).not.toHaveProperty('national_id');
      expect(result).not.toHaveProperty('internal_notes');

      const setCalls = mockRedis.set.mock.calls as unknown[][];
      const cachedJson = setCalls[0][1] as string;
      const cached = JSON.parse(cachedJson) as Record<string, unknown>;
      expect(cached).not.toHaveProperty('national_id');
      expect(cached).not.toHaveProperty('internal_notes');
    });

    it('should preserve sensitive fields for internal mode', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRepository.findOneBy.mockResolvedValue(mockCustomerWithSensitive);

      const result = await service.findOne('uuid-1', true);
      const customer = result as Record<string, unknown>;

      expect(customer.national_id).toBe('1234567890');
      expect(customer.internal_notes).toBe('VIP client');
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

  describe('create', () => {
    const createDto = {
      full_name: 'John Smith',
      email: 'john@example.com',
      phone_number: '+962791234567',
    };

    const savedCustomer = {
      id: 'uuid-new',
      ...createDto,
      national_id: null,
      internal_notes: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('should create and return customer', async () => {
      mockRepository.create.mockReturnValue(savedCustomer);
      mockRepository.save.mockResolvedValue(savedCustomer);

      const result = await service.create(createDto, true);

      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(savedCustomer);
      expect(result).toEqual(savedCustomer);
    });

    it('should bump list cache version', async () => {
      mockRepository.create.mockReturnValue(savedCustomer);
      mockRepository.save.mockResolvedValue(savedCustomer);

      await service.create(createDto, true);

      expect(mockRedis.incr).toHaveBeenCalledWith('customers:list:version');
    });

    it('should emit customer.created socket event with enriched payload', async () => {
      mockRepository.create.mockReturnValue(savedCustomer);
      mockRepository.save.mockResolvedValue(savedCustomer);

      await service.create(createDto, true);

      expect(mockGateway.emit).toHaveBeenCalledWith('customer.created', {
        id: 'uuid-new',
        full_name: 'John Smith',
        email: 'john@example.com',
        phone_number: '+962791234567',
        created_at: savedCustomer.created_at,
        updated_at: savedCustomer.updated_at,
      });
    });

    it('should still return saved customer when Redis incr fails', async () => {
      mockRepository.create.mockReturnValue(savedCustomer);
      mockRepository.save.mockResolvedValue(savedCustomer);
      mockRedis.incr.mockRejectedValue(new Error('Redis down'));

      const result = await service.create(createDto, true);

      expect(result).toEqual(savedCustomer);
    });

    it('should strip sensitive fields when isInternal is false', async () => {
      const dtoWithSensitive = {
        full_name: 'John Smith',
        email: 'john@example.com',
        phone_number: '+962791234567',
        national_id: '1234567890',
        internal_notes: 'VIP client',
      };
      mockRepository.create.mockReturnValue(savedCustomer);
      mockRepository.save.mockResolvedValue(savedCustomer);

      await service.create(dtoWithSensitive, false);

      expect(dtoWithSensitive.national_id).toBeUndefined();
      expect(dtoWithSensitive.internal_notes).toBeUndefined();
    });
  });

  describe('update', () => {
    const existingCustomer = {
      id: 'uuid-1',
      full_name: 'John Smith',
      email: 'john@example.com',
      phone_number: '+962791234567',
      national_id: null,
      internal_notes: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const updateDto = { full_name: 'John Updated' };

    const updatedCustomer = { ...existingCustomer, ...updateDto };

    it('should update and return customer', async () => {
      mockRepository.findOneBy.mockResolvedValue({ ...existingCustomer });
      mockRepository.save.mockResolvedValue(updatedCustomer);

      const result = await service.update('uuid-1', updateDto, true);

      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedCustomer);
    });

    it('should throw NotFoundException when customer not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.update('uuid-999', updateDto, true)).rejects.toThrow(
        'Customer with id uuid-999 not found',
      );
    });

    it('should bump list cache version and delete detail caches', async () => {
      mockRepository.findOneBy.mockResolvedValue({ ...existingCustomer });
      mockRepository.save.mockResolvedValue(updatedCustomer);
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.del.mockResolvedValue(2);

      await service.update('uuid-1', updateDto, true);

      expect(mockRedis.incr).toHaveBeenCalledWith('customers:list:version');
      expect(mockRedis.del).toHaveBeenCalledWith(
        'customers:detail:uuid-1:true',
        'customers:detail:uuid-1:false',
      );
    });

    it('should emit customer.updated socket event with enriched payload', async () => {
      mockRepository.findOneBy.mockResolvedValue({ ...existingCustomer });
      mockRepository.save.mockResolvedValue(updatedCustomer);
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.del.mockResolvedValue(2);

      await service.update('uuid-1', updateDto, true);

      expect(mockGateway.emit).toHaveBeenCalledWith('customer.updated', {
        id: 'uuid-1',
        full_name: 'John Updated',
        email: 'john@example.com',
        phone_number: '+962791234567',
        created_at: updatedCustomer.created_at,
        updated_at: updatedCustomer.updated_at,
      });
    });

    it('should still return updated customer when Redis fails', async () => {
      mockRepository.findOneBy.mockResolvedValue({ ...existingCustomer });
      mockRepository.save.mockResolvedValue(updatedCustomer);
      mockRedis.incr.mockRejectedValue(new Error('Redis down'));

      const result = await service.update('uuid-1', updateDto, true);

      expect(result).toEqual(updatedCustomer);
    });

    it('should strip sensitive fields when isInternal is false', async () => {
      const dtoWithSensitive = {
        full_name: 'John Updated',
        national_id: '1234567890',
        internal_notes: 'Updated notes',
      };
      mockRepository.findOneBy.mockResolvedValue({ ...existingCustomer });
      mockRepository.save.mockResolvedValue(updatedCustomer);

      await service.update('uuid-1', dtoWithSensitive, false);

      expect(dtoWithSensitive.national_id).toBeUndefined();
      expect(dtoWithSensitive.internal_notes).toBeUndefined();
    });
  });

  describe('remove', () => {
    const existingCustomer = {
      id: 'uuid-1',
      full_name: 'John Smith',
      email: 'john@example.com',
      phone_number: '+962791234567',
      national_id: null,
      internal_notes: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('should delete customer, invalidate caches, and return { id }', async () => {
      mockRepository.findOneBy.mockResolvedValue(existingCustomer);
      mockRepository.remove.mockResolvedValue(existingCustomer);
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.del.mockResolvedValue(2);

      const result = await service.remove('uuid-1');

      expect(result).toEqual({ id: 'uuid-1' });
      expect(mockRepository.remove).toHaveBeenCalledWith(existingCustomer);
      expect(mockRedis.incr).toHaveBeenCalledWith('customers:list:version');
      expect(mockRedis.del).toHaveBeenCalledWith(
        'customers:detail:uuid-1:true',
        'customers:detail:uuid-1:false',
      );
      expect(mockGateway.emit).toHaveBeenCalledWith('customer.deleted', {
        id: 'uuid-1',
      });
    });

    it('should throw NotFoundException when customer not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove('uuid-999')).rejects.toThrow(
        'Customer with id uuid-999 not found',
      );
    });
  });

  describe('bulkDelete', () => {
    it('should delete multiple customers, invalidate caches, and return { ids }', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 2 });
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.del.mockResolvedValue(4);

      const result = await service.bulkDelete(['uuid-1', 'uuid-2']);

      expect(result).toEqual({ ids: ['uuid-1', 'uuid-2'] });
      expect(mockRepository.delete).toHaveBeenCalled();
      expect(mockRedis.incr).toHaveBeenCalledWith('customers:list:version');
      expect(mockRedis.del).toHaveBeenCalledWith(
        'customers:detail:uuid-1:true',
        'customers:detail:uuid-1:false',
        'customers:detail:uuid-2:true',
        'customers:detail:uuid-2:false',
      );
      expect(mockGateway.emit).toHaveBeenCalledWith('customers.bulk_deleted', {
        ids: ['uuid-1', 'uuid-2'],
      });
    });

    it('should handle empty ids array and return { ids: [] }', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });
      mockRedis.incr.mockResolvedValue(1);

      const result = await service.bulkDelete([]);

      expect(result).toEqual({ ids: [] });
      expect(mockRepository.delete).toHaveBeenCalled();
      expect(mockRedis.del).not.toHaveBeenCalled();
      expect(mockGateway.emit).toHaveBeenCalledWith('customers.bulk_deleted', {
        ids: [],
      });
    });
  });
});
