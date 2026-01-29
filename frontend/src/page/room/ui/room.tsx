import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RoomForm } from './roomForm'
import { List, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { CustomTable, TableColumn } from '@/components/Custom/Table'
import { cn } from '@/lib/utils'
import { useRouter } from '@tanstack/react-router'
import { RoomCreate, RoomList, useWebSocket } from '@/hooks/useWebSocket'
import { usePostRoom } from '@/api/room/hook/quries'

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

  const handleSelectRoom = (id: number | string) => {
    router.navigate({
      to: `/room/${id}`,
    })
  }

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
  const handleJoinRoom = (name: string, roomCode: string) => {
    try {
      console.log('name', name, roomCode)
    } catch (error) {
      console.log(error)
    }
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
  return (
    <div className="h-full min-h-screen w-full flex justify-center items-center">
      <div className="w-full h-full">
        <Tabs value={activeTab} onValueChange={handleTab} className="">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-card border border-border">
            <TabsTrigger
              value="create"
              className={`data-[state=active]:bg-primary data-[state=active]:text-primary-foreground ${
                activeTab === 'create'
              }`}
            >
              <Plus className="w-4 h-4 mr-2" />
              สร้าง/เข้าห้อง
            </TabsTrigger>
            <TabsTrigger
              value="rooms"
              className={cn(
                `data-[state=active]:bg-primary data-[state=active]:text-primary-foreground`,
                activeTab === 'rooms' ? 'border' : '',
              )}
            >
              <List className="w-4 h-4 mr-2" />
              รายการห้อง ({rooms && rooms.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="create" className="animate-slide-up">
            <RoomForm
              onCreateRoom={(name, topic) => handleCreateRoom(name, topic)}
              onJoinRoom={(name, roomCode) => handleJoinRoom(name, roomCode)}
              setMode={handleMode}
              mode={mode}
              name={name}
              setName={setName}
              topic={topic}
              setTopic={setTopic}
              roomCode={roomCode}
              setRoomCode={setRoomCode}
            />
          </TabsContent>
          <TabsContent value="rooms" className="animate-slide-up">
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
              handleOnChange={(id) => {
                handleSelectRoom(id)
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
