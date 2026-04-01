import { useParams } from '@tanstack/react-router'
import { RoomPokerDetail } from './room-poker-detail'
import { useRoomPoker } from '../hook/hook-poker'
import { useEffect } from 'react'
import { CardVoice } from './card-voice'
import { Button } from '@/components/button'
import { CardIssue } from './card-issue'
import { Countdown } from './cooldown'
import { cn } from '@/lib/utils'

export function RoomPoker() {
  const { id } = useParams({ from: '/_protect/poker/$id/' })
  const { setId, handleCloseRoom, peopleJoinRoom, serverTime, isOwner } =
    useRoomPoker()

  useEffect(() => {
    setId(id)
  }, [id])

  console.log('serverTime', serverTime)

  return (
    <>
      <div className="h-full relative grid grid-cols-[1fr_0.3fr] ">
        <div className="bg-gray-100 p-10">
          <div className="flex justify-between">
            <h2>
              จำนวนผู้เข้าห้อง {peopleJoinRoom.length ?? 0} คน
              <Countdown serverTime={serverTime} roomId={id} />
            </h2>
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
            <div
              className={cn(
                'translate-y-1/3 z-10 duration-700 transition-all hidden',
                serverTime > 1
                  ? 'opacity-100 pointer-events-auto animate-poker-in block'
                  : 'opacity-0 pointer-events-none animate-poker-out hidden',
                isOwner
                  ? 'block'
                  : 'animate-poker-out opacity-0 pointer-events-none hidden',
              )}
            >
              <CardVoice />
            </div>
          </div>
        </div>
        <CardIssue />
      </div>
    </>
  )
}
