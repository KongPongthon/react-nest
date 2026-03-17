import { Body, Injectable } from '@nestjs/common';
import { RoomStateService } from './rooms-state.service';
import {
  CardMeta,
  Participant,
  RoomSession,
  SeatInfo,
  UserConnectSocket,
} from './rooms.interface';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class RoomsService {
  constructor(private readonly RoomStateService: RoomStateService) { }
  getRoom(): RoomSession[] {
    const rooms = Array.from(
      this.RoomStateService.roomSessions.values(),
    ).flat();

    return rooms;
  }

  createdRoom(id: string) {
    try {
      const roomCode = this.generateRoomCode();
      const roomId = Date.now();
      const newRoom = {
        id: roomId,
        roomCode: roomCode,
        hostId: id,
        participants: new Map<string, Participant>(),
        seats: new Map<number, SeatInfo[]>(),
        cards: new Map<string, CardMeta[]>
      };
      this.RoomStateService.roomSessions.set(roomId.toString(), newRoom);
      // this.RoomStateService.roomMembers.set(roomId.toString(), new Set());

      return { success: true };
    } catch (error) {
      console.log('errors', error);
      return { success: false };
    }
  }

  getRoomById(id: number): Participant[] | { error: string } {
    try {
      const room = Array.from(this.RoomStateService.roomSessions.values()).find(
        (room) => room.id === id,
      );
      if (!room) {
        return { error: 'Room not found' };
      }

      const participants = Array.from(room.participants.values());

      return participants;
    } catch (error) {
      console.log('errors', error);
      throw error;
    }
  }

  joinedRoom(roomCode: string): string {
    console.log('Service roomCode', roomCode);
    const room = Array.from(this.RoomStateService.roomSessions.values()).find(
      (room) => room.roomCode === roomCode,
    );
    if (!room) {
      return 'Room not found';
    }
    console.log('Room list', room);

    // this.RoomStateService.roomMembers.set(id.toString(), new Set());
    return room.id.toString();
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
