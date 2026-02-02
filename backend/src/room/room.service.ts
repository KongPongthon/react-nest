import { Injectable, Logger } from '@nestjs/common';
import { RoomList, Rooms } from './room.interface';
import { RoomStateService } from './room-state.service';

@Injectable()
export class RoomService {
  private readonly logger = new Logger(RoomService.name);

  constructor(private readonly state: RoomStateService) {}

  getAllRooms(): RoomList[] {
    console.log(
      'this',
      typeof this.state,
      Array.from(this.state.rooms.values()),
    );
    const response: RoomList[] = [];

    for (const room of this.state.rooms.values()) {
      response.push({
        id: room.id,
        roomCode: room.roomCode,
      });
    }
    return response;
  }

  joinRoom(id: string): Rooms | undefined {
    console.log('ID Join >>>>', id);

    const room = Array.from(this.state.rooms.values()).find(
      (r) => r.id === +id,
    );
    console.log('testJoinroom', room);

    if (!room) return undefined;
    return room;
  }

  createRoom(): Rooms {
    const roomId = Date.now();
    console.log('roomID', roomId);

    const newRoom: Rooms = {
      id: roomId,
      roomCode: this.generateRoomCode(),
      createdAt: new Date().toISOString(),
      createdBy: 'admin',
      updateAt: new Date().toISOString(),
      updateBy: 'admin',
      isClosed: false,
    };

    this.state.rooms.set(roomId.toString(), newRoom);
    this.logger.log(`🏠 Created room: ${newRoom.roomCode}`);

    // this.state.rooms.set(roomId.toString(), newRoom);
    // this.logger.log(`🏠 Created room: ${newRoom.roomCode}`);
    return newRoom;
  }

  deleteRoom(roomId: string): boolean {
    const deleted = this.state.rooms.delete(roomId);
    if (deleted) {
      this.logger.log(`🗑️ Deleted room: ${roomId}`);
    }
    return deleted;
  }

  // verifyRoomPassword(roomId: number, password?: string): boolean {
  //   const room = this.state.rooms.get(roomId);
  //   if (!room) return false;
  //   if (!room.password) return true;
  //   return room.password === password;
  // }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'ROOM-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
