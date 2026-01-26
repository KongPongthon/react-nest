import { client } from '@/config/axios'

export const apiGetRoomAll = async (): Promise<any> => {
  const res = await client.get('/room')
  return res.data
}

export const apiPostRoom = async (data: {
  name: string
  topic: string
}): Promise<any> => {
  const res = await client.post('/room', data)
  return res.data
}
