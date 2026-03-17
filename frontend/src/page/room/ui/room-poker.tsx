import { useParams } from '@tanstack/react-router'
import { RoomPokerDetail } from './room-poker-detail'
import { useRoomPoker } from './hook'
import { useEffect } from 'react'
import { CardVoice } from './card-voice'
import { Button } from '@/components/button'
import { CardIssue } from './card-issue'

export function RoomPoker() {
  const { id } = useParams({ from: '/_protect/poker/$id/' })
  const { setId, handleCloseRoom, peopleJoinRoom } = useRoomPoker()

  useEffect(() => {
    setId(id)
  }, [id])

  return (
    <>
      <div className="h-full relative grid grid-cols-[1fr_0.3fr] ">
        <div className="bg-gray-100 p-10">
          <div className="flex justify-between">
            <h2>จำนวนผู้เข้าห้อง {peopleJoinRoom.length ?? 0} คน</h2>
            <Button
              variant="outline"
              data-testid="close-room"
              onClick={handleCloseRoom}
            >
              กลับหน้าแรก
            </Button>
          </div>
          <div className="h-full flex flex-col justify-start">
            <div className="z-1">
              <RoomPokerDetail />
            </div>
            <div className="translate-y-1/2 z-10">
              <CardVoice />
            </div>
          </div>
        </div>
        <CardIssue />
      </div>
    </>
  )
}
