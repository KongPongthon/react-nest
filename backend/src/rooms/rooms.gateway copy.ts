// import { Logger } from '@nestjs/common';
// import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
// import { Server, WebSocket } from 'ws';
// import { WebSocketMessage } from './rooms.interface';
// import { RoomStateService } from './rooms-state.service';
// import { RoomsService } from './rooms.service';
// import { IncomingMessage } from 'http';

// @WebSocketGateway({
//   cors: {
//     origin: '*',
//   },
// })
// export class RoomsGateway {
//   @WebSocketServer()
//   server: Server;

//   private readonly logger = new Logger(RoomsGateway.name);

//   constructor(
//     private readonly RoomStateService: RoomStateService,
//     private readonly RoomService: RoomsService,
//   ) {}

//   handleConnection(client: WebSocket, request: IncomingMessage) {
//     const url = new URL(request.url ?? '', 'http://localhost');
//     const token = url.searchParams.get('token');

//     if (!token && typeof token !== 'string') {
//       client.close();
//       return;
//     }

//     const decoded = this.RoomService.verify(token?.toString() ?? '');

//     if (!decoded || !decoded.id) {
//       this.sendToClient(client, {
//         event: 'error',
//         data: { message: 'Token not found' },
//       });
//       client.close();
//       return;
//     }
//     const userId = decoded.id;

//     const existingSocket = this.RoomStateService.socketByUser.get(userId);
//     if (existingSocket && existingSocket !== client) {
//       existingSocket.close(1000, 'Replaced by new socket');
//       this.RoomStateService.clients.delete(existingSocket);

//       const roomId = this.RoomStateService.userToRoom.get(userId);
//       console.log('Room ID and User ID :', roomId, userId);

//       if (roomId) this.performLeaveRoom(userId, roomId);
//     }
//     this.RoomStateService.clients.set(client, userId);
//     this.RoomStateService.socketByUser.set(userId, client);

//     this.logger.log(
//       `✅ Client connected: ${userId} (Total: ${this.RoomStateService.clients.size})`,
//     );
//     try {
//       const rooms = this.RoomService.getRoom();
//       this.logger.log(`📤 Sending ${rooms.length} rooms to ${userId}`);

//       this.sendToClient(client, {
//         event: 'rooms-list',
//         data: rooms,
//       });
//       this.sendToClient(client, {
//         event: 'connect',
//         data: { username: userId },
//       });
//       client.on('message', (data: Buffer) => {
//         this.handleMessage(client, data);
//       });
//     } catch (error) {
//       this.logger.error(`Error sending rooms list: ${error}`);
//       this.sendToClient(client, {
//         event: 'error',
//         data: { message: 'Failed to load rooms' },
//       });
//     }
//   }

//   handleDisconnect(client: WebSocket) {
//     const userId = this.RoomStateService.clients.get(client);
//     if (!userId) return;
//     this.logger.log(
//       `❌ Client disconnected: ${userId} (Total: ${this.RoomStateService.clients.size})`,
//     );

//     this.RoomStateService.clients.delete(client);
//     this.RoomStateService.socketByUser.delete(userId);

//     setTimeout(() => {
//       const stillConnected = this.RoomStateService.socketByUser.get(userId);
//       if (!stillConnected) {
//         // const roomId = this.RoomStateService.userToRoom.get(userId);
//         // if (roomId) this.performLeaveRoom(userId, roomId);
//       }
//     }, 5000);
//   }

//   private performLeaveRoom(clientId: string, roomId: string) {
//     // console.log('roomID', roomId);
//     // ลบออกจากห้อง
//     if (roomId) {
//       this.RoomStateService.rooms.delete(roomId);
//       this.RoomStateService.roomMembers.delete(roomId);
//       this.RoomStateService.roomSessions?.delete(roomId);
//     }

//     if (!clientId) return;

//     // this.RoomStateService.clientToRoom.delete(clientSocket);

//     this.RoomStateService.userToRoom.delete(clientId);
//     // const remainingCount = roomMembers.size;

