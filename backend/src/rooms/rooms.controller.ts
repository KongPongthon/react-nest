import {
  Body,
  Controller,
  createParamDecorator,
  ExecutionContext,
  Get,
  HttpException,
  HttpStatus,
  Logger,
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
  ) {}
  @UseGuards(AuthGuard)
  @Post()
  addRoom(@CurrentUser() user: JWTPayload) {
    try {
      console.log('TEST User', user);
      if (!user) {
        return { error: 'An error occurred' };
      }
      const data = this.RoomsService.createdRoom();
      console.log('Data', data);

      // console.log('TEST DATA', data);
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
      console.error(error);
      return { error: 'An error occurred' };
    }
  }
  @UseGuards(AuthGuard)
  @Post('/join')
  joinRoom(@Body() body: { id: string; idConnect: string }) {
    try {
      const { id, idConnect } = body;
      console.log(id, idConnect);
      const data = this.RoomsService.joinedRoom(parseInt(id));
      console.log('data', data);
      if (!data) {
        return { error: 'Room not found' };
      }
      if (typeof data === 'number') {
        // this.RoomGateway.handleJoinRoom(data.toString());
        this.RoomGateway.handleJoinRoom(idConnect, data.toString());
      }
      return data;
    } catch (error) {
      console.error(error);
      return { error: 'An error occurred' };
    }
  }

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
      console.error(error);
      return { error: 'An error occurred' };
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
      this.RoomGateway.sitdownNew(
        body.idConnect,
        parseInt(body.indexChair),
        user.email,
        user.id,
      );
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
