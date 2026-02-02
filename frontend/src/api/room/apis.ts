import { client } from '@/config/axios'

export const apiPostRoom = async (data: {
  name: string
  nameRoom: string
  password?: string
}): Promise<any> => {
  const res = await client.post('/room', data)
  return res.data
}

export const apiJoinRoom = async (id: number): Promise<string> => {
  console.log('API ID ', id)

  const res = await client.post('/room/join', { id: id })
  return res.data
}
