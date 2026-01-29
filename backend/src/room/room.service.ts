import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { RoomCreate, RoomList } from './room.interface';
import { CreateRoomDto } from './room.dto';
import { RoomsGateway } from './room.gateway';

@Injectable()
export class RoomService {
  private readonly logger = new Logger(RoomService.name);
  private roomsMap = new Map<number, RoomCreate>();

  constructor(
    @Inject(forwardRef(() => RoomsGateway)) // ต้องใส่ forwardRef ตรงนี้
    private readonly roomsGateway: RoomsGateway,
  ) {
    // ข้อมูลเริ่มต้น
    const room1: RoomCreate = {
      id: 1,
      nameCode: 'ROOM-ABC123',
      name: 'ห้อง A',
      password: undefined,
      listMember: null,
    };
    const room2: RoomCreate = {
      id: 2,
      nameCode: 'ROOM-XYZ789',
      name: 'ห้อง B',
      password: '1234',
      listMember: null,
    };

    this.roomsMap.set(1, room1);
    this.roomsMap.set(2, room2);

    this.logger.log('✅ RoomsService initialized with 2 rooms');
  }

  getAllRooms(): RoomList[] {
    return Array.from(this.roomsMap.values()).map((room) => ({
      id: room.id,
      nameCode: room.nameCode,
    }));
  }

  getRoomById(roomId: number): RoomCreate | undefined {
    return this.roomsMap.get(roomId);
  }

  joinRoom(roomId: number): RoomCreate | undefined {
    const room = this.roomsMap.get(roomId);
    if (!room) return undefined;

    if (room.listMember) return undefined;

    room.listMember = [roomId];
    return room;
  }

  createRoom(createRoomDto: CreateRoomDto): RoomCreate {
    const roomId = Date.now();

    const newRoom: RoomCreate = {
      id: roomId,
      nameCode: this.generateRoomCode(),
      name: createRoomDto.name,
      password: createRoomDto.password,
      listMember: null,
    };

    this.roomsMap.set(roomId, newRoom);
    this.logger.log(`🏠 Created room: ${newRoom.nameCode}`);
    this.roomsGateway.handleNotifyUpdate('room-created', newRoom);
    return newRoom;
  }

  deleteRoom(roomId: number): boolean {
    const deleted = this.roomsMap.delete(roomId);
    if (deleted) {
      this.logger.log(`🗑️ Deleted room: ${roomId}`);
    }
    return deleted;
  }

  verifyRoomPassword(roomId: number, password?: string): boolean {
    const room = this.roomsMap.get(roomId);
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
