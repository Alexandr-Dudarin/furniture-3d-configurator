import type { RefObject } from 'react'
import type { CustomSelectOption } from './types'
import type { useSelectPointer } from './useSelectPointer'
import styles from './CustomSelect.module.css'

type SelectOptionsProps = {
  listboxId: string
  triggerId: string
  getOptionId: (index: number) => string
  options: CustomSelectOption[]
  value: string
  highlightedIndex: number
  emptyLabel: string
  optionRefs: RefObject<Array<HTMLButtonElement | null>>
  onHighlight: (index: number) => void
  onSelect: (index: number) => void
  pointer: ReturnType<typeof useSelectPointer>
}

export function SelectOptions({
  listboxId, triggerId, getOptionId, options, value, highlightedIndex,
  emptyLabel, optionRefs, onHighlight, onSelect, pointer,
}: SelectOptionsProps) {
  return (
    <div id={listboxId} className={styles.dropdown} role="listbox" aria-labelledby={triggerId}>
      {options.length ? options.map((option, index) => (
        <button
          key={option.value}
          ref={(element) => { optionRefs.current[index] = element }}
          id={getOptionId(index)}
          type="button"
          role="option"
          tabIndex={-1}
          aria-selected={option.value === value}
          aria-disabled={option.disabled || undefined}
          disabled={option.disabled}
          className={[
            styles.option,
            option.value === value ? styles.optionSelected : '',
            index === highlightedIndex ? styles.optionHighlighted : '',
          ].filter(Boolean).join(' ')}
          onMouseEnter={() => onHighlight(index)}
          onPointerDown={(event) => pointer.handlePointerDown(event, index)}
          onPointerMove={pointer.handlePointerMove}
          onPointerUp={(event) => pointer.handlePointerUp(event, index)}
          onPointerCancel={pointer.handlePointerCancel}
          onMouseDown={(event) => event.preventDefault()}
          onClick={(event) => {
            event.stopPropagation()
            if (pointer.consumeClick('option')) event.preventDefault()
            else onSelect(index)
          }}
        >
          <span className={styles.optionLabel}>{option.label}</span>
          {option.description && <span className={styles.optionDescription}>{option.description}</span>}
        </button>
      )) : <div className={styles.emptyOption}>{emptyLabel}</div>}
    </div>
  )
}
