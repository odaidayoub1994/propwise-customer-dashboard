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
});
