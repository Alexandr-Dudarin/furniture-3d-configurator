import type { CustomSelectOption } from './types'

export function isSelectableOption(
  option: CustomSelectOption | undefined,
): option is CustomSelectOption {
  return Boolean(option && !option.disabled)
}

export function getEnabledOptionIndexes(options: CustomSelectOption[]): number[] {
  return options.flatMap((option, index) => isSelectableOption(option) ? [index] : [])
}

export function getInitialHighlightedIndex(options: CustomSelectOption[], value: string): number {
  const selected = options.findIndex((option) => option.value === value && isSelectableOption(option))
  return selected >= 0 ? selected : (getEnabledOptionIndexes(options)[0] ?? -1)
}

export function getNextHighlightedIndex(
  options: CustomSelectOption[],
  currentIndex: number,
  direction: 1 | -1,
): number {
  const enabled = getEnabledOptionIndexes(options)
  if (!enabled.length) return -1
  const current = enabled.indexOf(currentIndex)
  if (current === -1) return direction === 1 ? enabled[0] : enabled[enabled.length - 1]
  return enabled[(current + direction + enabled.length) % enabled.length]
}
