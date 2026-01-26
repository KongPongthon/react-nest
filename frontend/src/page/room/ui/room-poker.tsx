import { useEffect, useState } from 'react'
import { RoomPokerDetail } from './room-poker-detail'
import { useWebsocket } from '@/config/provider-socket'

export function RoomPoker() {
  const { isConnected, sendMessage, lastMessage } = useWebsocket()
  useEffect(() => {
    if (isConnected) {
      const inRoom = sendMessage({
        type: 'JOIN_ROOM',
        payload: { roomId: 'poker-123' },
      })
    }
  }, [isConnected])
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'JOIN_SUCCESS') {
      console.log('ยินดีด้วย! คุณเข้าห้องสำเร็จแล้ว:', lastMessage.payload)
    }
  }, [lastMessage])
  return (
    <div className="h-full">
      <div className="flex justify-end max-h-[40px]">
        <button className="border p-2 rounded-lg hover:cursor-pointer">
          กลับหน้าแรก
        </button>
      </div>
      <RoomPokerDetail />
    </div>
  )
}
