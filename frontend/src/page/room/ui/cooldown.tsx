import { useWebSocket } from '@/hooks/useWebSocket'
import { formatShortTime } from '@/lib/utils'
import { useEffect, useState, useMemo } from 'react'

interface CountdownProps {
  serverTime: number // สมมติว่าเป็น Timestamp เป้าหมายที่ Server ส่งมา
  roomId: string
}

export const Countdown = ({ serverTime, roomId }: CountdownProps) => {
  const { send } = useWebSocket()
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    // 1. ถ้าได้ 0 มาตั้งแต่แรก ไม่ต้องเริ่มจับเวลา
    if (!serverTime || serverTime === 0) {
      setRemaining(0)
      return
    }

    const tick = () => {
      const now = Date.now()
      const diff = serverTime - now

      if (diff <= 0) {
        setRemaining(0)
        send('stop-vote', roomId) // ส่งเฉพาะตอนหมดเวลาจริง
        return true // บอกว่าจบแล้ว
      }

      setRemaining(diff)
      return false
    }

    // รันครั้งแรกทันที
    tick()

    const timer = setInterval(() => {
      const isDone = tick()
      if (isDone) clearInterval(timer)
    }, 1000)

    return () => {
      // 2. ใน Cleanup ลบแค่ Timer ทิ้ง ห้ามส่ง 'stop-vote' เด็ดขาด!
      clearInterval(timer)
    }
  }, [serverTime, roomId]) // ใส่ roomId ใน dep ด้วยเพื่อความปลอดภัย

  if (remaining <= 0) return null

  // ปรับการแสดงผล: ถ้า formatShortTime รับ ms ให้ส่ง remaining
  // แต่ถ้ารับวินาที ให้ส่ง Math.ceil(remaining / 1000)
  return <p>{formatShortTime(remaining)} วินาที</p>
}
