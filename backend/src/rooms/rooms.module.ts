import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomStateService } from './rooms-state.service';
import { RoomsController } from './rooms.controller';
import { RoomsGateway } from './rooms.gateway';
import { LoginModule } from 'src/login/login.module';

@Module({
  imports: [LoginModule],
  controllers: [RoomsController],
  providers: [RoomsService, RoomStateService, RoomsGateway],
})
export class RoomsModule {}
