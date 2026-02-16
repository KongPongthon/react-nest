import { useParams } from '@tanstack/react-router'
import { RoomPokerDetail } from './room-poker-detail'

export function RoomPoker() {
  const { id } = useParams({ from: '/_protect/room/$id/' })
  console.log(id)

  return (
    <div className="h-full">
      <div className="flex justify-end max-h-10">
        <button className="border p-2 rounded-lg hover:cursor-pointer">
          กลับหน้าแรก
        </button>
      </div>
      <RoomPokerDetail />
    </div>
  )
}
