import { Injectable } from '@nestjs/common';
import { RoomStateService } from './rooms-state.service';
import { Rooms } from './rooms.interface';

@Injectable()
export class RoomsService {
  constructor(private readonly RoomStateService: RoomStateService) {}
  getRoom(): Rooms[] {
    return Array.from(this.RoomStateService.rooms.values()).flat();
  }

  createdRoom() {
    try {
      const roomCode = this.generateRoomCode();
      const roomId = Date.now();
      const room = {
        id: roomId,
        roomCode: roomCode,
        isClosed: false,
        createdAt: Date.now().toString(),
        updatedAt: Date.now().toString(),
        createdBy: 'ss',
        updatedBy: 'ss',
      };
      this.RoomStateService.rooms.set(roomCode, [room]);

      return { success: true };
    } catch (error) {
      console.log('errors', error);
      return { success: false };
    }
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
