import { RoomPokerDetail } from './room-poker-detail'

export function RoomPoker() {
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
