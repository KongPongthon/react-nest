import { useJoinRoom } from '@/api/room/hook/mutation'
import { useWebSocket } from '@/hooks/useWebSocket'
import { isConnectSocket } from '@/lib/utils'
import { useRouter } from '@tanstack/react-router'
import { useState } from 'react'

export const useForm = () => {
  const [name, setName] = useState('')
  const [topic, setTopic] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [mode, setMode] = useState<'create' | 'join'>('create')
  const [openCreateRoom, setOpenCreateRoom] = useState(false)
  const { isConnected } = useWebSocket()
  const joingRoom = useJoinRoom()

  const router = useRouter()

  const handleJoinRoom = (roomCode: string) => {
    try {
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
    } catch (error) {
      console.log(error)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Check Create')

    if (!isConnectSocket(isConnected)) return
    e.preventDefault()
    if (mode === 'create') {
      // handleCreateRoom()
      setOpenCreateRoom(true)
    } else {
      handleJoinRoom(roomCode)
    }
  }

  const handleCloseCreate = () => {
    setOpenCreateRoom(false)
  }

  return {
    name,
    setName,
    topic,
    setTopic,
    roomCode,
    setRoomCode,
    mode,
    setMode,
    openCreateRoom,
    setOpenCreateRoom,
    handleSubmit,
    handleCloseCreate,
  }
}
