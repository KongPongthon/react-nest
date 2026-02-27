import { useJoinRoom, usePostRoom } from '@/api/room/hook/mutation'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useRouter } from '@tanstack/react-router'
import { useState } from 'react'

export const useRoom = () => {
  const [activeTab, setActiveTab] = useState<string>('create')
  const [mode, setMode] = useState<'create' | 'join'>('create')
  const createRoom = usePostRoom()
  const [roomCode, setRoomCode] = useState('')
  const router = useRouter()

  const { idConnect, isConnected } = useWebSocket()
  const joingRoom = useJoinRoom()

  const handleTab = (value: string) => {
    setActiveTab(value)
  }
  const handleMode = (value: 'create' | 'join') => {
    setMode(value)
  }

  const handleCreateRoom = () => {
    if (!isConnectSocket(isConnected)) return
    createRoom.mutateAsync()
  }

  const handleJoinRoom = (roomCode: string) => {
    try {
      const id = parseInt(roomCode)
      if (!isConnectSocket(isConnected)) return

      joingRoom.mutateAsync(
        { id, idConnect },
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

  const handleSelectRoom = (id: number) => {
    if (!isConnectSocket(isConnected)) return
    joingRoom.mutateAsync(
      { id, idConnect },
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

  const handleSubmit = (e: React.FormEvent) => {
    if (!isConnectSocket(isConnected)) return
    e.preventDefault()
    if (mode === 'create') {
      handleCreateRoom()
    } else {
      handleJoinRoom(roomCode)
    }
  }

  return {
    activeTab,
    setActiveTab,
    mode,
    setMode,
    createRoom,
    roomCode,
    setRoomCode,
    router,
    idConnect,
    joingRoom,
    handleTab,
    handleMode,
    handleCreateRoom,
    handleJoinRoom,
    handleSelectRoom,
    handleSubmit,
  }
}

export const isConnectSocket = (status: boolean): boolean => {
  if (!status) {
    console.log('please refresh page')
    return false
  }
  return true
}
