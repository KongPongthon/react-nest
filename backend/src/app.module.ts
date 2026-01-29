import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoomController } from './room/room.controller';
import { RoomService } from './room/room.service';
import { RoomModule } from './room/room.module';

@Module({
  imports: [RoomModule],
  controllers: [AppController, RoomController],
  providers: [AppService, RoomService],
})
export class AppModule {}
