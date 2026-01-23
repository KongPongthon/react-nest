import { client } from '@/config/axios'

export const apiGetRoomAll = async (): Promise<any> => {
  const res = await client.get('/room')
  return res.data
}
