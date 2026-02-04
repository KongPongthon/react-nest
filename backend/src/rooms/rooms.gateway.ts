import { Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { WebSocketMessage } from './rooms.interface';
import { RoomStateService } from './rooms-state.service';
import { RoomsService } from './rooms.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RoomsGateway {
  @WebSocketServer()
  server: Server;

  private clients = new Map<WebSocket, string>();

  private clientToRoom = new Map<WebSocket, string>();

  private readonly logger = new Logger(RoomsGateway.name);

  constructor(
    private readonly RoomStateService: RoomStateService,
    private readonly RoomServce: RoomsService,
  ) {}

  //eslint-disable-next-line
  handleConnection(client: WebSocket, ...arge: any[]) {
    const clientID = this.generateClientId();
    this.clients.set(client, clientID);

    this.logger.log(
      `✅ Client connected: ${clientID} (Total: ${this.clients.size})`,
    );
    try {
      const rooms = this.RoomServce.getRoom();
      this.logger.log(`📤 Sending ${rooms.length} rooms to ${clientID}`);

      this.sendToClient(client, {
        event: 'rooms-list',
        data: rooms,
      });
    } catch (error) {
      this.logger.error(`Error sending rooms list: ${error}`);
      this.sendToClient(client, {
        event: 'error',
        data: { message: 'Failed to load rooms' },
      });
    }
  }

  handleDisconnect(client: WebSocket) {
    // const clientID = this.clients.get(client);
    console.log('TESTClient', client);

    const roomID = this.clientToRoom.get(client);

    if (roomID) {
      //   this.RoomStateService.roomMembers.get(roomID)?.delete(client);
      if (this.RoomStateService.roomMembers.get(roomID)?.size === 0) {
        this.RoomStateService.roomMembers.delete(roomID);
      }
    }
    this.clients.delete(client);
    this.clientToRoom.delete(client);
  }

  handleJoinRoom(client: WebSocket, roomId: string) {
    if (!this.RoomStateService.roomMembers.has(roomId)) {
      this.RoomStateService.roomMembers.set(roomId, new Set());
    }
    this.RoomStateService.roomMembers?.get(roomId)?.add(client); // ← สำคัญ!
    this.clientToRoom.set(client, roomId);
    this.broadcastToRoom(roomId, {
      event: 'user-joined',
      data: {
        username: this.clients.get(client),
        memberCount: this.RoomStateService.roomMembers.get(roomId)?.size,
      },
    });
  }

  // เมื่อมีคนออกจากห้อง
  handleLeaveRoom(client: WebSocket) {
    const roomId = this.clientToRoom.get(client);
    if (roomId) {
      //   this.RoomStateService.roomMembers.get(roomId)?.delete(client); // ← สำคัญ!
      this.clientToRoom.delete(client);
    }
  }

  handleNotifyUpdate<T>(event: string, data: T) {
    this.broadcast({
      event: event,
      data: data,
    });
  }

  private sendToClient(client: WebSocket, message: WebSocketMessage) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }

  private broadcastToRoom(roomId: string, message: WebSocketMessage) {
    const members = this.RoomStateService.roomMembers.get(roomId);
    if (members) {
      const payload = JSON.stringify(message);
      members.forEach((member) => {
        if (member.readyState === WebSocket.OPEN) {
          member.send(payload);
        }
      });
    }
  }

  private broadcast(message: WebSocketMessage) {
    const payload = JSON.stringify(message);
    this.server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }

  private generateClientId(): string {
    return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
