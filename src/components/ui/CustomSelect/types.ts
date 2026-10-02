export type CustomSelectOption = {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

export type CustomSelectProps = {
  value: string
  options: CustomSelectOption[]
  onChange: (value: string) => void
  ariaLabel: string
  placeholder?: string
  emptyLabel?: string
  disabled?: boolean
  className?: string
}
