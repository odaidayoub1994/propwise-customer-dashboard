jest.mock('../config/env.config', () => ({
  CORS_ORIGIN: '*',
}));

import { Test, TestingModule } from '@nestjs/testing';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { SocketGateway } from './socket.gateway';
import { SOCKET_EVENTS } from './socket-events';

const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

const mockServer = {
  emit: jest.fn(),
};

describe('SocketGateway', () => {
  let gateway: SocketGateway;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SocketGateway,
        { provide: WINSTON_MODULE_NEST_PROVIDER, useValue: mockLogger },
      ],
    }).compile();

    gateway = module.get<SocketGateway>(SocketGateway);
    gateway.server = mockServer as never;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('emit', () => {
    it('should call server.emit with correct event and payload', () => {
      const payload = { id: 'uuid-1', name: 'Test' };

      gateway.emit(SOCKET_EVENTS.CUSTOMER_CREATED, payload);

      expect(mockServer.emit).toHaveBeenCalledWith(
        SOCKET_EVENTS.CUSTOMER_CREATED,
        payload,
      );
    });

    it('should log debug message on emit', () => {
      gateway.emit(SOCKET_EVENTS.CUSTOMER_UPDATED, { id: 'uuid-1' });

      expect(mockLogger.debug).toHaveBeenCalledWith(
        `[SocketGateway] Emitting ${SOCKET_EVENTS.CUSTOMER_UPDATED}`,
      );
    });

    it('should handle different event names and payloads', () => {
      gateway.emit(SOCKET_EVENTS.CUSTOMERS_BULK_DELETED, {
        ids: ['a', 'b'],
      });

      expect(mockServer.emit).toHaveBeenCalledWith(
        SOCKET_EVENTS.CUSTOMERS_BULK_DELETED,
        { ids: ['a', 'b'] },
      );
    });
  });

  describe('afterInit', () => {
    it('should log initialization', () => {
      gateway.afterInit();

      expect(mockLogger.log).toHaveBeenCalledWith(
        '[SocketGateway] WebSocket gateway initialized',
      );
    });
  });

  describe('handleConnection', () => {
    it('should log client connection', () => {
      gateway.handleConnection({ id: 'client-123' } as never);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        '[SocketGateway] Client connected: client-123',
      );
    });
  });

  describe('handleDisconnect', () => {
    it('should log client disconnection', () => {
      gateway.handleDisconnect({ id: 'client-123' } as never);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        '[SocketGateway] Client disconnected: client-123',
      );
    });
  });
});
