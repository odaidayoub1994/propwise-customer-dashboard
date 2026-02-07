import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Inject } from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  @WebSocketServer()
  server: Server;

  emit(event: string, payload: unknown) {
    this.logger.debug?.(`[SocketGateway] Emitting ${event}`);
    this.server.emit(event, payload);
  }

  afterInit() {
    this.logger.log('[SocketGateway] WebSocket gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.debug?.(`[SocketGateway] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug?.(`[SocketGateway] Client disconnected: ${client.id}`);
  }
}
