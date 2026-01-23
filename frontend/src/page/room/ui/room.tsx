import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RoomForm } from './roomForm'
import { List, Plus } from 'lucide-react'
import { useState } from 'react'
import { useGetRoom } from '@/api/room/hook/quries'
import { CustomTable } from '@/components/Custom/Table'
import { cn } from '@/lib/utils'

export function Room() {
  const [activeTab, setActiveTab] = useState<string>('create')
  const getRoolALl = useGetRoom()
  const { data: rooms } = getRoolALl
  console.log('rooms', rooms)
  return (
    <div className="h-full min-h-screen w-full flex justify-center items-center">
      <div className="w-full h-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="">
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
            <RoomForm onCreateRoom={() => {}} onJoinRoom={() => {}} />
          </TabsContent>
          <TabsContent value="rooms" className="animate-slide-up">
            <CustomTable
              data={rooms}
              columns={[
                {
                  key: 'id',
                  name: 'id',
                },
                {
                  key: 'name',
                  name: 'name',
                },
              ]}
              page={0}
              rowsPerPage={10}
              totalItems={rooms?.length || 0}
              handleOnChange={(id) => {
                console.log(id)
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
