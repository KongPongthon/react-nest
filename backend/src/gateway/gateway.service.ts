import { Injectable } from '@nestjs/common';

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { WebSocket, Server } from 'ws';

@WebSocketGateway({ path: '/ws' })
@Injectable()
export class GatewayService
  implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor() {}

  afterInit() {
    console.log('GatewayService initialized');
  }

  handleConnection(client: WebSocket) {
    console.log('Client connected', client);
  }

  handleDisconnect(client: WebSocket) {
    console.log('Client disconnected', client);
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() message: string) {
    console.log('Received message: ', message);
  }
}
