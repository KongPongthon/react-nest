import { router } from 'react-query-kit'
import { apiGetRooms, apiJoinRoom, apiPostRoom } from './apis'
export const RoomQueries = router('room', {
  postRoom: router.mutation({
    mutationFn: apiPostRoom,
  }),
  joinRoom: router.mutation({
    mutationFn: apiJoinRoom,
  }),
  getRooms: router.query({
    fetcher: apiGetRooms,
  }),
})
