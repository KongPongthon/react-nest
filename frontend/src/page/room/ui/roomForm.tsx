import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Plus, Users } from 'lucide-react'

interface IRoomFormProps {
  name: string
  onCreateRoom: () => void
  onJoinRoom: (roomCode: string) => void
  setMode: (mode: 'create' | 'join') => void
  mode: 'create' | 'join'
  roomCode: string
  setRoomCode: (roomCode: string) => void
}
export function RoomForm({
  name,
  onCreateRoom,
  onJoinRoom,
  setMode,
  mode,
  roomCode,
  setRoomCode,
}: IRoomFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'create') {
      onCreateRoom()
    } else {
      onJoinRoom(roomCode.trim().toUpperCase())
    }
  }
  return (
    <div>
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-full max-w-md mx-auto space-y-6 animate-slide-up">
          {/* Mode Tabs */}
          <div className="flex rounded-xl bg-card border border-border p-1">
            <button
              type="button"
              data-testid="create-room-button"
              onClick={() => setMode('create')}
              className={cn(
                `flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-20`,
                mode === 'create'
                  ? 'bg-primary text-primary-foreground border border-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              สร้างห้อง
            </button>
            <button
              type="button"
              onClick={() => setMode('join')}
              className={cn(
                `flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-20 `,
                mode === 'join'
                  ? 'bg-primary text-primary-foreground border border-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Users className="w-4 h-4 inline mr-2" />
              เข้าห้อง
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">
                ชื่อของคุณ
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ใส่ชื่อของคุณ"
                className="bg-card border-border focus:border-primary"
                required
              />
            </div> */}

            {/* {mode === 'create' ? (
              <div className="space-y-2">
                <Label htmlFor="topic" className="text-foreground">
                  หัวข้อที่จะโหวต
                </Label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="เช่น: User Story #123"
                  className="bg-card border-border focus:border-primary"
                  required
                />
              </div>
            ) : ( */}
            {mode === 'join' && (
              <div className="space-y-2">
                <Label htmlFor="roomCode" className="text-foreground">
                  รหัสห้อง
                </Label>
                <Input
                  id="roomCode"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="เช่น: ABC123"
                  className="bg-card border-border focus:border-primary font-mono uppercase"
                  maxLength={6}
                  required
                />
              </div>
            )}

            <Button
              type="button"
              data-testid={name}
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-6 border hover:cursor-pointer"
            >
              {mode === 'create' ? 'สร้างห้องใหม่' : 'เข้าร่วมห้อง'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
