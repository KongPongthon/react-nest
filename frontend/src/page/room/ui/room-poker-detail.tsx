import { useWebSocket } from '@/hooks/useWebSocket'
import { cn } from '@/lib/utils'
import { Crown, Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

interface Person {
  id: string
  name: string
  role: string
  index: number
}

export function RoomPokerDetail() {
  const { on } = useWebSocket()
  useEffect(() => {
    const unsubscribeList = on('join-room', (roomsList) => {
      console.log('📋 Received Join Room:', roomsList)
      setPeople(roomsList)
    })
    return () => {
      unsubscribeList()
    }
  }, [on])

  const [people, setPeople] = useState<Person[]>([])
  const [peopleSitdown, setPeopleSitdown] = useState<Person[]>([])
  const radius = 250
  const MAX_SEATS = 10

  const memberSitDown = useMemo(() => {
    return Array.from({ length: MAX_SEATS }, (_, i) => {
      const personInSeat = peopleSitdown.find((p) => p.index === i)

      if (personInSeat) {
        return { ...personInSeat, isOccupied: true }
      }

      return {
        id: `empty-${i}`,
        name: 'Empty Seat',
        role: 'Guest',
        index: i,
        isOccupied: false,
      }
    })
  }, [peopleSitdown])

  const Sitdown = (index: number) => {
    const MY_ID = 'me-123'
    setPeopleSitdown((prev) => {
      const isSeatTaken = prev.some((p) => p.index === index)
      if (isSeatTaken) {
        console.log('เก้าอี้นี้มีคนนั่งแล้ว!')
        return prev
      }
      const amIAlreadySitting = prev.some((p) => p.id === MY_ID)
      if (amIAlreadySitting) {
        const newSit = prev.filter((p) => p.id !== MY_ID)
        return [...newSit, { id: MY_ID, name: 'My Name', role: 'User', index }]
      }
      return [
        ...prev,
        { id: MY_ID, name: 'My Name', role: 'User', index: index },
      ]
    })
  }

  console.log('memberSitDown', memberSitDown)

  return (
    <div className="h-full w-full flex justify-center items-center">
      <div>
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
                    >
                      {person.role === 'Host' && (
                        <Crown className="top-0 left-1/2 transform -translate-x-1/2 absolute" />
                      )}
                      {person.name.charAt(0)}
                    </div>

                    <div className="mt-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-white whitespace-nowrap">
                      {person.name}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
