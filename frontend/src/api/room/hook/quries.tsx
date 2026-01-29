import { inferOptions } from 'react-query-kit'
import { RoomQueries } from '../quries'

export function usePostRoom(
  option?: inferOptions<typeof RoomQueries.postRoom>,
) {
  return RoomQueries.postRoom.useMutation(option)
}
