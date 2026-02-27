import { CheckCircle2Icon, CircleAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { cn } from '@/lib/utils'

interface IBaseAlertProps {
  icon?: React.ReactNode
  title: React.ReactNode
  description: React.ReactNode
  variant?: 'default' | 'destructive'
  className?: string
}

const BaseAlert = ({
  icon,
  title,
  description,
  variant = 'default',
  className,
}: IBaseAlertProps) => {
  const iconEffective =
    variant === 'destructive' ? <CircleAlert /> : icon || <CheckCircle2Icon />

  return (
    <Alert className={cn('max-w-md text-left', className)} variant={variant}>
      {iconEffective}
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  )
}
export default BaseAlert
