import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Inject, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class CustomersGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  @WebSocketServer()
  server: Server;

  emit(event: string, payload: unknown) {
    this.logger.debug(`[CustomersGateway] Emitting ${event}`);
    this.server.emit(event, payload);
  }

  afterInit() {
    this.logger.log('[CustomersGateway] WebSocket gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.debug(`[CustomersGateway] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`[CustomersGateway] Client disconnected: ${client.id}`);
  }
}
