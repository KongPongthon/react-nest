// src/rooms/interfaces/room.interface.ts

export interface RoomBase {
  nameCode: string;
}

export interface RoomList extends RoomBase {
  id: number;
}

export interface RoomCreate extends RoomBase {
  id: number;
  name: string;
  listMember: number[] | null;
  password?: string;
}

export interface WebSocketMessage<T = any> {
  event: string;
  data: T;
}
