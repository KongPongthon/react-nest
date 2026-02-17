import {
  Controller,
  createParamDecorator,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LoginService } from './login.service';
import { AuthGuard } from './auth.guard';
import type { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request['user'];
  },
);
interface JWTPayload {
  aud: string;
  iss: string;
  iat: number;
  nbf: number;
  exp: number;
  acr: string;
  aio: string;
  amr: [string];
  appid: string;
  appidacr: string;
  email: string;
  family_name: string;
  given_name: string;
  ipaddr: string;
  name: string;
  oid: string;
  rh: string;
  scp: string;
  sid: string;
  sub: string;
  tid: string;
  unique_name: string;
  upn: string;
  uti: string;
  ver: string;
  xms_ftd: string;
}
@Controller('login')
export class LoginController {
  private readonly logger = new Logger(LoginService.name);
  constructor() {}
  @UseGuards(AuthGuard)
  @Post()
  login(@CurrentUser() user: JWTPayload) {
    try {
      console.log(user);

      if (!user) {
        return {
          message: 'Token ไม่ถูกต้อง หรือหมดอายุ',
          statusCode: 401,
          data: '',
        };
      }
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
