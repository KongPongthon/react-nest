import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import {
  CardMeta,
  Participant,
  SeatInfo,
  WebSocketMessage,
} from './rooms.interface';
import { RoomStateService } from './rooms-state.service';
import { RoomsService } from './rooms.service';
import { IncomingMessage } from 'http';
@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
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

    this.logger.log('url', request.url);

    const token = url.searchParams.get('token');

    console.log('token', token);

    if (!token) {
      client.close(1008, 'Unauthorized');
      return;
    }

    const decoded = this.RoomService.verify(token?.toString() ?? '');

    if (!decoded || !decoded.id) {
      this.logger.warn('Token not found');
      this.sendToClient(client, {
        event: 'error',
        data: { message: 'Token not found' },
      });

      client.close();
      return;
    }

    const userId = decoded.id;
    console.log('userId', userId, typeof userId);

    const existingSocket = this.RoomStateService.socketByUser.get(userId);
    if (existingSocket && existingSocket !== client) {
      const oldRoomId = this.RoomStateService.userToRoom.get(userId);
      if (oldRoomId) {
        this.performLeaveRoom(userId, oldRoomId); // ← leave room ก่อน
        existingSocket.close(1000, 'Replaced by new socket');
      }

      this.RoomStateService.clients.delete(existingSocket);
    }

    this.RoomStateService.clients.set(client, userId);
    this.RoomStateService.socketByUser.set(userId, client);

    try {
      const rooms = this.RoomService.getRoom();

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
    if (!roomId) return;

    if (!clientId) return;
    this.RoomStateService.roomSessions.delete(roomId);
    this.RoomStateService.userToRoom.delete(clientId);
  }

  handleJoinRoom(clientId: string, roomId: string, email: string) {
    console.log('roomId', roomId);

    if (!roomId) {
      throw new HttpException('Room not found', HttpStatus.NOT_FOUND);
    }

    console.log('clientId, roomId', clientId, roomId);

    this.RoomStateService.userToRoom.set(clientId, roomId);
    // this.RoomStateService.roomMembers.get(roomId)?.add(clientId);
    const room = this.RoomStateService.roomSessions.get(roomId);

    if (!room) {
      this.logger.error('room not found');
      throw new HttpException('Room not found', HttpStatus.NOT_FOUND);
    }

    this.logger.debug(`Check room : ${JSON.stringify(room)}`);

    if (!room.participants) {
      room.participants = new Map<string, Participant>();
    }

    room.participants.set(clientId, {
      userId: clientId,
      username: email,
      socketId: clientId,
      joinedAt: new Date(),
    });

    const getRoom = this.RoomStateService.roomSessions.get(roomId);

    if (!getRoom) return;

    getRoom.participants?.forEach((member) => {
      console.log('member', member);
      const userInroom = this.RoomStateService.socketByUser.get(member.userId);
      if (!userInroom) return console.log('userInroom', userInroom);
      this.sendToClient(userInroom, {
        event: 'update-room',
        data: { username: member.username },
      });
    });
  }

  private handleMessage(client: WebSocket, data: Buffer) {
    try {
      const message: WebSocketMessage = JSON.parse(
        data.toString(),
      ) as WebSocketMessage;
      const clientId = this.RoomStateService.clients.get(client) || 'unknown';
      switch (message.event) {
        case 'leave_room':
          console.log('=== DEBUG leave_room ===');
          console.log(
            'incoming client object id exists in clients map:',
            this.RoomStateService.clients.has(client),
          );
          break;
        case 'create-card': {
          const createCardPayload = message.data as {
            roomId: string;
            title: string;
            description?: string;
            link?: string;
          };

          if (!createCardPayload.roomId) return;

          const room = this.RoomStateService.roomSessions.get(
            createCardPayload.roomId,
          );

          if (!room) return;

          if (!room.cards) {
            room.cards = new Map<string, CardMeta>();
          }
          // room.

          // const cardId = this.generateOption('card');

          // const newCard: CardMeta = {
          //   cardId: cardId,
          //   title: createCardPayload.title,
          //   description: createCardPayload.description,
          //   link: createCardPayload.link,
          //   createdBy: clientId,
          //   createdAt: new Date(),
          //   status: 'issue',
          // };

          // if (room.cards.get(createCardPayload.roomId)) {
          //   room.cards.get(createCardPayload.roomId)?.push(newCard);
          // } else {
          //   room.cards.set(createCardPayload.roomId, [newCard]);
          // }

          // const card = room.cards.get(createCardPayload.roomId);

          // room.participants.forEach((member) => {
          //   const userInroom = this.RoomStateService.socketByUser.get(
          //     member.userId,
          //   );
          //   if (!userInroom) return console.log('userInroom', userInroom);
          //   this.sendToClient(userInroom, {
          //     event: 'create-card',
          //     data: card,
          //   });
          // });

          const cardId = this.generateOption('card');

          const newCard: CardMeta = {
            cardId: cardId,
            title: createCardPayload.title,
            description: createCardPayload.description,
            link: createCardPayload.link,
            createdBy: clientId,
            createdAt: new Date(),
            status: 'issue',
          };

          room.cards.set(cardId, newCard);

          const card = room.cards;

          room.participants?.forEach((member) => {
            const userInroom = this.RoomStateService.socketByUser.get(
              member.userId,
            );
            if (!userInroom) return console.log('userInroom', userInroom);
            this.sendToClient(userInroom, {
              event: 'create-card',
              data: Array.from(card.values()),
            });
          });
          break;
        }
        case 'select-card': {
          const { cardId, roomId } = message.data as {
            cardId: string;
            roomId: string;
          };
          console.log('Card ID:', cardId, roomId);

          const room = this.RoomStateService.roomSessions.get(roomId);
          if (!room || !room.cards) return this.logger.error('room not found');

          room.cards.forEach((card) => {
            card.status = 'issue';
          });

          const cardOld = room?.cards.get(cardId);

          if (!cardOld) return this.logger.error('card not found');
          cardOld.status = 'now';
          room.cards.set(cardId, cardOld);

          const cardNew = room.cards;

          room.participants?.forEach((member) => {
            const userInroom = this.RoomStateService.socketByUser.get(
              member.userId,
            );
            if (!userInroom) return console.log('userInroom', userInroom);
            this.sendToClient(userInroom, {
              event: 'create-card',
              data: Array.from(cardNew.values()),
            });
          });

          break;
        }
        case 'update-score': {
          const updateScorePayload = message.data as {
            roomId: string;
            idConnect: string;
          };
          console.log('=== DEBUG update-score ===');
          console.log(
            'incoming client object id exists in clients map:',
            this.RoomStateService.clients.has(client),
            message.event,
            updateScorePayload,
          );
          const roomUpdateScore = this.RoomStateService.roomSessions.get(
            updateScorePayload.roomId,
          );
          if (!roomUpdateScore) return;

          break;
        }
        case 'start-vote': {
          console.log('start-vote', message.data);
          const roomId = message.data as string;
          const room = this.RoomStateService.roomSessions.get(roomId);
          if (!room) return this.logger.error('room not found');
          const expireAt = new Date();
          room.cooldownVoteTime = expireAt;
          room.duration = 15000;
          console.log('Check Time', expireAt, 15000);

          const targetTime = expireAt.getTime() + 15000;
          console.log('targetTime', targetTime);

          room.participants?.forEach((member) => {
            const userInroom = this.RoomStateService.socketByUser.get(
              member.userId,
            );
            if (!userInroom) return console.log('userInroom', userInroom);
            this.sendToClient(userInroom, {
              event: 'start-vote',
              data: targetTime,
            });
          });

          break;
        }
        case 'stop-vote': {
          console.log('stop-vote', message.data);
          const roomId = message.data as string;
          const room = this.RoomStateService.roomSessions.get(roomId);
          if (!room) return this.logger.error('room not found');
          room.cooldownVoteTime = null;
          room.duration = 0;
          room.participants?.forEach((member) => {
            const userInroom = this.RoomStateService.socketByUser.get(
              member.userId,
            );
            if (!userInroom) return console.log('userInroom', userInroom);
            this.sendToClient(userInroom, {
              event: 'start-vote',
              data: 0,
            });
          });

          break;
        }
        default:
          this.logger.warn(`Unknown event: ${message.event}`);
      }
    } catch (error) {
      this.logger.error('Error parsing message:', error);
    }
  }

  private sendToClient(client: WebSocket, message: WebSocketMessage) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }

  sitdownNew(index: number, id: string, email: string) {
    try {
      console.log(index, id, email);

      console.log('UserToRoom', this.RoomStateService.userToRoom, id);

      const roomId = this.RoomStateService.userToRoom.get(id);

      if (!roomId) {
        console.log(`❌ ไม่พบห้องสำหรับ ID: ${id} ${typeof id} roomId`);
        return;
      }
      const sessions = this.RoomStateService.roomSessions.get(roomId);

      if (!sessions) {
        console.log(
          `❌ ไม่พบห้องสำหรับ ID: ${roomId} ${typeof roomId} sessions`,
        );
        return;
      }

      if (!sessions.seats) {
        sessions.seats = new Map<number, SeatInfo>();
      }

      // ลบที่นั่งเก่าของ user คนนี้ออกก่อน (ถ้ามี)
      let oldSitIndex: number | null = null;
      for (const [seatIndex, seat] of sessions.seats.entries()) {
        const hasUser = seat.userId === id;
        if (hasUser) {
          oldSitIndex = seatIndex;
          sessions.seats.delete(seatIndex);
          break;
        }
      }

      // ถ้ากดที่เดิม → toggle ออก แล้วหยุดเลย ไม่ต้องนั่งใหม่
      if (oldSitIndex !== index) {
        // นั่งที่ใหม่ (ถ้าที่นั้นว่าง)
        if (!sessions.seats.has(index)) {
          const role = sessions.hostId === id ? 'host' : 'guest';
          sessions.seats.set(index, {
            userId: id,
            userName: email,
            index: index,
            role: role,
          });
        }
      }

      if (!sessions.participants || !sessions.seats) return;

      const seats = sessions.seats;
      sessions.participants.forEach((member) => {
        const userInroom = this.RoomStateService.socketByUser.get(
          member.userId,
        );
        if (!userInroom) return console.log('userInroom', userInroom);
        this.sendToClient(userInroom, {
          event: 'update-seats',
          data: {
            seats: Array.from(seats.values()),
          },
        });
      });

      // members.participants?.forEach((member) => {
      //   const userInroom = this.RoomStateService.socketByUser.get(
      //     member.userId,
      //   );
      //   if (!userInroom) return console.log('userInroom', userInroom);
      //   this.sendToClient(userInroom, {
      //     event: 'update-seats',
      //     data: {
      //       seats: members?.seats.get(index) ?? [],
      //     },
      //   });
      // });
    } catch (error) {
      console.log('TESTERROR', error);
    }
  }

  handleNotifyUpdate<T>(event: string, data: T) {
    this.broadcast({
      event: event,
      data: data,
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

  private generateOption(value: string): string {
    return `${value}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
