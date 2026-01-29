import { Module } from '@nestjs/common';
import { RoomsGateway } from './room.gateway';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';

@Module({
  providers: [RoomsGateway, RoomService, RoomController],
  exports: [RoomsGateway, RoomService, RoomController],
})
export class RoomModule {}
