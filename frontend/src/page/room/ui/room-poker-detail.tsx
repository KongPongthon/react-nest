import { cn } from '@/lib/utils'
import { Crown, Plus } from 'lucide-react'
import { useRoomPoker } from './hook'

type Side = 'top' | 'right' | 'bottom' | 'left'

interface SeatPosition {
  side: Side
  position: number
}

const seatMap: SeatPosition[] = [
  { side: 'top', position: 0 },
  { side: 'top', position: 1 },
  { side: 'top', position: 2 },
  { side: 'top', position: 3 },

  { side: 'right', position: 0 },

  { side: 'bottom', position: 0 },
  { side: 'bottom', position: 1 },
  { side: 'bottom', position: 2 },
  { side: 'bottom', position: 3 },

  { side: 'left', position: 0 },
]

interface RectangleConfig {
  width?: number
  height?: number
  margin?: number
}

export const getSeatPosition = (
  seatIndex: number,
  config: RectangleConfig = {},
) => {
  const { width = 700, height = 300, margin = 90 } = config

  const seat = seatMap[seatIndex]
  if (!seat) return { x: 0, y: 0 }

  const { side, position } = seat

  const topCount = 4
  const bottomCount = 4
  const rightCount = 1
  const leftCount = 1

  if (side === 'top') {
    const gap = width / (topCount + 1)
    return {
      x: -width / 2 + gap * (position + 1),
      y: -height / 2 - margin,
    }
  }

  if (side === 'right') {
    const gap = height / (rightCount + 1)
    return {
      x: width / 3 + margin,
      y: -height / 2 + gap * (position + 1),
    }
  }

  if (side === 'bottom') {
    const gap = width / (bottomCount + 1)
    return {
      x: -width / 2 + gap * (position + 1),
      y: height / 2 + margin,
    }
  }

  // left
  const gap = height / (leftCount + 1)
  return {
    x: -width / 3 - margin,
    y: -height / 2 + gap * (position + 1),
  }
}

export function RoomPokerDetail() {
  const { memberSitDown, handleSitdown, radius } = useRoomPoker()
  return (
    <div className="h-full w-full flex justify-center items-center min-h-150">
      <div className="relative flex items-center justify-center">
        {/* ตัวโต๊ะ (Table Center) */}
        <div className="absolute w-120 h-50 rounded-lg bg-primary-400 shadow-2xl flex items-center justify-center z-10">
          <div className="text-white font-bold tracking-widest text-sm">
            MEETING ROOM
          </div>
        </div>

        {memberSitDown.map((person, index) => {
          // const sitDownCount = 8
          // const angle = person.index * (360 / sitDownCount) + 90
          const { x, y } = getSeatPosition(index)
          return (
            <div
              key={person.id}
              className="absolute transition-all duration-500 ease-in-out"
              // style={{
              //   transform: `rotate(${angle}deg) translate(${radius}px) rotate(-${angle}deg)`,
              // }}
              style={{
                transform: `translate(${x}px, ${y}px)`,
              }}
            >
              {person.role === 'Guest' ? (
                <div className="flex flex-col items-center group">
                  <div
                    data-testid={`sitdown-${person.index}`}
                    className={cn(
                      `
                  w-20 h-30  border-4 flex items-center justify-center text-white font-bold text-xs shadow-lg
                  group-hover:scale-110 transition-transform cursor-pointer bg-primary-400
                `,
                    )}
                    onClick={() => handleSitdown(person.index)}
                  ></div>
                </div>
              ) : (
                <div className="flex flex-col items-center group">
                  <div
                    data-testid={`sitdown-${person.index}`}
                    className={cn(
                      `
                  w-20 h-30  border-4 flex items-center justify-center text-white font-bold text-xs shadow-lg
                  group-hover:scale-110 transition-transform cursor-pointer bg-primary-400
                `,
                    )}
                    onClick={() => handleSitdown(person.index)}
                  ></div>
                  <div className="h-20 w-20 rounded-full bg-accent flex items-center justify-center text-center">
                    {person.userName.charAt(0)}
                    {person.role === 'Host' && (
                      <Crown
                        data-testid="host-icon"
                        className="bottom-1/4 left-1/2 transform -translate-x-1/2 absolute"
                      />
                    )}
                  </div>
                </div>
                // <div className="flex flex-col items-center group">
                //   <div
                //     data-testid={`situp-${person.index}`}
                //     className={cn(
                //       `
                //   w-16 h-16 rounded-full border-4 flex items-center justify-center text-white font-bold text-xs shadow-lg
                //   group-hover:scale-110 transition-transform cursor-pointer bg-slate-700
                // `,
                //     )}
                //     onClick={() => handleSitdown(person.index)}
                //   >
                //     {person.role === 'Host' && (
                //       <Crown
                //         data-testid="host-icon"
                //         className="top-0 left-1/2 transform -translate-x-1/2 absolute"
                //       />
                //     )}
                //     {person.userName.charAt(0)}
                //   </div>

                //   <div className="mt-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-white whitespace-nowrap">
                //     {person.userName}
                //   </div>
                // </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
