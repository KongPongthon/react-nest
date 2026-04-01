import { useForm } from '@tanstack/react-form'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useEffect, useState } from 'react'

export function useCardIssue() {
  const [isOpenCardIssue, setIsOpenCardIssue] = useState<boolean>(false)
  const { send } = useWebSocket()
  const [cardIssue, setCardIssue] = useState<any[]>([])
  const { on } = useWebSocket()

  useEffect(() => {
    const unsubscribeCreateCard = on('create-card', (data) => {
      console.log('📋 Received create Card:', data)
      setCardIssue(data)
    })
    return () => {
      unsubscribeCreateCard()
    }
  }, [on])
  const form = useForm({
    defaultValues: {
      id: '',
      title: '',
      link: '',
      description: '',
    },
    onSubmit: async ({ value }) => {
      // นี่คือจุดที่ Logic ทำงานต่อหลังจากกด Save
      console.log('Form Submitted:', value)
      send('create-card', {
        title: value.title,
        link: value.link,
        description: value.description,
        roomId: value.id,
      })
      // ทำการเรียก API หรือปิด Dialog ตรงนี้
      setIsOpenCardIssue(false)
    },
  })

  const handleSelectCardVote = (cardId: string, roomId: string) => {
    console.log('ID Card :', cardId, roomId)
    send('select-card', { cardId, roomId })
  }

  const handleSelectCardIssue = () => {
    setIsOpenCardIssue(!isOpenCardIssue)
  }

  const handleStartVote = (id: string) => {
    send('start-vote', id)
  }
  return {
    form,
    isOpenCardIssue,
    handleSelectCardIssue,
    cardIssue,
    handleSelectCardVote,
    handleStartVote,
  }
}
