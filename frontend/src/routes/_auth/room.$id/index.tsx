import { RoomPoker } from '@/page/room/ui/room-poker'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/room/$id/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <RoomPoker />
}
