import { Module } from '@nestjs/common';
import { RoomsGateway } from './room.gateway';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { RoomStateService } from './room-state.service';

@Module({
  providers: [RoomsGateway, RoomService, RoomController, RoomStateService],
  exports: [RoomsGateway, RoomService, RoomController, RoomStateService],
})
export class RoomModule {}
