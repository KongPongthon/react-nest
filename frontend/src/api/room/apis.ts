import { client } from '@/config/axios'
import { CreateRoomDto, ISitdownInRoom, RoomList } from './types'

export const apiPostRoom = async () => {
  try {
    const res = await client.post('/rooms')
    return res.data
  } catch (err) {
    console.log(err)
    throw err
  }
}

export const apiJoinRoom = async (data: CreateRoomDto): Promise<string> => {
  const res = await client.post('/rooms/join', data)
  return res.data
}

export const apiGetRooms = async (): Promise<RoomList[]> => {
  try {
    const res = await client.get('/rooms')
    console.log(res.data)
    return res.data
  } catch (err) {
    console.log(err)
    throw err
  }
}

export const apiPostSitdown = async (data: ISitdownInRoom) => {
  try {
    const res = await client.post('/rooms/sitdown', data)
    return res.data
  } catch (error) {
    throw error
  }
}
