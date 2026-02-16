import { inferOptions } from 'react-query-kit'
import { RoomQueries } from '../quries'

export function usePostRoom(
  option?: inferOptions<typeof RoomQueries.postRoom>,
) {
  return RoomQueries.postRoom.useMutation(option)
}

export function useJoinRoom(
  option?: inferOptions<typeof RoomQueries.joinRoom>,
) {
  return RoomQueries.joinRoom.useMutation(option)
}
