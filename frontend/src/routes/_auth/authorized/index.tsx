import { createFileRoute, useLocation } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/authorized/')({
  component: () => <RouteComponent />,
})

function RouteComponent() {
  const location = useLocation()
  return <div>Authorized: {location.hash}</div>
}
