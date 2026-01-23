import { router } from 'react-query-kit'
import { apiGetRoomAll } from './apis'
export const RoomQueries = router('room', {
  getRoom: router.query({
    fetcher: apiGetRoomAll,
  }),
})
