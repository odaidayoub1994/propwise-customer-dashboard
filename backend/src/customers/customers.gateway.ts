import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import logger from '../config/logger';

@WebSocketGateway({ cors: { origin: '*' } })
export class CustomersGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnection
{
  @WebSocketServer()
  server: Server;

  emit(event: string, payload: unknown) {
    logger.debug(`[CustomersGateway] Emitting ${event}`);
    this.server.emit(event, payload);
  }

  afterInit() {
    logger.info('[CustomersGateway] WebSocket gateway initialized');
  }

  handleConnection(client: Socket) {
    logger.debug(`[CustomersGateway] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    logger.debug(`[CustomersGateway] Client disconnected: ${client.id}`);
  }
}
