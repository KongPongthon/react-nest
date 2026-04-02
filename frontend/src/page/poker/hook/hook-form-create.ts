import { useForm } from '@tanstack/react-form'
interface UseFormCreateProps {
  onClose: () => void
}
export const useFormCreate = ({ onClose }: UseFormCreateProps) => {
  const form = useForm({
    defaultValues: {
      name: '',
      time: 15,
      type: 'fibonacci',
    },
    validators: {
      onChange: () => {
        onClose()
      },
    },
  })

  return {
    form,
  }
}