//     // if (remainingCount > 0) {
//     //   // ส่งข่าวบอกคนที่เหลือ
//     //   this.broadcastToRoom(roomId, {
//     //     event: 'leave-room',
//     //     data: {
//     //       username: clientId,
//     //       memberCount: remainingCount,
//     //     },
//     //   });
//     // } else {
//     //   // ถ้าไม่เหลือใครเลย ล้างข้อมูลห้องให้เกลี้ยง
//     //   this.RoomStateService.roomMembers.delete(clientId);
//     //   this.RoomStateService.roomSeats?.delete(clientId); // อย่าลืมลบที่นั่งด้วย!
//     //   this.logger.log(`🗑️ Room ${clientId} has been cleaned up.`);
//     // }
//   }

//   // 2. แก้ไข handleJoinRoom ให้เรียกใช้ฟังก์ชันกลาง
//   handleJoinRoom(clientId: string, roomId: string) {
//     //   if (!clientId) {
//     //     return;
//     //   }

//     //   const oldRoomId = this.RoomStateService.socketByUser.get(clientId);

//     //   if (oldRoomId) {
//     //     this.performLeaveRoom(oldRoomId, roomId);
//     //   }

//     //   // --- ส่วนการ Join ห้องใหม่ ---
//     //   if (!this.RoomStateService.roomMembers.has(roomId)) {
//     //     this.RoomStateService.roomMembers.set(roomId, new Set<clientId>());
//     //   }

//     //   this.RoomStateService.roomMembers.get(roomId)?.add(clientSocket);
//     //   this.RoomStateService.clientToRoom.set(clientSocket, roomId);

//     if (!clientId || !roomId) {
//       return;
//     }
//     const oldSocket = this.RoomStateService.socketByUser.get(
//       clientId,
//     ) as WebSocket;

//     if (oldSocket) {
//       this.performLeaveRoom(clientId, roomId);
//     }

//     // --- ส่วนการ Join ห้องใหม่ ---
//     if (!this.RoomStateService.roomMembers.has(roomId)) {
//       this.RoomStateService.roomMembers.set(roomId, new Set<string>());
//     }
//     this.RoomStateService.roomMembers.get(roomId)?.add(clientId);
//     this.RoomStateService.socketByUser.set(clientId, oldSocket);
//     this.RoomStateService.userToRoom.set(clientId, roomId);

//     this.broadcastToRoom(roomId, {
//       event: 'join-room',
//       data: {
//         username: '',
//         memberCount: '',
//       },
//     });
//   }

//   private handleMessage(client: WebSocket, data: Buffer) {
//     try {
//       const message: WebSocketMessage = JSON.parse(
//         data.toString(),
//       ) as WebSocketMessage;

//       const clientId = this.RoomStateService.clients.get(client) || 'unknown';
//       this.logger.log(
//         `📨 Message from ${clientId}: ${message.event} ${message.data}`,
//       );
//       let roomId: string | undefined;
//       // let clientSocket: WebSocket | undefined;
//       switch (message.event) {
//         case 'leave_room':
//           console.log('=== DEBUG leave_room ===');
//           console.log(
//             'incoming client object id exists in clients map:',
//             this.RoomStateService.clients.has(client),
//           );

//           // clientSocket = this.findSocketById(message.data);
//           // if (!clientSocket) {
//           //   console.log(`❌ ไม่พบ Socket สำหรับ idConnect: ${message.data}`);
//           //   return;
//           // }
//           // roomId = this.RoomStateService.clientToRoom.get(clientSocket);
//           console.log('roomId', roomId, clientId, message.data);
//           // if (roomId) {
//           //   this.performLeaveRoom(client, roomId);
//           // }
//           break;
//         default:
//           this.logger.warn(`Unknown event: ${message.event}`);
//       }
//     } catch (error) {
//       this.logger.error('Error parsing message:', error);
//     }
//   }

//   handleNotifyUpdate<T>(event: string, data: T) {
//     this.broadcast({
//       event: event,
//       data: data,
//     });
//   }

//   handleNOtifyRoomUpdate<T>(roomId: string, event: string, data: T) {
//     this.broadcastToRoom(roomId, {
//       event: event,
//       data: data,
//     });
//   }

//   private sendToClient(client: WebSocket, message: WebSocketMessage) {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send(JSON.stringify(message));
//     }
//   }

