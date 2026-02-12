import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WebSocketProvider } from './WebSocketProvider'

export function getContext() {
  const queryClient = new QueryClient()
  return {
    queryClient,
  }
}

export function Provider({
  children,
  queryClient,
}: {
  children: React.ReactNode
  queryClient: QueryClient
}) {
  return (
    <WebSocketProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WebSocketProvider>
  )
}
