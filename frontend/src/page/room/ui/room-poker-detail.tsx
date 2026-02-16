import { useWebSocket } from '@/hooks/useWebSocket'
import { cn } from '@/lib/utils'
import { Crown, Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

interface Person {
  id: string
  userName: string
  role: string
  index: number
}

export function RoomPokerDetail() {
  const { on, send } = useWebSocket()

  const [people, setPeople] = useState<Person[]>([])
  const [peopleSitdown, setPeopleSitdown] = useState<Person[]>([])
  const radius = 250
  const MAX_SEATS = 10

  useEffect(() => {
    const unsubscribeList = on('join-room', (roomsList) => {
      console.log('📋 Received Join Room:', roomsList)
      setPeople(roomsList)
    })

    const unsubscribeSitdown = on('update-seats', (roomsList) => {
      console.log('📋 Received Join Room Sitdown:', roomsList)
      setPeopleSitdown(roomsList.seats)
    })
    return () => {
      ;(unsubscribeList(), unsubscribeSitdown())
    }
  }, [on])

  const memberSitDown = useMemo(() => {
    return Array.from({ length: MAX_SEATS }, (_, i) => {
      const personInSeat = peopleSitdown.find((p) => p.index === i)

      if (personInSeat) {
        return { ...personInSeat, isOccupied: true }
      }

      return {
        id: `empty-${i}`,
        userName: 'Empty Seat',
        role: 'Guest',
        index: i,
        isOccupied: false,
      }
    })
  }, [peopleSitdown])

  const Sitdown = (index: number) => {
    const MY_ID = 'me-124'
    // console.log('TESTINdex', index)
    send('sitdown', { index: index, id: MY_ID })
  }

  return (
    <div className="h-full w-full flex justify-center items-center min-h-150">
      <div className="relative flex items-center justify-center">
        {/* ตัวโต๊ะ (Table Center) */}
        <div className="absolute w-64 h-64 bg-slate-800 border-8 border-slate-700 rounded-full shadow-2xl flex items-center justify-center z-10">
          <div className="text-slate-400 font-bold tracking-widest text-sm">
            MEETING ROOM
          </div>
        </div>

        {memberSitDown.map((person) => {
          const sitDownCount = 10
          const angle = person.index * (360 / sitDownCount) + 90
          return (
            <div
              key={person.id}
              className="absolute transition-all duration-500 ease-in-out"
              style={{
                transform: `rotate(${angle}deg) translate(${radius}px) rotate(-${angle}deg)`,
              }}
            >
              {person.role === 'Guest' ? (
                <div className="flex flex-col items-center group">
                  <div
                    className={cn(
                      `
                  w-16 h-16 rounded-full border-4 flex items-center justify-center text-white font-bold text-xs shadow-lg
                  group-hover:scale-110 transition-transform cursor-pointer border-emerald-500 bg-slate-700
                `,
                    )}
                    onClick={() => Sitdown(person.index)}
                  >
                    <Plus />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center group">
                  <div
                    className={cn(
                      `
                  w-16 h-16 rounded-full border-4 flex items-center justify-center text-white font-bold text-xs shadow-lg
                  group-hover:scale-110 transition-transform cursor-pointer border-emerald-500 bg-slate-700
                `,
                    )}
                    onClick={() => Sitdown(person.index)}
                  >
                    {person.role === 'Host' && (
                      <Crown className="top-0 left-1/2 transform -translate-x-1/2 absolute" />
                    )}
                    {person.userName.charAt(0)}
                  </div>

                  <div className="mt-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-white whitespace-nowrap">
                    {person.userName}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
