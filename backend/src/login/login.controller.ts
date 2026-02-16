import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { LoginService } from './login.service';
import type { Login } from './login.interface';

@Controller('login')
export class LoginController {
  constructor(private readonly Service: LoginService) {}
  @Post()
  login(@Body() body: Login) {
    try {
      console.log(body);

      this.Service.login(body.data);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          'An error occurred',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
