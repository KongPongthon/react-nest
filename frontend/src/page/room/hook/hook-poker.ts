import { useSitdown } from '@/api/room/hook/mutation'
import { useGetUserInRoom } from '@/api/room/hook/quries'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useAuthStore } from '@/store/auth-store'
import { useRouter } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
interface Person {
  userId: string
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
  const [peopleJoinRoom, setPeopleJoinRoom] = useState<Person[]>([])

  const [scoreCard, setScoreCard] = useState<number>(0)

  const { send } = useWebSocket()
  const router = useRouter()

  const { user } = useAuthStore()
  const [serverTime, setServerTime] = useState(0)
  const { data: peopleInRoom } = useGetUserInRoom({
    variables: id,
    enabled: !!id,
  })

  useEffect(() => {
    if (peopleInRoom) {
      setPeopleJoinRoom(peopleInRoom)
    }
  }, [peopleInRoom])

  useEffect(() => {
    const unsubscribeSitdown = on('update-seats', (roomsList) => {
      console.log('📋 Received Sitdown:', roomsList)
      setPeopleSitdown(roomsList.seats)
    })

    const unsubscribeJoinRoom = on('update-room', (data) => {
      console.log('📋 Received update Room:', data)
      setPeopleJoinRoom(data)
    })

    const unsubscribeStartVote = on('start-vote', (data) => {
      console.log('📋 Received start Vote:', data)
      setServerTime(data)
    })
    return () => {
      unsubscribeSitdown()
      unsubscribeJoinRoom()
      unsubscribeStartVote()
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
    router.navigate({ to: '/poker' })
    send('leave_room', id)
  }

  const handleSelectScoreCard = (score: number, id: string) => {
    setScoreCard(score)
    send('update-score', {
      score,
      idConnect,
      roomId: id,
    })
  }

  const isOwner = useMemo(() => {
    console.log('user', user)
    console.log('peopleSitdown', peopleSitdown)
    if (!user) return false
    return peopleSitdown.find((p) => p.userId === user?.id)
  }, [peopleSitdown, user.id])

  return {
    memberSitDown,
    handleSitdown,
    setId,
    radius,
    handleCloseRoom,
    peopleJoinRoom,
    handleSelectScoreCard,
    scoreCard,
    serverTime,
    isOwner,
  }
}
