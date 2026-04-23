import type { BaseFormInputField } from './BaseFormInput'

import { Field, FieldError, FieldLabel } from '../ui/field'
import { BaseSelect } from './BaseSelect'

interface BaseFormSelectOption {
  label: string
  value: string | number
}

type BaseFormSelectProps = {
  field: BaseFormInputField
  name: string
  title?: string
  placeholder?: string
  options?: BaseFormSelectOption[]
  children?: React.ReactNode
}

export function BaseFormSelect({
  field,
  name,
  title,
  placeholder = 'Select an option',
  options,
  children,
}: BaseFormSelectProps) {
  const currentValue = field.state.value
  const handleChange = field.handleChange
  const isInvalid =
    field.state.meta.isTouched && field.state.meta.errors.length > 0

  return (
    <Field data-invalid={isInvalid}>
      {title != null && title !== '' && (
        <FieldLabel htmlFor={name}>{title}</FieldLabel>
      )}
      <BaseSelect
        value={currentValue}
        onValueChange={handleChange}
        placeholder={placeholder}
        options={options}
      >
        {children}
      </BaseSelect>
      {isInvalid && field.state.meta.errors.length > 0 && (
        <FieldError errors={field.state.meta.errors} />
      )}
    </Field>
  )
}
