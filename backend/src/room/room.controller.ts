import { Body, Controller, Get, Post } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomsGateway } from './room.gateway';

@Controller('room')
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    private readonly roomGateway: RoomsGateway,
  ) {}
  @Get()
  getRoom() {
    console.log('test', this.roomService.getAllRooms());

    const data = this.roomService.getAllRooms();

    if (!data) {
      return { message: 'Room not found' };
    }

    return data;
  }
  @Post('/join')
  joinRoom(@Body() body: { id: string }) {
    const id = body.id;
    console.log('Join ID', id);

    const room = this.roomService.joinRoom(id);
    if (!room) {
      return { message: 'Room not found' };
    }
    this.roomGateway.handleNotifyUpdate('join-created', room);
    return room.id;
  }

  @Post()
  addRoom() {
    const create = this.roomService.createRoom();
    if (!create) {
      return { message: 'Room not created' };
    }
    this.roomGateway.handleNotifyUpdate('room-created', create);

    return { message: 'Room created' };
  }
}
