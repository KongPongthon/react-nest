import { cn } from '@/lib/utils'
import { Crown, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'

export function RoomPokerDetail() {
  const [people, setPeople] = useState([
    { id: 1, name: 'คุณ', role: 'Host', index: 0 },
    { id: 2, name: 'สมชาย', role: 'Member', index: 1 },
    { id: 3, name: 'วิภา', role: 'Member', index: 2 },
    { id: 4, name: 'มานะ', role: 'Member', index: 3 },
    { id: 5, name: 'จอย', role: 'Member', index: 4 },
    { id: 6, name: 'ก้อง', role: 'Member', index: 5 },
    { id: 7, name: 'ก้อง', role: 'Member', index: 6 },
  ])
  const radius = 200
  const memberSitDown = useMemo(() => {
    const MAX = 10
    return Array.from({ length: MAX }, (_, i) => {
      const person = people[i]
      return {
        id: person?.id ?? `guest-${i}`,
        name: person?.name ?? 'Guest',
        role: person?.role ?? 'Guest',
        index: person?.index ?? i,
      }
    })
  }, [people])

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
                      onClick={() => console.log(person.id)}
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
