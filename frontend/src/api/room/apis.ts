import { client } from '@/config/axios'

export const apiPostRoom = async (data: {
  name: string
  nameRoom: string
  password?: string
}): Promise<any> => {
  const res = await client.post('/room', data)
  return res.data
}
