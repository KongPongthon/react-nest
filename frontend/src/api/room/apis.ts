import { client } from '@/config/axios'

export const apiPostRoom = async (): Promise<any> => {
  const res = await client.post('/rooms')
  return res.data
}
interface CreateRoomDto {
  id: number
  idConnect: string
}
export const apiJoinRoom = async ({
  id,
  idConnect,
}: CreateRoomDto): Promise<string> => {
  console.log('API ID ', id, idConnect)

  const res = await client.post('/rooms/join', { id: id, idConnect: idConnect })
  return res.data
}
