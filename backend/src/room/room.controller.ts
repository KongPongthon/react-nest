import { Body, Controller, Get, Post } from '@nestjs/common';
import { RoomService } from './room.service';

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}
  @Get()
  getRoom() {
    console.log('test', this.roomService.findAll());

    const data = this.roomService.findAll();

    if (!data) {
      return { message: 'Room not found' };
    }

    return data;
  }

  @Post()
  addRoom(@Body() room) {
    return this.roomService.create(room);
  }
}
