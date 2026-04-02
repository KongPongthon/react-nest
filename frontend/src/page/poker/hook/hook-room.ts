import { useJoinRoom } from '@/api/room/hook/mutation'
import { useWebSocket } from '@/hooks/useWebSocket'
import { isConnectSocket } from '@/lib/utils'
import { useRouter } from '@tanstack/react-router'
import { useState } from 'react'

export const useRoom = () => {
  const [activeTab, setActiveTab] = useState<string>('create')
  const router = useRouter()

  const { isConnected } = useWebSocket()

  const joingRoom = useJoinRoom()

  const handleTab = (value: string) => {
    setActiveTab(value)
  }

  const handleSelectRoom = (roomCode: string) => {
    if (!isConnectSocket(isConnected)) return
    joingRoom.mutateAsync(
      { roomCode },
      {
        onSuccess: (newRoomId) => {
          router.navigate({ to: `/poker/${newRoomId}/` })
        },
        onError: (error) => {
          console.log('Error:', error)
        },
      },
    )
  }

  return {
    activeTab,
    handleTab,
    handleSelectRoom,
  }
}
