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

  private handleMessage(client: WebSocket, data: Buffer) {
    try {
      const message: WebSocketMessage = JSON.parse(
        data.toString(),
      ) as WebSocketMessage;
      const clientId = this.clients.get(client) || 'unknown';
      this.logger.log(`📨 Message from ${clientId}: ${message.event}`);
      let roomId: string | undefined;
      switch (message.event) {
        case 'sitdown':
          roomId = this.clientToRoom.get(client);
          if (roomId) {
            this.sitdown(roomId, message.data);
          } else {
            this.logger.warn(`❌ Client ${clientId} ยังไม่ได้ join room`);
            client.send(
              JSON.stringify({
                event: 'error',
                data: { message: 'กรุณา join room ก่อน' },
              }),
            );
          }
          break;
        // case 'create-room':
        //   this.handleCreateRoom(client, message.data);
        //   break;
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

  private sitdown(roomId: string, data: { index: number; id: string }) {
    const { index, id } = data;
    console.log('index id :', index, id, roomId);

    if (!roomId) return;
    if (!this.RoomStateService.roomSeats.has(roomId)) {
      this.RoomStateService.roomSeats.set(roomId, new Map());
    }

    const seats = this.RoomStateService.roomSeats.get(roomId);
    if (!seats) return;
    const myCurrentSeatIndex = Array.from(seats.entries()).find(
      // eslint-disable-next-line
      ([_, seat]) => seat.userId === id,
    )?.[0];

    const existingInSeat = seats.get(index);
    if (existingInSeat && existingInSeat.userId === id) {
      seats.delete(index);
    } else if (!existingInSeat) {
      if (myCurrentSeatIndex !== undefined) {
        seats.delete(myCurrentSeatIndex);
      }
      seats.set(index, { userId: id, userName: id, index });
    } else {
      console.log(`⚠️ ที่นั่ง ${index} มีคนนั่งอยู่แล้ว`);
      return;
    }
    const updatedSeats = Array.from(seats.values());
    console.log('updatedSeats', updatedSeats);

    // **Broadcast ไปยังทุกคนในห้องผ่าน method ที่มีอยู่แล้ว**
    this.broadcastToRoom(roomId, {
      event: 'update-seats',
      data: {
        seats: updatedSeats,
        roomId: roomId,
      },
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
