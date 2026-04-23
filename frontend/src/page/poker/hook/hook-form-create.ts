import { useForm } from '@tanstack/react-form'
interface UseFormCreateProps {
  onClose: () => void
}
export const useFormCreate = ({ onClose }: UseFormCreateProps) => {
  const form = useForm({
    defaultValues: {
      name: '',
    },
    validators: {
      onSubmit: () => {},
    },
    onSubmit: () => {
      onClose()
    },
  })

  return {
    form,
  }
}
