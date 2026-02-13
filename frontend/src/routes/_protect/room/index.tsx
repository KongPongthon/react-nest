import { Room } from '@/page/room'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protect/room/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Room />
}
