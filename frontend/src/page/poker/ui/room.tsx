import { useEffect, useState } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useGetRooms } from '@/api/room/hook/quries'
import { RoomList } from '@/api/room/types'
import RoomTable from './component/room-table'
import BaseAlert from '@/components/base-alert'

export function Room() {
  const [rooms, setRooms] = useState<RoomList[]>([])
  const { on } = useWebSocket()

  const { data, isSuccess } = useGetRooms()

  useEffect(() => {
    if (isSuccess && data) {
      setRooms(data)
    }
  }, [isSuccess, data])

  const upDateRoom = (roomsList: RoomList[]) => {
    setRooms(roomsList)
  }

  useEffect(() => {
    const unsubscribeList = on('rooms-list', upDateRoom)
    return () => {
      unsubscribeList()
    }
  }, [on])

  return (
    <div
      className="h-full min-h-screen w-full flex justify-center items-center"
      data-testid="room"
    >
      <RoomTable rooms={rooms} />
    </div>
  )
}
