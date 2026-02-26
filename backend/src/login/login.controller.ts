import {
  Controller,
  createParamDecorator,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LoginService } from './login.service';
import { AuthGuard } from './auth.guard';
import type { Request } from 'express';

const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request['user'] as JWTPayload;
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
  constructor(private readonly service: LoginService) {}
  @UseGuards(AuthGuard)
  @Post()
  login(@CurrentUser() user: JWTPayload) {
    try {
      console.log('user', user);

      if (!user) {
        return {
          message: 'Token ไม่ถูกต้อง หรือหมดอายุ',
          statusCode: 401,
        };
      }
      console.log('Token');

      const token = this.service.JWTGenerate({
        name: user.name,
        id: user.sub,
        email: user.email,
      });

      // console.log('Token', token);

      return {
        message: 'Login สำเร็จ',
        statusCode: 200,
        data: token,
      };
    } catch (error) {
      this.logger.error(error);
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
