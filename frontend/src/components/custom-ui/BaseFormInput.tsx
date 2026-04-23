import { Field, FieldError, FieldLabel } from '../ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group'

export type BaseFormInputField = {
  state: {
    value: string
    meta: {
      isTouched: boolean
      isValid: boolean
      errors: ({ message?: string } | undefined)[]
    }
  }
  handleChange: (value: string) => void
  handleBlur: () => void
}

type BaseFormInputProps = Omit<React.ComponentProps<'input'>, 'name'> & {
  field: BaseFormInputField
  name: string
  title?: string
  icon?: React.ReactNode
  extraIcon?: React.ReactNode
  onExtraIconClick?: () => void
}

const BaseFormInput = ({
  field,
  name,
  title,
  icon,
  extraIcon,
  onExtraIconClick,
  type = 'text',
  ...props
}: BaseFormInputProps) => {
  const isInvalid =
    field.state.meta.isTouched && field.state.meta.errors.length > 0

  return (
    <Field data-invalid={isInvalid}>
      {title != null && title !== '' && (
        <FieldLabel htmlFor={name}>{title}</FieldLabel>
      )}
      <InputGroup>
        {icon != null && (
          <InputGroupAddon align="inline-start">{icon}</InputGroupAddon>
        )}
        <InputGroupInput
          id={name}
          type={type}
          name={name}
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
          {...props}
        />
        {extraIcon != null && (
          <InputGroupAddon
            align="inline-end"
            onClick={onExtraIconClick}
            className="cursor-pointer"
          >
            {extraIcon}
          </InputGroupAddon>
        )}
      </InputGroup>

      {isInvalid && field.state.meta.errors.length > 0 && (
        <FieldError errors={field.state.meta.errors} />
      )}
    </Field>
  )
}

export default BaseFormInput
