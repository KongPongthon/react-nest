import { useGetRoom } from '@/api/room/hook/quries'
import { Label } from '@/components/ui/label'
import { Room } from '@/page/room'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/login/')({
  component: Room,
})
