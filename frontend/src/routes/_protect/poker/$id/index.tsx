import { RoomPoker } from '@/page/room'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protect/poker/$id/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className='h-full w-full'><RoomPoker /></div>
}
