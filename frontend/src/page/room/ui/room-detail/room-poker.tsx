import { useParams, useRouter } from '@tanstack/react-router'
import { RoomPokerDetail } from './room-poker-detail'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useRoomPoker } from './hook'
import { useEffect } from 'react'

export function RoomPoker() {
  const { id } = useParams({ from: '/_protect/room/$id/' })
  const { setId, handleCloseRoom } = useRoomPoker()

  useEffect(() => {
    setId(id)
  }, [id])
  return (
    <div className="h-full">
      <div className="flex justify-end max-h-10">
        <button
          data-testid="close-room"
          className="border p-2 rounded-lg hover:cursor-pointer"
          onClick={handleCloseRoom}
        >
          กลับหน้าแรก
        </button>
      </div>
      <RoomPokerDetail />
    </div>
  )
}
