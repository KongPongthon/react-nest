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

    console.log('Path:', url.pathname);
    const token = url.searchParams.get('token');

    if (!token && typeof token !== 'string') {
      this.sendToClient(client, {
        event: 'error',
        data: { message: 'Token not found' },
      });
    }

    const check_token = this.RoomService.verify(token?.toString() ?? '');

    if (!check_token) {
      this.sendToClient(client, {
        event: 'error',
        data: { message: 'Token not found' },
      });
    }
    const existingSocket = this.findSocketById(check_token.id);
    console.log('existing socket found?', !!existingSocket);
    console.log('existing === new client?', existingSocket === client);

    this.logger.log('check_token', check_token);

    if (existingSocket && existingSocket !== client) {
      const oldRoomId = this.RoomStateService.clientToRoom.get(existingSocket);
      if (oldRoomId) {
        this.performLeaveRoom(existingSocket, oldRoomId);
      }
      this.RoomStateService.clients.delete(existingSocket);
      existingSocket.terminate();
    }

    this.RoomStateService.clients.set(client, check_token.id);

    this.logger.log(
      `✅ Client connected: ${check_token.id} (Total: ${this.RoomStateService.clients.size})`,
    );
    try {
      const rooms = this.RoomService.getRoom();
      this.logger.log(`📤 Sending ${rooms.length} rooms to ${check_token.id}`);

      this.sendToClient(client, {
        event: 'rooms-list',
        data: rooms,
      });
      this.sendToClient(client, {
        event: 'connect',
        data: { username: check_token.id },
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
    const roomID = this.RoomStateService.clientToRoom.get(client);
    if (roomID) {
      this.RoomStateService.roomMembers.get(roomID)?.delete(client);
      if (this.RoomStateService.roomMembers.get(roomID)?.size === 0) {
        this.RoomStateService.roomMembers.delete(roomID);
      }
    }
    this.RoomStateService.clients.delete(client);
    this.RoomStateService.clientToRoom.delete(client);
  }

  private performLeaveRoom(clientSocket: WebSocket, roomId: string) {
    console.log('roomID', roomId);

    const roomMembers = this.RoomStateService.roomMembers.get(roomId);
    if (!roomMembers) return;

    // ลบออกจากห้อง
    roomMembers.delete(clientSocket);
    this.RoomStateService.clientToRoom.delete(clientSocket);

    const remainingCount = roomMembers.size;

    if (remainingCount > 0) {
      // ส่งข่าวบอกคนที่เหลือ
      this.broadcastToRoom(roomId, {
        event: 'leave-room',
        data: {
          username: this.RoomStateService.clients.get(clientSocket),
          memberCount: remainingCount,
        },
      });
    } else {
      // ถ้าไม่เหลือใครเลย ล้างข้อมูลห้องให้เกลี้ยง
      this.RoomStateService.roomMembers.delete(roomId);
      this.RoomStateService.roomSeats?.delete(roomId); // อย่าลืมลบที่นั่งด้วย!
      this.logger.log(`🗑️ Room ${roomId} has been cleaned up.`);
    }
  }

  // handleJoinRoom(client: string, roomId: string) {
  //   const clientSocket = this.findSocketById(client);
  //   if (!clientSocket) {
  //     console.log(`❌ ไม่พบ Socket สำหรับ idConnect: ${clientSocket}`);
  //     return;
  //   }
  //   const oldRoomId = this.RoomStateService.clientToRoom.get(clientSocket);

  //   if (oldRoomId === roomId) {
  //     return;
  //   }

  //   if (oldRoomId) {
  //     const oldRoomMembers = this.RoomStateService.roomMembers.get(oldRoomId);
  //     if (oldRoomMembers) {
  //       oldRoomMembers.delete(clientSocket);

  //       if (oldRoomMembers.size === 0) {
  //         this.RoomStateService.roomMembers.delete(oldRoomId);
  //       } else {
  //         this.broadcastToRoom(oldRoomId, {
  //           event: 'leave-room',
  //           data: {
  //             username: this.RoomStateService.clients.get(clientSocket),
  //             memberCount: oldRoomMembers.size,
  //           },
  //         });
  //       }
  //     }
  //   }

  //   if (!this.RoomStateService.roomMembers.has(roomId)) {
  //     this.RoomStateService.roomMembers.set(roomId, new Set<WebSocket>());
  //   }
  //   this.RoomStateService.roomMembers?.get(roomId)?.add(clientSocket);
  //   this.RoomStateService.clientToRoom.set(clientSocket, roomId);
  //   this.broadcastToRoom(roomId, {
  //     event: 'join-room',
  //     data: {
  //       username: this.RoomStateService.clients.get(clientSocket),
  //       memberCount: this.RoomStateService.roomMembers.get(roomId)?.size,
  //     },
  //   });
  // }

  // 2. แก้ไข handleJoinRoom ให้เรียกใช้ฟังก์ชันกลาง
  handleJoinRoom(clientId: string, roomId: string) {
    const clientSocket = this.findSocketById(clientId);
    if (!clientSocket) return;

    const oldRoomId = this.RoomStateService.clientToRoom.get(clientSocket);
    if (oldRoomId === roomId) return;

    if (oldRoomId) {
      this.performLeaveRoom(clientSocket, oldRoomId);
    }

    // --- ส่วนการ Join ห้องใหม่ ---
    if (!this.RoomStateService.roomMembers.has(roomId)) {
      this.RoomStateService.roomMembers.set(roomId, new Set<WebSocket>());
    }

    this.RoomStateService.roomMembers.get(roomId)?.add(clientSocket);
    this.RoomStateService.clientToRoom.set(clientSocket, roomId);

    this.broadcastToRoom(roomId, {
      event: 'join-room',
      data: {
        username: this.RoomStateService.clients.get(clientSocket),
        memberCount: this.RoomStateService.roomMembers.get(roomId)?.size,
      },
    });
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
      let roomId: string | undefined;
      switch (message.event) {
        case 'leave_room':
          console.log('=== DEBUG leave_room ===');
          console.log(
            'incoming client object id exists in clients map:',
            this.RoomStateService.clients.has(client),
          );

          // แสดงทุก socket ใน clientToRoom
          this.RoomStateService.clientToRoom.forEach((room, ws) => {
            console.log(
              'ws === client:',
              ws === client, // true = object เดียวกัน
              '| clientId:',
              this.RoomStateService.clients.get(ws),
              '| room:',
              room,
            );
          });

          roomId = this.RoomStateService.clientToRoom.get(client);
          console.log('roomId', roomId, clientId, message.data);
          if (roomId) {
            this.performLeaveRoom(client, roomId);
          }
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

  sitdownNew(client: string, index: number, email: string, id: string) {
    const clientSocket = this.findSocketById(client);

    if (!clientSocket) {
      console.log(`❌ ไม่พบ Socket สำหรับ idConnect: ${clientSocket}`);
      return;
    }
    const oldRoomId = this.RoomStateService.clientToRoom.get(clientSocket);
    if (oldRoomId) {
      const oldRoomMembers = this.RoomStateService.roomMembers.get(oldRoomId);
      console.log('oldRoomMembers', oldRoomMembers);
    }

    const roomId = this.RoomStateService.clientToRoom.get(clientSocket);
    if (roomId) {
      // this.sitdown(roomId, { index, id: client, email: email });
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
        seats.set(index, { userId: id, userName: email, index });
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
    } else {
      this.logger.warn(`❌ Client ${roomId} ยังไม่ได้ join room`);
      clientSocket.send(
        JSON.stringify({
          event: 'error',
          data: { message: 'กรุณา join room ก่อน' },
        }),
      );
    }
  }

  checkUserInRoom(client: string): boolean {
    const clientSocket = this.findSocketById(client);
    if (clientSocket) {
      const roomId = this.RoomStateService.clientToRoom.get(clientSocket);
      if (roomId) {
        this.broadcast({
          event: 'error',
          data: { message: 'User already in room' },
        });
        return false;
      }
      return true;
    }
    return true;
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

  findSocketByRoomId(roomId: string): WebSocket | undefined {
    for (const [socket, id] of this.RoomStateService.clientToRoom.entries()) {
      if (id === roomId) {
        return socket;
      }
    }
    return undefined;
  }
}
