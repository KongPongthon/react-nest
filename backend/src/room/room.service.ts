import { Injectable, Logger } from '@nestjs/common';
import { RoomCreate, RoomList } from './room.interface';
import { RoomStateService } from './room-state.service';

@Injectable()
export class RoomService {
  private readonly logger = new Logger(RoomService.name);

  constructor(private readonly state: RoomStateService) {}

  getAllRooms(): RoomList[] {
    return Array.from(this.state.rooms.values()).map((room) => ({
      id: room.id,
      roomCode: room.roomCode,
    }));
  }

  getRoomById(roomId: string): RoomCreate | undefined {
    return this.state.rooms.get(roomId);
  }

  joinRoom(roomId: string): RoomCreate | undefined {
    const room = this.state.rooms.get(roomId);
    if (!room) return undefined;
    return room;
  }

  createRoom(): RoomCreate {
    const roomId = Date.now();

    const newRoom: RoomCreate = {
      id: roomId,
      roomCode: this.generateRoomCode(),
    };

    this.state.rooms.set(roomId.toString(), newRoom);
    this.logger.log(`🏠 Created room: ${newRoom.roomCode}`);
    return newRoom;
  }

  deleteRoom(roomId: string): boolean {
    const deleted = this.state.rooms.delete(roomId);
    if (deleted) {
      this.logger.log(`🗑️ Deleted room: ${roomId}`);
    }
    return deleted;
  }

  verifyRoomPassword(roomId: number, password?: string): boolean {
    const room = this.state.rooms.get(roomId);
    if (!room) return false;
    if (!room.password) return true;
    return room.password === password;
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'ROOM-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
