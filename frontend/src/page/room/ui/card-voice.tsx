import { useRoomPoker } from "./hook"

export function CardVoice() {
  const scoreCard = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  const { handleSelectScoreCard } = useRoomPoker()
  return (
    <div className="flex gap-4">
      {scoreCard.map((item) => (
        <div
          onClick={() => handleSelectScoreCard(item)}
          key={item}
          className="hover:scale-90 hover:cursor-pointer border h-36 w-24 flex justify-center items-center text-2xl text-white bg-amber-400"
        >
          {item}
        </div>
      ))}
    </div>
  )
}
