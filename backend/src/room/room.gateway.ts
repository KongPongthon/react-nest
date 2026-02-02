import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { forwardRef, Inject, Logger } from '@nestjs/common';
import { RoomService } from './room.service';
import { Rooms, WebSocketMessage } from './room.interface';
import { JoinRoomDto } from './room.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RoomsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private clients = new Map<WebSocket, string>();
  private readonly logger = new Logger(RoomsGateway.name);

  constructor(
    @Inject(forwardRef(() => RoomService)) // ใส่ forwardRef เช่นกัน
    private readonly roomsService: RoomService,
  ) {}
  //eslint-disable-next-line
  afterInit(server: Server) {
    this.logger.log('='.repeat(60));
    this.logger.log('✅✅✅ WebSocket Gateway INITIALIZED ✅✅✅');
    this.logger.log('='.repeat(60));
  }
  //eslint-disable-next-line
  handleConnection(client: WebSocket, ...args: any[]) {
    const clientId = this.generateClientId();
    this.clients.set(client, clientId);

    this.logger.log(
      `✅ Client connected: ${clientId} (Total: ${this.clients.size})`,
    );

    // ส่งรายการห้องทั้งหมด
    const rooms = this.roomsService.getAllRooms();
    this.sendToClient(client, {
      event: 'rooms-list',
      data: rooms,
    });

    // รับข้อความจาก client
    client.on('message', (data: Buffer) => {
      this.handleMessage(client, data);
    });
  }

  handleDisconnect(client: WebSocket) {
    const clientId = this.clients.get(client);
    this.clients.delete(client);
    this.logger.log(
      `❌ Client disconnected: ${clientId} (Total: ${this.clients.size})`,
    );
  }

  private handleMessage(client: WebSocket, data: Buffer) {
    try {
      const message: WebSocketMessage = JSON.parse(
        data.toString(),
      ) as WebSocketMessage;
      const clientId = this.clients.get(client) || 'unknown';

      this.logger.log(`📨 Message from ${clientId}: ${message.event}`);

      switch (message.event) {
        // case 'create-room':
        //   this.handleCreateRoom(client, message.data);
        //   break;

        // case 'join-room':
        //   this.joinRoom(client, message.data);
        //   break;

        // case 'delete-room':
        //   this.handleDeleteRoom(client, message.data);
        //   break;

        default:
          this.logger.warn(`Unknown event: ${message.event}`);
      }
    } catch (error) {
      this.logger.error('Error parsing message:', error);
    }
  }

  // private handleCreateRoom(client: WebSocket, data: CreateRoomDto) {
  //   try {
  //     if (!data.name || !data.nameRoom) {
  //       this.sendToClient(client, {
  //         event: 'error',
  //         data: { message: 'ชื่อห้องและชื่อผู้สร้างต้องไม่ว่าง' },
  //       });
  //       return;
  //     }

  //     const newRoom = this.roomsService.createRoom(data);
  //     this.logger.log(
  //       `🏠 Room created: ${newRoom.name} (Code: ${newRoom.nameCode})`,
  //     );

  //     // Broadcast ไปหาทุกคน
  //     this.broadcast({
  //       event: 'room-created',
  //       data: newRoom,
  //     });
  //   } catch (error) {
  //     this.logger.error('Error creating room:', error);
  //     this.sendToClient(client, {
  //       event: 'error',
  //       data: { message: 'ไม่สามารถสร้างห้องได้' },
  //     });
  //   }
  // }

  handleNotifyUpdate(event: string, data: Rooms) {
    this.broadcast({
      event: event,
      data: data,
    });
  }

  private joinRoom(client: WebSocket, data: JoinRoomDto) {
    try {
      const room = this.roomsService.joinRoom(data.roomId);
      if (!room) {
        this.sendToClient(client, {
          event: 'error',
          data: { message: 'ไม่พบห้องนี้' },
        });
        return;
      }

      this.sendToClient(client, {
        event: 'join-room',
        data: data,
      });
    } catch (error) {
      this.logger.error('Error joining room:', error);
    }
  }

  private sendToClient(client: WebSocket, message: WebSocketMessage) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }

  private broadcast(message: WebSocketMessage) {
    const payload = JSON.stringify(message);
    this.clients.forEach((clientId, client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }

  private generateClientId(): string {
    return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
