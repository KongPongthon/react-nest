import { router } from 'react-query-kit'
import { apiGetRoomAll, apiPostRoom } from './apis'
export const RoomQueries = router('room', {
  getRoom: router.query({
    fetcher: apiGetRoomAll,
  }),
  postRoom: router.mutation({
    mutationFn: apiPostRoom,
  }),
})
