import { useWebSocket } from '@/hooks/useWebSocket'
import { useEffect, useState } from 'react'

export function useCardVoice() {
  const { on, send, idConnect } = useWebSocket()
  const [scoreCard, setScoreCard] = useState<number>(0)
  useEffect(() => {
    const unsubscribeSelectCard = on('select-card', (data) => {
      setScoreCard(data)
    })
    return () => {
      unsubscribeSelectCard()
    }
  }, [on])

  const handleSelectScoreCard = (score: number, id: string) => {
    setScoreCard(score)
    send('update-score', {
      score,
      idConnect,
      roomId: id,
    })
  }

  return {
    handleSelectScoreCard,
    scoreCard,
  }
}
