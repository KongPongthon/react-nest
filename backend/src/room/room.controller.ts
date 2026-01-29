import { Body, Controller, Get, Post } from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './room.dto';

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}
  @Get()
  getRoom() {
    console.log('test', this.roomService.getAllRooms());

    const data = this.roomService.getAllRooms();

    if (!data) {
      return { message: 'Room not found' };
    }

    return data;
  }

  @Post()
  addRoom(@Body() room: CreateRoomDto) {
    return this.roomService.createRoom(room);
  }
}
