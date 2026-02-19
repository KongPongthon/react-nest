import { useParams, useRouter } from '@tanstack/react-router'
import { RoomPokerDetail } from './room-poker-detail'
import { useWebSocket } from '@/hooks/useWebSocket'

export function RoomPoker() {
  const { id } = useParams({ from: '/_protect/room/$id/' })
  const { send } = useWebSocket()
  // console.log(id)
  const router = useRouter()

  const handleCloseRoom = () => {
    router.navigate({ to: '/room' })
    send('leave_room', id)
  }
  return (
    <div className="h-full">
      <div className="flex justify-end max-h-10">
        <button
          className="border p-2 rounded-lg hover:cursor-pointer"
          onClick={handleCloseRoom}
        >
          กลับหน้าแรก
        </button>
      </div>
      <RoomPokerDetail id={id} />
    </div>
  )
}
