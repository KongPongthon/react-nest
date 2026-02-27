import { Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { WebSocketMessage } from './rooms.interface';
import { RoomStateService } from './rooms-state.service';
import { RoomsService } from './rooms.service';
import { IncomingMessage } from 'http';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RoomsGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RoomsGateway.name);

  constructor(
    private readonly RoomStateService: RoomStateService,
    private readonly RoomService: RoomsService,
  ) {}

  handleConnection(client: WebSocket, request: IncomingMessage) {
    const url = new URL(request.url ?? '', 'http://localhost');
    const token = url.searchParams.get('token');

    if (!token && typeof token !== 'string') {
      client.close();
      return;
    }

    const decoded = this.RoomService.verify(token?.toString() ?? '');

    if (!decoded || !decoded.id) {
      this.sendToClient(client, {
        event: 'error',
        data: { message: 'Token not found' },
      });

      client.close();
      return;
    }

    const userId = decoded.id;

    const existingSocket = this.RoomStateService.socketByUser.get(userId);
    if (existingSocket && existingSocket !== client) {
      const oldRoomId = this.RoomStateService.userToRoom.get(userId);
      if (oldRoomId) this.performLeaveRoom(userId, oldRoomId); // ← leave room ก่อน

      existingSocket.close(1000, 'Replaced by new socket');
      this.RoomStateService.clients.delete(existingSocket);
    }

    this.RoomStateService.clients.set(client, userId);
    this.RoomStateService.socketByUser.set(userId, client);

    this.logger.log(
      `✅ Client connected: ${userId} (Total: ${this.RoomStateService.clients.size})`,
    );
    try {
      const rooms = this.RoomService.getRoom();
      this.logger.log(`📤 Sending ${rooms.length} rooms to ${userId}`);

      this.sendToClient(client, {
        event: 'rooms-list',
        data: rooms,
      });
      this.sendToClient(client, {
        event: 'connect',
        data: { username: userId },
      });
      client.on('message', (data: Buffer) => {
        this.handleMessage(client, data);
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
    const userId = this.RoomStateService.clients.get(client);
    if (!userId) return;
    this.logger.log(
      `❌ Client disconnected: ${userId} (Total: ${this.RoomStateService.clients.size})`,
    );

    this.RoomStateService.clients.delete(client);
    this.RoomStateService.socketByUser.delete(userId);

    setTimeout(() => {
      const stillConnected = this.RoomStateService.socketByUser.get(userId);
      if (!stillConnected) {
        const roomId = this.RoomStateService.userToRoom.get(userId);
        if (roomId) this.performLeaveRoom(userId, roomId);
      }
    }, 5000);
  }

  private performLeaveRoom(clientId: string, roomId: string) {
    // console.log('roomID', roomId);
    // ลบออกจากห้อง
    if (roomId) {
      this.RoomStateService.rooms.delete(roomId);
      this.RoomStateService.roomMembers.delete(roomId);
      this.RoomStateService.roomSeats?.delete(roomId);
    }

    if (!clientId) return;

    this.RoomStateService.userToRoom.delete(clientId);
  }

  // 2. แก้ไข handleJoinRoom ให้เรียกใช้ฟังก์ชันกลาง
  handleJoinRoom(clientId: string, roomId: string) {
    console.log(clientId, roomId);
  }

  private handleMessage(client: WebSocket, data: Buffer) {
    try {
      const message: WebSocketMessage = JSON.parse(
        data.toString(),
      ) as WebSocketMessage;

      const clientId = this.RoomStateService.clients.get(client) || 'unknown';
      this.logger.log(
        `📨 Message from ${clientId}: ${message.event} ${message.data}`,
      );
      // let roomId: string | undefined;
      // let clientSocket: WebSocket | undefined;
      switch (message.event) {
        case 'leave_room':
          console.log('=== DEBUG leave_room ===');
          console.log(
            'incoming client object id exists in clients map:',
            this.RoomStateService.clients.has(client),
          );
          break;
        default:
          this.logger.warn(`Unknown event: ${message.event}`);
      }
    } catch (error) {
      this.logger.error('Error parsing message:', error);
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
    console.log(payload);

    // members.forEach((member) => {
    //   if (member.readyState === WebSocket.OPEN) {
    //     member.send(payload);
    //   }
    // });
  }

  private broadcast(message: WebSocketMessage) {
    const payload = JSON.stringify(message);
    this.server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }

  sitdownNew(client: string, index: number, email: string, id: string) {
    const clientSocket = this.findSocketById(client);

    console.log(index, email, id);

    if (!clientSocket) {
      console.log(`❌ ไม่พบ Socket สำหรับ idConnect: ${clientSocket}`);
      return;
    }
  }

  private generateClientId(): string {
    return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  findSocketById(clientId: string): WebSocket | undefined {
    for (const [socket, id] of this.RoomStateService.clients.entries()) {
      if (id === clientId) {
        return socket;
      }
    }
    return undefined;
  }
}
