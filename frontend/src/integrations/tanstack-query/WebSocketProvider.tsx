// src/providers/WebSocketProvider.tsx
import { useGetShortToken } from '@/api/auth/hook/quries'
import { API_URL_SOCKET } from '@/constants'
import { useRouter } from '@tanstack/react-router'
import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

interface WebSocketMessage<T = any> {
  event: string
  data: T
}

interface WebSocketContextType {
  isConnected: boolean
  send: <T>(event: string, data: T) => void
  on: (event: string, handler: (data: any) => void) => () => void
  reconnect: () => void
  idConnect: string
}

export const WebSocketContext = createContext<WebSocketContextType | null>(null)

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState(false)
  const router = useRouter()
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)

  const messageHandlersRef = useRef<Map<string, Set<(data: any) => void>>>(
    new Map(),
  )

  const [idConnect, setIdConnect] = useState<string>('')
  const maxReconnectAttempts = 5
  const { data, isSuccess } = useGetShortToken()
  const token = isSuccess && data ? data : null

  const connect = useCallback((accessToken: string) => {
    console.log('📡 Connecting WebSocket...')

    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached')
      return
    }

    if (!accessToken) {
      console.error('❌ Token not found')
      return
    }
    console.log('📡 Connecting WebSocket...', API_URL_SOCKET, accessToken)
    const ws = new WebSocket(`${API_URL_SOCKET}?token=${accessToken}`)

    ws.onopen = () => {
      console.log('✅ WebSocket connected', 'WS readyState:', ws.readyState, ws)
      setIsConnected(true)
      reconnectAttemptsRef.current = 0
    }

    ws.onclose = (event) => {
      console.log('❌ WebSocket closed', event.code, event.reason)
      setIsConnected(false)

      if (event.reason === 'Replaced by new socket') {
        console.log('🔄 Socket replaced by new tab, stopping reconnect')
        router.navigate({ to: '/poker' })
        return
      }

      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current++
        const delay = Math.min(1000 * reconnectAttemptsRef.current, 5000)

        reconnectTimeoutRef.current = setTimeout(() => {
          if (!token) return
          connect(token)
        }, delay)
      }
    }

    ws.onerror = (err) => {
      setIsConnected(false)
      console.error('🔴 WebSocket error', err)
    }

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data)
        const handlers = messageHandlersRef.current.get(message.event)
        if (message.event === 'connect') {
          setIdConnect(message.data.username)
          console.log('myConnection', message.data.username)
        }

        handlers?.forEach((handler) => handler(message.data))
      } catch (e) {
        console.error('Error parsing WS message', e)
      }
    }

    wsRef.current = ws
  }, [])

  const send = useCallback(<T,>(event: string, data: T) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ event, data }))
    } else {
      console.warn('⚠️ WebSocket not connected')
    }
  }, [])

  const on = useCallback((event: string, handler: (data: any) => void) => {
    if (!messageHandlersRef.current.has(event)) {
      messageHandlersRef.current.set(event, new Set())
    }

    messageHandlersRef.current.get(event)!.add(handler)

    // unsubscribe
    return () => {
      const handlers = messageHandlersRef.current.get(event)
      handlers?.delete(handler)

      if (handlers && handlers.size === 0) {
        messageHandlersRef.current.delete(event)
      }
    }
  }, [])

  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0
    wsRef.current?.close()
    if (!token) return
    connect(token)
  }, [token])

  useEffect(() => {
    if (!token) return
    connect(token)
    return () => {
      reconnectTimeoutRef.current && clearTimeout(reconnectTimeoutRef.current)
      wsRef.current?.close()
    }
  }, [token])

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        send,
        on,
        reconnect,
        idConnect,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  )
}
