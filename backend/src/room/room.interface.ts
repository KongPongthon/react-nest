// src/rooms/interfaces/room.interface.ts

export interface RoomBase {
  roomCode: string;
}

export interface RoomList extends RoomBase {
  id: number;
}

export interface RoomCreate extends RoomBase {
  id: number;
  name: string;
  listMember: number[] | [];
  password?: string;
}

export interface WebSocketMessage<T = any> {
  event: string;
  data: T;
}

export interface Rooms {
  id: number;
  roomCode: string;
  createdAt: string;
  createdBy: string;
  updateAt: string;
  updateBy: string;
  isClosed: boolean;
}
export interface Sessions {
  id: number;
  roomId: number;
  title: string;
  finalScore: number;
  votedAt: string;
  memberVoted: memberVoted[];
}

export interface memberVoted {
  name: string;
  score: number;
}
