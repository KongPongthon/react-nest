import { Injectable } from '@nestjs/common';
import { RoomSession } from './rooms.interface';
import { WebSocket } from 'ws';

@Injectable()
export class RoomStateService {
  // public rooms = new Map<string, Rooms>();
  // public roomMembers = new Map<string, Set<WebSocket>>();

  // public roomSeats = new Map<string, Map<number, SeatInfo>>();

  // public clients = new Map<WebSocket, string>();

  // public clientToRoom = new Map<WebSocket, string>();
  //=== Socket ↔ User (Connection Layer) ===
  public clients = new Map<WebSocket, string>(); // socket → id
  public socketByUser = new Map<string, WebSocket>(); // id → socket

  // === Room Data (Business Layer) ===
  // public rooms = new Map<string, Rooms>(); // roomId → ข้อมูลห้อง
  // public roomMembers = new Map<string, Set<string>>(); // roomId → Set<userId>
  public roomSessions = new Map<string, RoomSession>(); // roomId → RoomSession
  //=== userID ↔ socketID (Connection Layer) ===
  public socketIdByUser = new Map<string, string>();

  // === User State (Business Layer) ===
  public userToRoom = new Map<string, string>(); // userId → roomId
}
