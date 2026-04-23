import type { Select as SelectPrimitive } from 'radix-ui'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface BaseFormSelectOption {
  label: string
  value: string | number
}

type BaseSelectProps = React.ComponentPropsWithoutRef<
  typeof SelectPrimitive.Content
> & {
  onValueChange?: (onValue: string) => void
  value?: string
  placeholder?: string
  options?: BaseFormSelectOption[]
  children?: React.ReactNode
  defaultValue?: string | undefined
}
export function BaseSelect({
  value,
  onValueChange,
  placeholder = 'Select an option',
  options,
  children,
  defaultValue,
  ...props
}: BaseSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      defaultValue={defaultValue}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent position={'popper'} {...props}>
        {options != null && options.length > 0
          ? options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value.toString()}
                className="rounded-none border p-3 first:border-b-0"
              >
                {option.label}
              </SelectItem>
            ))
          : children}
      </SelectContent>
    </Select>
  )
}
