import { router } from 'react-query-kit'
import { apiGetRooms, apiGetUserInRoom, apiJoinRoom, apiPostRoom, apiPostSitdown } from './apis'
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
  postSitdown: router.mutation({
    mutationFn: apiPostSitdown,
  }),
  getUserInRoom: router.query({
    fetcher: apiGetUserInRoom,
  }),
})
