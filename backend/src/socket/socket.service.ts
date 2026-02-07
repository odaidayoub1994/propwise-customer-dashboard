import { Injectable } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';

@Injectable()
export class SocketService {
  constructor(private readonly gateway: SocketGateway) {}

  emit(event: string, payload: unknown) {
    this.gateway.emit(event, payload);
  }
}
