import {
  Body,
  Controller,
  createParamDecorator,
  ExecutionContext,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsGateway } from './rooms.gateway';
import { TablesRooms } from './rooms.interface';
import { AuthGuard } from './auth.guard';

interface JWTPayload {
  id: string;
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

const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request['user'] as JWTPayload;
  },
);

@Controller('rooms')
export class RoomsController {
  private readonly logger = new Logger(RoomsController.name);

  constructor(
    private readonly RoomsService: RoomsService,
    private readonly RoomGateway: RoomsGateway,
  ) { }

  @UseGuards(AuthGuard)
  @Post()
  addRoom(@CurrentUser() user: JWTPayload) {
    try {
      if (!user) {
        return {
          message: 'Token ไม่ถูกต้อง หรือหมดอายุ',
          statusCode: 401,
        };
      }
      const data = this.RoomsService.createdRoom(user.id);
      console.log('Data', data);
      if (!data.success) {
        return { error: 'An error occurred' };
      } else {
        const newData = this.RoomsService.getRoom().map((room) => {
          return {
            id: room.id,
            roomCode: room.roomCode,
          };
        });
        console.log('newData', newData);

        this.RoomGateway.handleNotifyUpdate<TablesRooms[]>(
          'rooms-list',
          newData,
        );
      }
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

  @UseGuards(AuthGuard)
  @Post('/join')
  joinRoom(
    @Body() body: { roomCode: string },
    @CurrentUser() user: JWTPayload,
  ) {
    try {
      console.log('user', user);

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      if (!body) {
        throw new HttpException(
          'Room code is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const { roomCode } = body;

      const id = user.id;
      const email = user.email;

      const roomID = this.RoomsService.joinedRoom(roomCode);

      if (!roomID) {
        throw new HttpException('Room not found', HttpStatus.NOT_FOUND);
      }

      console.log('id || Data', id, roomID);

      this.RoomGateway.handleJoinRoom(id, roomID, email);
      return roomID;
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

  @UseGuards(AuthGuard)
  @Get()
  getRoomsController() {
    try {
      const data = this.RoomsService.getRoom();
      const newData = data.map((room) => {
        return {
          id: room.id,
          roomCode: room.roomCode,
        };
      });
      return newData;
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

  @UseGuards(AuthGuard)
  @Post('/sitdown')
  SitdownInRoom(
    @Body() body: { indexChair: string; idConnect: string },
    @CurrentUser() user: JWTPayload,
  ) {
    try {
      console.log(body, user);
      const data = this.RoomGateway.sitdownNew(
        parseInt(body.indexChair),
        user.id,
        user.email,
      );
      return data;
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

  @UseGuards(AuthGuard)
  @Get('/:id')
  getRoomController(@Param('id') id: string) {
    try {
      const data = this.RoomsService.getRoomById(parseInt(id));
      return data;
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
