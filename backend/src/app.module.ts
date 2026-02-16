import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoomsModule } from './rooms/rooms.module';
import { LoginModule } from './login/login.module';

@Module({
  imports: [RoomsModule, LoginModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
