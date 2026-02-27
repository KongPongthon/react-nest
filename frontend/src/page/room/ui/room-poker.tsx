import { useParams } from '@tanstack/react-router'
import { RoomPokerDetail } from './room-poker-detail'
import { useRoomPoker } from './hook'
import { useEffect } from 'react'
import { CardVoice } from './card-voice'

export function RoomPoker() {
  const { id } = useParams({ from: '/_protect/poker/$id/' })
  const { setId, handleCloseRoom } = useRoomPoker()

  useEffect(() => {
    setId(id)
  }, [id])
  return (
    <div className="h-full relative">
      <div className="flex justify-end max-h-10">
        <button
          data-testid="close-room"
          className="border p-2 rounded-lg hover:cursor-pointer"
          onClick={handleCloseRoom}
        >
          กลับหน้าแรก
        </button>
      </div>
      <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-1">
        <RoomPokerDetail />
      </div>

      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        <CardVoice />
      </div>
    </div>
  )
}
