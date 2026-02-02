import { useEffect, useState } from 'react'
import { CustomTable, TableColumn } from '@/components/Custom/Table'
import { cn } from '@/lib/utils'
import { useRouter } from '@tanstack/react-router'
import { RoomCreate, RoomList, useWebSocket } from '@/hooks/useWebSocket'
import { useJoinRoom, usePostRoom } from '@/api/room/hook/quries'
import { RoomForm } from './roomForm'

export function Room() {
  const [activeTab, setActiveTab] = useState<string>('create')
  const [mode, setMode] = useState<'create' | 'join'>('create')
  const [name, setName] = useState('')
  const [topic, setTopic] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [rooms, setRooms] = useState<RoomList[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const createRoom = usePostRoom()
  const { on, reconnect, isConnected, send } = useWebSocket()
  const joingRoom = useJoinRoom()

  useEffect(() => {
    const unsubscribeList = on('rooms-list', (roomsList: RoomList[]) => {
      console.log('📋 Received rooms list:', roomsList)
      setRooms(roomsList)
      setLoading(false)
    })

    const unsubscribeCreated = on('room-created', (newRoom: RoomCreate) => {
      console.log('✨ New room created:', newRoom)

      const roomListItem: RoomList = {
        id: newRoom.id,
        nameCode: newRoom.nameCode,
      }

      setRooms((prev) => [...prev, roomListItem])
    })

    const unsubscribeDeleted = on('room-deleted', (roomId: number) => {
      console.log('🗑️ Room deleted:', roomId)
      setRooms((prev) => prev.filter((room) => room.id !== roomId))
    })

    const unsubscribeError = on('error', (error: { message: string }) => {
      alert(error.message)
    })

    return () => {
      unsubscribeList()
      unsubscribeCreated()
      unsubscribeDeleted()
      unsubscribeError()
    }
  }, [on])
  const handleJoinRoom = (roomCode: string) => {
    try {
      console.log('name', name, roomCode)
    } catch (error) {
      console.log(error)
    }
  }
  const handleSelectRoom = (id: number) => {
    console.log('TESTID', id)

    joingRoom.mutateAsync(id).then((newRoomId) => {
      console.log('newRoomId', newRoomId)

      if (newRoomId) {
        router.navigate({ to: `/room/${newRoomId}/` })
      }
    })
  }
  const handleCreateRoom = () => {
    try {
      createRoom.mutate({
        name,
        nameRoom: topic,
        password: roomCode,
      })
    } catch (error) {
      console.log(error)
    }
  }

  const handleTab = (value: string) => {
    setActiveTab(value)
  }

  const handleMode = (value: 'create' | 'join') => {
    setName('')
    setTopic('')
    setRoomCode('')

    setMode(value)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>กำลังโหลด...</p>
        {/* ✅ ปุ่ม Reconnect */}
        {!isConnected && (
          <button onClick={reconnect} className="reconnect-button">
            🔄 เชื่อมต่อใหม่
          </button>
        )}
      </div>
    )
  }
  console.log('rooms Table', rooms)

  return (
    <div className="h-full min-h-screen w-full flex justify-center items-center">
      <div className="w-full h-full space-y-4">
        <div className="flex rounded-xl bg-card border border-border p-1">
          <button
            onClick={() => handleTab('create')}
            className={cn(
              `flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-20`,
              activeTab === 'create'
                ? 'bg-primary text-primary-foreground border border-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            สร้างห้อง/เข้าห้อง
          </button>
          <button
            onClick={() => handleTab('rooms')}
            className={cn(
              `flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-20 `,
              activeTab === 'rooms'
                ? 'bg-primary text-primary-foreground border border-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            รายการห้อง ({rooms && rooms.length})
          </button>
        </div>
        {activeTab === 'create' && (
          <RoomForm
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            setMode={handleMode}
            mode={mode}
            roomCode={roomCode}
            setRoomCode={setRoomCode}
          />
        )}
        {activeTab === 'rooms' && (
          <CustomTable
            data={rooms}
            columns={
              [
                {
                  key: 'nameCode',
                  name: 'ชื่อห้อง',
                },
              ] as TableColumn<{ nameCode: string }>[]
            }
            page={0}
            rowsPerPage={10}
            totalItems={rooms?.length || 0}
            handleOnChange={(data) => {
              console.log('ID', data)

              handleSelectRoom(data.id)
            }}
          />
        )}
      </div>
    </div>
  )
}
