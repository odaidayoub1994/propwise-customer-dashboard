import { Test, TestingModule } from '@nestjs/testing';
import { SocketService } from './socket.service';
import { SocketGateway } from './socket.gateway';

const mockGateway = {
  emit: jest.fn(),
};

describe('SocketService', () => {
  let service: SocketService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SocketService,
        { provide: SocketGateway, useValue: mockGateway },
      ],
    }).compile();

    service = module.get<SocketService>(SocketService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('emit', () => {
    it('should delegate to gateway with correct event and payload', () => {
      const payload = { id: 'uuid-1', full_name: 'John' };

      service.emit('customer.created', payload);

      expect(mockGateway.emit).toHaveBeenCalledWith(
        'customer.created',
        payload,
      );
    });

    it('should handle different event names', () => {
      service.emit('customer.deleted', { id: 'uuid-1' });

      expect(mockGateway.emit).toHaveBeenCalledWith('customer.deleted', {
        id: 'uuid-1',
      });
    });

    it('should handle array payloads', () => {
      service.emit('customers.bulk_deleted', { ids: ['a', 'b', 'c'] });

      expect(mockGateway.emit).toHaveBeenCalledWith('customers.bulk_deleted', {
        ids: ['a', 'b', 'c'],
      });
    });
  });
});
