import { useGetRoom } from '@/api/room/hook/quries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Plus, Users } from 'lucide-react'
import { useState } from 'react'

interface IRoomFormProps {
  onCreateRoom: ({ name, topic }: { name: string; topic: string }) => void
  onJoinRoom: (name: string, roomCode: string) => void
}
export function RoomForm({ onCreateRoom, onJoinRoom }: IRoomFormProps) {
  const [mode, setMode] = useState<'create' | 'join'>('create')
  const [name, setName] = useState('')
  const [topic, setTopic] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    if (mode === 'create') {
      if (!topic.trim()) return
      onCreateRoom({ name: name.trim(), topic: topic.trim() })
    } else {
      if (!roomCode.trim()) return
      onJoinRoom(name.trim(), roomCode.trim().toUpperCase())
    }
  }
  return (
    <div>
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-full max-w-md mx-auto space-y-6 animate-slide-up">
          {/* Mode Tabs */}
          <div className="flex rounded-xl bg-card border border-border p-1">
            <button
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
            <div className="space-y-2">
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
            </div>

            {mode === 'create' ? (
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
            ) : (
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
