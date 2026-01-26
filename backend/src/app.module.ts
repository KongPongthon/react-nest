import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoomController } from './room/room.controller';
import { RoomService } from './room/room.service';
import { RoomModule } from './room/room.module';
import { GatewayController } from './gateway/gateway.controller';
import { GatewayService } from './gateway/gateway.service';
import { GatewayModule } from './gateway/gateway.module';

@Module({
  imports: [RoomModule, GatewayModule],
  controllers: [AppController, RoomController, GatewayController],
  providers: [AppService, RoomService, GatewayService],
})
export class AppModule {}
