export interface Rooms {
  id: number;
  roomCode: string;
  isClosed: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface RoomMessageData {
  roomId: string;
  username: string;
  message: string;
}

export interface UserJoinedData {
  roomId: string;
  username: string;
  memberCount: number;
}

export interface TablesRooms {
  id: number;
  roomCode: string;
}

export interface WebSocketMessage<T = any> {
  event: string;
  data: T;
}

export interface SeatInfo {
  userId: string;
  userName: string;
  index: number;
}

export interface UserStage {
  id: string;
  email: string;
}
