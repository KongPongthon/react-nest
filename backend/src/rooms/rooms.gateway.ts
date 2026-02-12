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
      this.sendToClient(client, {
        event: 'connect',
        data: { username: clientID },
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
      this.RoomStateService.roomMembers.get(roomID)?.delete(client);
      if (this.RoomStateService.roomMembers.get(roomID)?.size === 0) {
        this.RoomStateService.roomMembers.delete(roomID);
      }
    }
    this.clients.delete(client);
    this.clientToRoom.delete(client);
  }

  handleJoinRoom(client: string, roomId: string) {
    const clientSocket = this.findSocketById(client);
    if (!clientSocket) {
      console.log(`❌ ไม่พบ Socket สำหรับ idConnect: ${clientSocket}`);
      return;
    }
    // --- จุดที่ต้องแก้ไข: เช็คและสร้าง Set ---
    if (!this.RoomStateService.roomMembers.has(roomId)) {
      this.RoomStateService.roomMembers.set(roomId, new Set<WebSocket>());
    }
    this.RoomStateService.roomMembers?.get(roomId)?.add(clientSocket);
    this.clientToRoom.set(clientSocket, roomId);
    this.broadcastToRoom(roomId, {
      event: 'join-room',
      data: {
        username: this.clients.get(clientSocket),
        memberCount: this.RoomStateService.roomMembers.get(roomId)?.size,
      },
    });
  }

  // เมื่อมีคนออกจากห้อง
  handleLeaveRoom(client: WebSocket) {
    const roomId = this.clientToRoom.get(client);
    if (roomId) {
      this.RoomStateService.roomMembers.get(roomId)?.delete(client); // ← สำคัญ!
      this.clientToRoom.delete(client);
    }
  }

  handleNotifyUpdate<T>(event: string, data: T) {
    this.broadcast({
      event: event,
      data: data,
    });
  }

  handleNOtifyRoomUpdate<T>(roomId: string, event: string, data: T) {
    this.broadcastToRoom(roomId, {
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
    console.log(
      `📢 กำลังจะ Broadcast ไปที่ห้อง: ${roomId} (Type: ${typeof roomId})`,
    );
    const members = this.RoomStateService.roomMembers.get(roomId);
    if (!members) {
      console.log(
        `⚠️ ไม่พบสมาชิกในห้อง ${roomId} ใน Map (อาจจะลืม .set() หรือ Key ไม่ตรง)`,
      );
      console.log(
        'ปัจจุบันมีห้องในระบบ:',
        Array.from(this.RoomStateService.roomMembers.keys()),
      );
      return;
    }
    console.log(`✅ พบสมาชิกในห้อง ${roomId} จำนวน ${members.size} คน`);
    const payload = JSON.stringify(message);
    members.forEach((member) => {
      if (member.readyState === WebSocket.OPEN) {
        member.send(payload);
      }
    });
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

  findSocketById(clientId: string): WebSocket | undefined {
    for (const [socket, id] of this.clients.entries()) {
      if (id === clientId) {
        return socket;
      }
    }
    return undefined;
  }
}
