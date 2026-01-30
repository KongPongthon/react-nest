import { Injectable } from '@nestjs/common';
import { Rooms } from './room.interface';

@Injectable()
export class RoomStateService {
  public rooms = new Map<string, Rooms>();
  public member = new Map<string, string>();
}
