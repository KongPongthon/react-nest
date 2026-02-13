import { WebSocketProvider } from '@/integrations/tanstack-query/WebSocketProvider'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_protect')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <WebSocketProvider>
      <Outlet />
    </WebSocketProvider>
  )
}
