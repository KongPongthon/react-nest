import { Injectable } from '@nestjs/common';
import { RoomStateService } from './rooms-state.service';
import { Rooms, UserConnectSocket } from './rooms.interface';
import * as jwt from 'jsonwebtoken';

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
      const newRoom: Rooms = {
        id: roomId,
        roomCode: roomCode,
        createdAt: Date.now().toString(),
        updatedAt: Date.now().toString(),
        createdBy: 'ss',
        updatedBy: 'ss',
      };
      this.RoomStateService.rooms.set(roomCode, newRoom);

      return { success: true };
    } catch (error) {
      console.log('errors', error);
      return { success: false };
    }
  }

  getRoomById(id: number) {
    try {
      const room = Array.from(this.RoomStateService.rooms.values()).find(
        (room) => room.id === id,
      );
      if (!room) {
        return { error: 'Room not found' };
      }
      return room;
    } catch (error) {
      console.log('errors', error);
    }
  }

  joinedRoom(id: number) {
    console.log('Service ID', id);
    const room = Array.from(this.RoomStateService.rooms.values()).find(
      (room) => room.id === id,
    );
    if (!room) {
      return { error: 'Room not found' };
    }
    // this.RoomStateService.roomMembers.set(id.toString(), new Set());
    return room.id;
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'ROOM-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  verify(token: string): UserConnectSocket | null {
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error('JWT_SECRET is not defined in env');
      }
      const payload = jwt.verify(token, secret) as UserConnectSocket;
      return payload;
    } catch (errors) {
      console.error('JWT Verification failed:', errors);
      return null;
    }
  }
}
