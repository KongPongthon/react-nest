import { inferOptions } from 'react-query-kit'
import { RoomQueries } from '../quries'

export function useGetRooms(
  option?: inferOptions<typeof RoomQueries.getRooms>,
) {
  return RoomQueries.getRooms.useQuery(option)
}
