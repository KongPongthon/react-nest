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
    const request: Request = context.switchToHttp().getRequest();
    console.log('request', request.headers);
    try {
      const accessToken = request.headers.authorization;
      if (!accessToken) return false;
      const token = accessToken.split(' ')[1];
      if (!token) {
        throw new UnauthorizedException('Token ไม่ถูกต้อง หรือหมดอายุ');
      }
      const user = this.service.verify(token);
      if (!user) {
        throw new UnauthorizedException('Token ไม่ถูกต้อง หรือหมดอายุ');
      }

      request['user'] = user;
      return true;
    } catch (error) {
      console.log('Token ไม่ถูกต้อง หรือหมดอายุ', error);
      throw new UnauthorizedException('Token ไม่ถูกต้อง หรือหมดอายุ');
    }
  }
}
