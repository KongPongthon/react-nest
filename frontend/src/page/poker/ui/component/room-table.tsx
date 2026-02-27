import { cn } from '@/lib/utils'
import { RoomForm } from './room-form'
import { RoomList } from '@/api/room/types'
import { useRoom } from '../hook'
import BaseTable from '@/components/base-table'
interface RoomTableProps {
  rooms: RoomList[]
}

const RoomTable = ({ rooms }: RoomTableProps) => {
  const { activeTab, handleTab, handleSelectRoom } = useRoom()

  return (
    <div className="w-full h-full space-y-4">
      <div className="flex rounded-xl bg-card border border-border p-1">
        <button
          type="button"
          data-testid="create-types-button"
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
          type="button"
          data-testid="room-list-button"
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
      <div data-testid="room-form">
        {activeTab === 'create' && (
          <RoomForm
            name="btn-create-room"
            // onCreateRoom={handleCreateRoom}
            // onJoinRoom={handleJoinRoom}
            // setMode={handleMode}
            // mode={mode}
            // roomCode={roomCode}
            // setRoomCode={setRoomCode}
          />
        )}
        {activeTab === 'rooms' && (
          <div className="space-y-10">
            {/* <CustomTable
              data-testid={`room-${rooms?.length}`}
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
            /> */}
            <BaseTable<RoomList>
              columns={[
                {
                  accessorKey: 'id',
                  header: 'ลำดับ',
                  cell: (value) => {
                    return value.row.index + 1
                  },
                },
                {
                  accessorKey: 'roomCode',
                  header: 'ชื่อห้อง',
                },
              ]}
              data={rooms}
              limitOptions={[10, 20, 30]}
              totalCount={rooms.length}
              totalPage={Math.ceil(rooms.length / 10)}
              onRowClick={(row) => {
                handleSelectRoom(row.id)
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default RoomTable
