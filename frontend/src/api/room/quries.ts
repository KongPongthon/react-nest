import { router } from 'react-query-kit'
import { apiJoinRoom, apiPostRoom } from './apis'
export const RoomQueries = router('room', {
  postRoom: router.mutation({
    mutationFn: apiPostRoom,
  }),
  joinRoom: router.mutation({
    mutationFn: apiJoinRoom,
  }),
})
