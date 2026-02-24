import { useSitdown } from '@/api/room/hook/mutation'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useRouter } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'

interface Person {
  id: string
  userName: string
  role: string
  index: number
}

export function useRoomPoker() {
  const { on, idConnect } = useWebSocket()
  const [id, setId] = useState('')

  const [peopleSitdown, setPeopleSitdown] = useState<Person[]>([])
  const radius = 250
  const MAX_SEATS = 10
  const sitdown = useSitdown()

  const { send } = useWebSocket()
  const router = useRouter()

  useEffect(() => {
    const unsubscribeSitdown = on('update-seats', (roomsList) => {
      console.log('📋 Received Join Room Sitdown:', roomsList)
      setPeopleSitdown(roomsList.seats)
    })
    return () => {
      unsubscribeSitdown()
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

  const handleSitdown = async (index: number) => {
    try {
      await sitdown.mutateAsync({
        indexChair: index.toString(),
        idConnect: idConnect,
        roomId: id,
      })
    } catch (error) {
      console.log(error)
    }
  }

  const handleCloseRoom = () => {
    router.navigate({ to: '/room' })
    send('leave_room', id)
  }

  return {
    memberSitDown,
    handleSitdown,
    setId,
    radius,
    handleCloseRoom,
  }
}
