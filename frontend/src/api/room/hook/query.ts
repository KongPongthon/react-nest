import { inferOptions } from 'react-query-kit'
import { RoomQueries } from '../quries'

export function useGetRoomID(
  option?: inferOptions<typeof RoomQueries.getRoomID>,
) {
  return RoomQueries.getRoomID.useQuery(option)
}
