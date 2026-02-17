import {
  Body,
  Controller,
  createParamDecorator,
  ExecutionContext,
  Get,
  Logger,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsGateway } from './rooms.gateway';
import { TablesRooms } from './rooms.interface';
import { AuthGuard } from 'src/login/auth.guard';

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
      if (!user) {
        return { error: 'Token ไม่ถูกต้อง หรือหมดอายุ' };
      }
      console.log('user :', user);

      const data = this.RoomsService.createdRoom();
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
  joinRoom(
    @Body() body: { id: string; idConnect: string },
    @CurrentUser() user: JWTPayload,
  ) {
    try {
      if (!user) {
        return { error: 'Token ไม่ถูกต้อง หรือหมดอายุ' };
      }
      console.log(user);

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
  @UseGuards(AuthGuard)
  @Get()
  getRoomsController() {
    try {
      const data = this.RoomsService.getRoom();
      console.log('data', data);
    } catch (error) {
      console.error(error);
      return { error: 'An error occurred' };
    }
  }
}
