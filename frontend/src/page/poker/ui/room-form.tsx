import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Plus, Users } from 'lucide-react'
import { Button } from '@/components/button'
import { CreateRoom } from './create-room'
import { useForm } from '../hook/hook-form'
interface RoomFormProps {
  name: string
}
export function RoomForm({ name }: RoomFormProps) {
  const {
    mode,
    setMode,
    roomCode,
    setRoomCode,
    handleSubmit,
    openCreateRoom,
    handleCloseCreate,
  } = useForm()
  return (
    <div>
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-full max-w-md mx-auto space-y-6 animate-slide-up">
          {/* Mode Tabs */}
          <div className="flex rounded-xl bg-card border border-border p-1">
            <Button
              variant={mode === 'create' ? 'default' : 'ghost'}
              type="button"
              data-testid="create-room-button"
              onClick={() => setMode('create')}
              className={cn(
                `flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-20`,
              )}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              สร้างห้อง
            </Button>
            <Button
              variant={mode === 'join' ? 'default' : 'ghost'}
              type="button"
              data-testid="join-room-button"
              onClick={() => setMode('join')}
              className={cn(
                `flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-20 `,
              )}
            >
              <Users className="w-4 h-4 inline mr-2" />
              เข้าห้อง
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  maxLength={12}
                  required
                />
              </div>
            )}

            <Button
              type="submit"
              data-testid={name}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-6 border hover:cursor-pointer"
            >
              {mode === 'create' ? 'สร้างห้องใหม่' : 'เข้าร่วมห้อง'}
            </Button>
          </form>
        </div>
      </div>
      <CreateRoom isOpen={openCreateRoom} onClose={handleCloseCreate} />
    </div>
  )
}
