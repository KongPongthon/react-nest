import { client } from '@/config/axios'

export const apiPostRoom = async (): Promise<any> => {
  const res = await client.post('/rooms')
  return res.data
}

export const apiJoinRoom = async (id: number): Promise<string> => {
  console.log('API ID ', id)

  const res = await client.post('/rooms/join', { id: id })
  return res.data
}
