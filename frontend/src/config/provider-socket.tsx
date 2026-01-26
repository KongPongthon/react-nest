import { API_URL_SOCKET } from '@/constants'
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

// กำหนด Interface สำหรับข้อมูล
interface WebSocketContextType {
  lastMessage: any
  sendMessage: (data: any) => void
  isConnected: boolean
}

const WebSocketContext = createContext<WebSocketContextType | null>(null)

export const WebSocketProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [lastMessage, setLastMessage] = useState<any>(null)
  const [isConnected, setIsConnected] = useState(false)
  const socket = useRef<WebSocket | null>(null)

  useEffect(() => {
    try {
      socket.current = new WebSocket(`ws://localhost:8080/ws`)

      socket.current.onopen = () => setIsConnected(true)
      socket.current.onclose = () => setIsConnected(false)
      socket.current.onmessage = (event) => {
        try {
          setLastMessage(JSON.parse(event.data))
        } catch {
          setLastMessage(event.data)
        }
      }

      // Cleanup: ปิดการเชื่อมต่อเมื่อปิดแอป หรือลบ Provider
      return () => {
        socket.current?.close()
      }
    } catch (e) {
      console.log('error', e)
    }
  }, [])

  // ฟังก์ชันสำหรับส่งข้อมูล
  const sendMessage = (data: any) => {
    if (socket.current?.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify(data))
    }
  }

  return (
    <WebSocketContext.Provider
      value={{ lastMessage, sendMessage, isConnected }}
    >
      {children}
    </WebSocketContext.Provider>
  )
}

// Hook สำหรับดึงไปใช้งานใน Component อื่นๆ
export const useWebsocket = () => {
  const context = useContext(WebSocketContext)
  if (!context)
    throw new Error('useWebsocket must be used within WebSocketProvider')
  return context
}
