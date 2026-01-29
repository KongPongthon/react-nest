import { router } from 'react-query-kit'
import { apiPostRoom } from './apis'
export const RoomQueries = router('room', {
  postRoom: router.mutation({
    mutationFn: apiPostRoom,
  }),
})
