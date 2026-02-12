import { Injectable } from '@nestjs/common';
import { Rooms, SeatInfo } from './rooms.interface';
import { WebSocket } from 'ws';

@Injectable()
export class RoomStateService {
  public rooms = new Map<string, Rooms>();
  public roomMembers = new Map<string, Set<WebSocket>>();

  public roomSeats = new Map<string, Map<number, SeatInfo>>();
}
