import { useEffect, useState } from 'react'
import { CustomTable, TableColumn } from '@/components/Custom/Table'
import { cn } from '@/lib/utils'
import { useRouter } from '@tanstack/react-router'
import { RoomForm } from './roomForm'
import { useJoinRoom, usePostRoom } from '@/api/room/hook/mutation'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useGetRooms } from '@/api/room/hook/quries'

interface RoomList {
  id: number
  roomCode: string
}
export function Room() {
  const [activeTab, setActiveTab] = useState<string>('create')
  const [mode, setMode] = useState<'create' | 'join'>('create')
  const [name, setName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [rooms, setRooms] = useState<RoomList[]>([])
  const router = useRouter()
  const createRoom = usePostRoom()
  const { on, idConnect } = useWebSocket()
  const joingRoom = useJoinRoom()

  const { data, isSuccess } = useGetRooms()

  useEffect(() => {
    if (isSuccess && data) {
      setRooms(data)
    }
  }, [isSuccess, data])

  useEffect(() => {
    const unsubscribeList = on('rooms-list', (roomsList: RoomList[]) => {
      console.log('📋 Received rooms list:', roomsList)
      setRooms(roomsList)
    })
    return () => {
      unsubscribeList()
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

    joingRoom.mutateAsync(
      { id, idConnect },
      {
        onSuccess: (newRoomId) => {
          router.navigate({ to: `/room/${newRoomId}/` })
        },
        onError: (error) => {
          console.log('Error:', error)
        },
      },
    )
  }
  const handleCreateRoom = () => {
    try {
      createRoom.mutateAsync()
    } catch (error) {
      console.log(error)
    }
  }

  const handleTab = (value: string) => {
    setActiveTab(value)
  }

  const handleMode = (value: 'create' | 'join') => {
    setName('')
    setRoomCode('')

    setMode(value)
  }

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
                  key: 'roomCode',
                  name: 'ชื่อห้อง',
                },
              ] as TableColumn<{ roomCode: string }>[]
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
