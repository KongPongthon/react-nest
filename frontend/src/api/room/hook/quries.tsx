import { RoomQueries } from '../quries'

export function useGetRoom() {
  return RoomQueries.getRoom.useQuery()
}
