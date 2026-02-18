import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginService } from './login.service';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private service: LoginService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    console.log('request', request.headers);

    const accessToken = request.headers.authorization;
    // console.log('accessToken', accessToken);

    if (!accessToken)
      throw new UnauthorizedException('Token ไม่ถูกต้อง หรือหมดอายุ');

    const token = accessToken.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token ไม่ถูกต้อง หรือหมดอายุ');
    }
    console.log('Token', token);

    try {
      const user = await this.service.login(token);
      if (!user)
        throw new UnauthorizedException('Token ไม่ถูกต้อง หรือหมดอายุ');
      request['user'] = user;
      return true;
    } catch (error) {
      console.log('Token ไม่ถูกต้อง หรือหมดอายุ', error);
      throw new UnauthorizedException('Token ไม่ถูกต้อง หรือหมดอายุ');
    }
  }
}
