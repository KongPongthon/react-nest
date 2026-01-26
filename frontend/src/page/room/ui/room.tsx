import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RoomForm } from './roomForm'
import { List, Plus } from 'lucide-react'
import { useState } from 'react'
import { useGetRoom, usePostRoom } from '@/api/room/hook/quries'
import { CustomTable, TableColumn } from '@/components/Custom/Table'
import { cn } from '@/lib/utils'
import { useRouter } from '@tanstack/react-router'

export function Room() {
  const [activeTab, setActiveTab] = useState<string>('create')
  const [mode, setMode] = useState<'create' | 'join'>('create')
  const [name, setName] = useState('')
  const [topic, setTopic] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const getRoolALl = useGetRoom()
  const postRoom = usePostRoom()
  const { data: rooms } = getRoolALl
  const router = useRouter()
  const handleSelectRoom = (id: number | string) => {
    router.navigate({
      to: `/room/${id}`,
    })
  }

  const handleJoinRoom = (name: string, roomCode: string) => {
    try {
      console.log('name', name, roomCode)
    } catch (error) {
      console.log(error)
    }
  }
  const handleCreateRoom = async (name: string, topic: string) => {
    try {
      console.log('name', name, topic)
      if (!name || !topic) return

      await postRoom.mutateAsync({ name, topic })
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
                    key: 'name',
                    name: 'name',
                  },
                ] as TableColumn<{ name: string }>[]
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
