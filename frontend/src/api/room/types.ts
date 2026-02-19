export interface RoomList {
  id: number
  roomCode: string
}

export interface CreateRoomDto {
  id: number
  idConnect: string
}

export interface ISitdownInRoom {
  indexChair: string
  idConnect: string
  roomId: string
}
