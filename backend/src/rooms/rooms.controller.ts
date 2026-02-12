import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsGateway } from './rooms.gateway';
import { TablesRooms } from './rooms.interface';
import { WebSocket } from 'ws';
@Controller('rooms')
export class RoomsController {
  private readonly logger = new Logger(RoomsController.name);

  constructor(
    private readonly RoomsService: RoomsService,
    private readonly RoomGateway: RoomsGateway,
  ) {}

  @Post()
  addRoom() {
    try {
      const data = this.RoomsService.createdRoom();
      console.log('TEST DATA', data);
      if (!data.success) {
        return { error: 'An error occurred' };
      } else {
        const newData = this.RoomsService.getRoom().map((room) => {
          return {
            id: room.id,
            roomCode: room.roomCode,
          };
        });
        console.log('newData', newData);

        this.RoomGateway.handleNotifyUpdate<TablesRooms[]>(
          'rooms-list',
          newData,
        );
      }
    } catch (error) {
      console.error(error);
      return { error: 'An error occurred' };
    }
  }

  @Post('/join')
  joinRoom(@Body() body: { id: string; idConnect: string }) {
    try {
      const { id, idConnect } = body;
      console.log(id, idConnect);
      const data = this.RoomsService.joinedRoom(parseInt(id));
      console.log('data', data);
      if (!data) {
        return { error: 'Room not found' };
      }
      if (typeof data === 'number') {
        // this.RoomGateway.handleJoinRoom(data.toString());
        this.RoomGateway.handleJoinRoom(idConnect, data.toString());
      }
      return data;
    } catch (error) {
      console.error(error);
      return { error: 'An error occurred' };
    }
  }

  @Get()
  getRoomsController() {
    try {
      const data = this.RoomsService.getRoom();
      console.log('data', data);
    } catch (error) {
      console.error(error);
      return { error: 'An error occurred' };
    }
  }
}
