export function CardVoice() {
  const scoreCard = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  return (
    <div className="flex gap-4">
      {scoreCard.map((item) => (
        <div
          onClick={() => console.log(item)}
          key={item}
          className="border h-48 w-24 flex justify-center items-center text-2xl text-white bg-amber-400"
        >
          {item}
        </div>
      ))}
    </div>
  )
}
