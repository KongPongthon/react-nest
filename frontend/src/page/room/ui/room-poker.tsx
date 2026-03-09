import { useParams } from '@tanstack/react-router'
import { RoomPokerDetail } from './room-poker-detail'
import { useRoomPoker } from './hook'
import { useEffect } from 'react'
import { CardVoice } from './card-voice'
import { Button } from '@/components/button'

export function RoomPoker() {
  const { id } = useParams({ from: '/_protect/poker/$id/' })
  const { setId, handleCloseRoom, peopleJoinRoom
  } = useRoomPoker()


  useEffect(() => {
    setId(id)
  }, [id])

  return (
    <div className="h-full relative">
      <h2>จำนวนผู้เข้าห้อง {peopleJoinRoom.length ?? 0} คน</h2>
      <div className="flex justify-end max-h-10">
        <Button
          data-testid="close-room"
          onClick={handleCloseRoom}
        >
          กลับหน้าแรก
        </Button>
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
