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

import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

const mockService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  bulkDelete: jest.fn(),
};

describe('CustomersController', () => {
  let controller: CustomersController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new CustomersController(
      mockService as unknown as CustomersService,
    );
  });

  describe('findAll', () => {
    const query: QueryCustomerDto = {
      page: 1,
      limit: 20,
      sort_by: 'created_at',
      sort_order: 'DESC',
    };

    it('should delegate to service with isInternal true', async () => {
      mockService.findAll.mockResolvedValue({ data: [], meta: {} });

      await controller.findAll(query, 'true');

      expect(mockService.findAll).toHaveBeenCalledWith(query, true);
    });

    it('should delegate to service with isInternal false when header is missing', async () => {
      mockService.findAll.mockResolvedValue({ data: [], meta: {} });

      await controller.findAll(query, undefined);

      expect(mockService.findAll).toHaveBeenCalledWith(query, false);
    });
  });

  describe('findOne', () => {
    it('should delegate to service with isInternal true', async () => {
      mockService.findOne.mockResolvedValue({ id: 'uuid-1' });

      await controller.findOne('uuid-1', 'true');

      expect(mockService.findOne).toHaveBeenCalledWith('uuid-1', true);
    });

    it('should delegate to service with isInternal false when header is missing', async () => {
      mockService.findOne.mockResolvedValue({ id: 'uuid-1' });

      await controller.findOne('uuid-1', undefined);

      expect(mockService.findOne).toHaveBeenCalledWith('uuid-1', false);
    });
  });

  describe('create', () => {
    it('should strip sensitive fields when x-internal is not set', async () => {
      const dto: CreateCustomerDto = {
        full_name: 'John Smith',
        email: 'john@example.com',
        phone_number: '+962791234567',
        national_id: '1234567890',
        internal_notes: 'VIP client',
      };
      mockService.create.mockResolvedValue({ id: 'uuid-new' });

      await controller.create(dto, undefined);

      expect(dto.national_id).toBeUndefined();
      expect(dto.internal_notes).toBeUndefined();
      expect(mockService.create).toHaveBeenCalledWith(dto);
    });

    it('should preserve sensitive fields when x-internal is true', async () => {
      const dto: CreateCustomerDto = {
        full_name: 'John Smith',
        email: 'john@example.com',
        phone_number: '+962791234567',
        national_id: '1234567890',
        internal_notes: 'VIP client',
      };
      mockService.create.mockResolvedValue({ id: 'uuid-new' });

      await controller.create(dto, 'true');

      expect(dto.national_id).toBe('1234567890');
      expect(dto.internal_notes).toBe('VIP client');
      expect(mockService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should strip sensitive fields when x-internal is not set', async () => {
      const dto: UpdateCustomerDto = {
        full_name: 'John Updated',
        national_id: '1234567890',
        internal_notes: 'Updated notes',
      };
      mockService.update.mockResolvedValue({ id: 'uuid-1' });

      await controller.update('uuid-1', dto, undefined);

      expect(dto.national_id).toBeUndefined();
      expect(dto.internal_notes).toBeUndefined();
      expect(mockService.update).toHaveBeenCalledWith('uuid-1', dto);
    });

    it('should preserve sensitive fields when x-internal is true', async () => {
      const dto: UpdateCustomerDto = {
        full_name: 'John Updated',
        national_id: '1234567890',
        internal_notes: 'Updated notes',
      };
      mockService.update.mockResolvedValue({ id: 'uuid-1' });

      await controller.update('uuid-1', dto, 'true');

      expect(dto.national_id).toBe('1234567890');
      expect(dto.internal_notes).toBe('Updated notes');
      expect(mockService.update).toHaveBeenCalledWith('uuid-1', dto);
    });
  });

  describe('remove', () => {
    it('should delegate to service with correct id', async () => {
      mockService.remove.mockResolvedValue({ message: 'deleted' });

      await controller.remove('uuid-1');

      expect(mockService.remove).toHaveBeenCalledWith('uuid-1');
    });
  });

  describe('bulkDelete', () => {
    it('should delegate to service with correct ids', async () => {
      mockService.bulkDelete.mockResolvedValue({ affected: 2 });

      await controller.bulkDelete({ ids: ['uuid-1', 'uuid-2'] });

      expect(mockService.bulkDelete).toHaveBeenCalledWith(['uuid-1', 'uuid-2']);
    });
  });
});
