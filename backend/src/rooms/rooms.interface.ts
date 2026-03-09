export interface Rooms {
  id: number;
  roomCode: string;
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
  role: string;
}

export interface UserStage {
  id: string;
  email: string;
}

export interface UserConnectSocket {
  name: string;
  id: string;
  email: string;
  iat: number;
  exp: number;
}

interface UserVote {
  userId: string;
  name: string;
  vote: string;
  active: boolean;
}

export interface Participant {
  userId: string;
  username: string;
  socketId: string;
  joinedAt: Date;
}

interface CardMeta {
  cardId: string;
  title: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
}

interface RoundSession {
  cardId: string;
  votes: Map<string, UserVote>;
  revealed: boolean;
  startedAt: Date;
}

export interface RoomSession {
  id: number;
  roomCode: string;
  hostId: string;
  participants: Map<string, Participant>;
  seats: Map<number, SeatInfo[]>;
  cards?: Map<string, CardMeta>;
  activeCardId?: string;
  activeRound?: RoundSession;
}
