import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private service: RoomsService) {}

  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest<Request>();
    // const token = request.cookies.token;
    try {
      const { token } = request.cookies;
      console.log('accessToken', token);

      // if (!accessToken) return false;
      // const token = accessToken.split(' ')[1];
      if (!token) {
        throw new UnauthorizedException('Token ไม่ถูกต้องการ หรือหมดอายุ');
      }
      const user = this.service.verify(token as string);
      if (!user) {
        throw new UnauthorizedException('Token ไม่ถูกต้องการ หรือหมดอายุ');
      }

      request['user'] = user;
      return true;
    } catch (error) {
      console.log('Token ไม่ถูกต้องการ หรือหมดอายุ', error);
      throw new UnauthorizedException('Token ไม่ถูกต้องการ หรือหมดอายุ');
    }
  }
}
