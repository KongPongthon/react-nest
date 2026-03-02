import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomStateService } from './rooms-state.service';
import { RoomsController } from './rooms.controller';
import { RoomsGateway } from './rooms.gateway';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [RoomsController],
  providers: [RoomsService, RoomStateService, RoomsGateway],
})
export class RoomsModule {}
