// src/hooks/useWebSocket.ts
import { API_URL_SOCKET } from '@/constants'
import { useEffect, useState, useRef, useCallback } from 'react'

// src/types/room.types.ts

export interface CreateRoomDto {
  name: string
  nameRoom: string
  password?: string
}

export interface JoinRoomDto {
  roomId: string
  name: string
  password?: string
}

export interface DeleteRoomDto {
  roomId: number
}

export interface RoomBase {
  nameCode: string
}

export interface RoomList extends RoomBase {
  id: number
}

export interface RoomCreate extends RoomBase {
  id: number
  name: string
  password?: string
}

export interface ServerToClientEvents {
  'rooms-list': (rooms: RoomList[]) => void
  'room-created': (room: RoomCreate) => void
  'room-deleted': (roomId: number) => void
}

export interface ClientToServerEvents {
  'create-room': (data: CreateRoomDto) => void
  'delete-room': (roomId: number) => void
}

export interface WebSocketMessage<T = any> {
  event: string
  data: T
}

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const messageHandlersRef = useRef<Map<string, Set<(data: any) => void>>>(
    new Map(),
  )

  const reconnectAttemptsRef = useRef<number>(0)
  const maxReconnectAttempts = 5

  const connect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached. Stopping...')
      return
    }

    try {
      console.log('📡 Connecting to WebSocket...', API_URL_SOCKET)
      const ws = new WebSocket(API_URL_SOCKET)
      ws.onopen = () => {
        setIsConnected(true)
        reconnectAttemptsRef.current = 0 // ✅ Reset counter เมื่อเชื่อมต่อสำเร็จ
        console.log('✅ WebSocket connected')
      }

      ws.onclose = (event) => {
        setIsConnected(false)
        console.log('❌ WebSocket disconnected', event.code, event.reason)

        // ✅ Auto reconnect แต่มีจำกัด
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1
          const delay = Math.min(1000 * reconnectAttemptsRef.current, 5000) // Exponential backoff

          console.log(
            `🔄 Reconnecting... (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}) in ${delay}ms`,
          )

          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, delay)
        } else {
          console.error('❌ Max reconnection attempts reached')
        }
      }

      ws.onerror = (error) => {
        console.error('🔴 WebSocket error:', error)
      }

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          console.log('TEST', message)

          console.log('📨 Received:', message.event, message.data)

          const handlers = messageHandlersRef.current.get(message.event)
          if (handlers) {
            handlers.forEach((handler) => handler(message.data))
          }
        } catch (error) {
          console.error('Error parsing message:', error)
        }
      }

      wsRef.current = ws
    } catch (error) {
      console.error('Error connecting to WebSocket:', error)
    }
  }, [])

  const send = useCallback(<T>(event: string, data: T) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage<T> = { event, data }
      wsRef.current.send(JSON.stringify(message))
      console.log('📤 Sent:', event, data)
    } else {
      console.warn('WebSocket is not connected')
    }
  }, [])

  const on = useCallback((event: string, handler: (data: any) => void) => {
    if (!messageHandlersRef.current.has(event)) {
      messageHandlersRef.current.set(event, new Set())
    }
    messageHandlersRef.current.get(event)!.add(handler)

    return () => {
      const handlers = messageHandlersRef.current.get(event)
      if (handlers) {
        handlers.delete(handler)
        if (handlers.size === 0) {
          messageHandlersRef.current.delete(event)
        }
      }
    }
  }, [])

  // ✅ ฟังก์ชัน manual reconnect
  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0
    if (wsRef.current) {
      wsRef.current.close()
    }
    connect()
  }, [connect])

  useEffect(() => {
    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      wsRef.current?.close()
    }
  }, [connect])

  return { isConnected, send, on, reconnect }
}