//   private broadcastToRoom(roomId: string, message: WebSocketMessage) {
//     console.log(
//       `📢 กำลังจะ Broadcast ไปที่ห้อง: ${roomId} (Type: ${typeof roomId})`,
//     );
//     const members = this.RoomStateService.roomMembers.get(roomId);
//     if (!members) {
//       console.log(
//         `⚠️ ไม่พบสมาชิกในห้อง ${roomId} ใน Map (อาจจะลืม .set() หรือ Key ไม่ตรง)`,
//       );
//       console.log(
//         'ปัจจุบันมีห้องในระบบ:',
//         Array.from(this.RoomStateService.roomMembers.keys()),
//       );
//       return;
//     }
//     console.log(`✅ พบสมาชิกในห้อง ${roomId} จำนวน ${members.size} คน`);
//     const payload = JSON.stringify(message);
//     console.log(payload);

//     // members.forEach((member) => {
//     //   if (member.readyState === WebSocket.OPEN) {
//     //     member.send(payload);
//     //   }
//     // });
//   }

//   private broadcast(message: WebSocketMessage) {
//     const payload = JSON.stringify(message);
//     this.server.clients.forEach((client) => {
//       if (client.readyState === WebSocket.OPEN) {
//         client.send(payload);
//       }
//     });
//   }

//   sitdownNew(client: string, index: number, email: string, id: string) {
//     const clientSocket = this.findSocketById(client);

//     console.log(index, email, id);

//     if (!clientSocket) {
//       console.log(`❌ ไม่พบ Socket สำหรับ idConnect: ${clientSocket}`);
//       return;
//     }
//     // const oldRoomId = this.RoomStateService.clientToRoom.get(clientSocket);
//     // if (oldRoomId) {
//     //   const oldRoomMembers = this.RoomStateService.roomMembers.get(oldRoomId);
//     //   console.log('oldRoomMembers', oldRoomMembers);
//     // }

//     // const roomId = this.RoomStateService.clientToRoom.get(clientSocket);
//     // if (roomId) {
//     //   // this.sitdown(roomId, { index, id: client, email: email });
//     //   if (!this.RoomStateService.roomSeats.has(roomId)) {
//     //     this.RoomStateService.roomSeats.set(roomId, new Map());
//     //   }
//     //   const seats = this.RoomStateService.roomSeats.get(roomId);
//     //   if (!seats) return;
//     //   const myCurrentSeatIndex = Array.from(seats.entries()).find(
//     //     // eslint-disable-next-line
//     //     ([_, seat]) => seat.userId === id,
//     //   )?.[0];
//     //   const existingInSeat = seats.get(index);
//     //   if (existingInSeat && existingInSeat.userId === id) {
//     //     seats.delete(index);
//     //   } else if (!existingInSeat) {
//     //     if (myCurrentSeatIndex !== undefined) {
//     //       seats.delete(myCurrentSeatIndex);
//     //     }
//     //     seats.set(index, { userId: id, userName: email, index });
//     //   } else {
//     //     console.log(`⚠️ ที่นั่ง ${index} มีคนนั่งอยู่แล้ว`);
//     //     return;
//     //   }
//     //   const updatedSeats = Array.from(seats.values());
//     //   console.log('updatedSeats', updatedSeats);

//     //   // **Broadcast ไปยังทุกคนในห้องผ่าน method ที่มีอยู่แล้ว**
//     //   this.broadcastToRoom(roomId, {
//     //     event: 'update-seats',
//     //     data: {
//     //       seats: updatedSeats,
//     //       roomId: roomId,
//     //     },
//     //   });
//     // } else {
//     //   this.logger.warn(`❌ Client ${roomId} ยังไม่ได้ join room`);
//     //   clientSocket.send(
//     //     JSON.stringify({
//     //       event: 'error',
//     //       data: { message: 'กรุณา join room ก่อน' },
//     //     }),
//     //   );
//     // }
//   }

//   private generateClientId(): string {
//     return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
//   }

//   findSocketById(clientId: string): WebSocket | undefined {
//     for (const [socket, id] of this.RoomStateService.clients.entries()) {
//       if (id === clientId) {
//         return socket;
//       }
//     }
//     return undefined;
//   }
// }
