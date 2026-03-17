import { useParams } from '@tanstack/react-router'
import { useRoomPoker } from './hook'

export function CardVoice() {
  const { id } = useParams({ from: '/_protect/poker/$id/' })
  const scoreCard = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  const { handleSelectScoreCard } = useRoomPoker()
  return (
    <div className="flex gap-4 justify-center">
      {scoreCard.map((item) => (
        <div
          onClick={() => handleSelectScoreCard(item, id)}
          key={item}
          className="hover:scale-90 hover:cursor-pointer border h-30 w-20 flex justify-center items-center text-2xl text-white bg-amber-400"
        >
          {item}
        </div>
      ))}
    </div>
  )
}
