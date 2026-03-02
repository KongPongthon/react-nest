import {
  Controller,
  createParamDecorator,
  ExecutionContext,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import type { JWTPayload } from './auth.interface';

const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request['user'] as JWTPayload;
  },
);

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly service: AuthService) {}
  @UseGuards(AuthGuard)
  @Post()
  login(
    @CurrentUser() user: JWTPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
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

      if (!token) {
        return {
          message: 'Token ไม่ถูกต้อง หรือหมดอายุ',
          statusCode: 401,
        };
      }

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' ? true : false,
        sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'none',
        expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        path: '/',
      });

      console.log('Set Cookies');

      // res.cookie('token', token, {
      //   maxAge: 3600000, // Cookie expiration time in milliseconds (1 hour)
      //   httpOnly: true, // Makes the cookie inaccessible to client-side JavaScript
      //   secure: process.env.NODE_ENV === 'production', // Ensure secure cookies in production
      //   sameSite: 'lax', // Helps mitigate CSRF attacks
      // });

      return {
        message: 'Login สำเร็จ',
        statusCode: 200,
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

  @Get()
  shortToken(@Req() req: Request): string {
    try {
      this.logger.log(req.cookies.token);
      const { token } = req.cookies;
      console.log('token', token);

      const data = this.service.verify(token as string);

      if (!data) {
        throw new HttpException(
          'Token ไม่ถูกต้อง หรือหมดอายุ',
          HttpStatus.BAD_REQUEST,
        );
      }
      console.log('verify Token', data);

      const access_token = this.service.GenerateShortToken({
        name: data.name,
        id: data.id,
        email: data.email,
      });
      return access_token;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        'Token ไม่ถูกต้อง หรือหมดอายุ',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
