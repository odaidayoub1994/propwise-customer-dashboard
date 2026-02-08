import { Injectable } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import type { SocketEventName } from './socket-events';

@Injectable()
export class SocketService {
  constructor(private readonly gateway: SocketGateway) {}

  emit(event: SocketEventName, payload: unknown) {
    this.gateway.emit(event, payload);
  }
}
