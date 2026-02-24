import { RoomPoker } from '@/page/room/ui/room-detail/room-poker'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protect/room/$id/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <RoomPoker />
}
