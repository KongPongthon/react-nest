import { Room } from '@/page/poker'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protect/poker/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Room />
}
