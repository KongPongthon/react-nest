export interface RoomList {
  id: number
  roomCode: string
}

export interface CreateRoomDto {
  roomCode: string
}

export interface ISitdownInRoom {
  indexChair: string
  idConnect: string
  roomId: string
}
