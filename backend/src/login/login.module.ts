import { Module } from '@nestjs/common';
import { LoginController } from './login.controller';
import { LoginService } from './login.service';
import { AuthGuard } from './auth.guard';

@Module({
  controllers: [LoginController],
  providers: [LoginService, AuthGuard],
  exports: [LoginService, AuthGuard],
})
export class LoginModule {}
