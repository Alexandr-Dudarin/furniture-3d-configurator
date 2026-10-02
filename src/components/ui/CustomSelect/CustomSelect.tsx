import { useId } from 'react'
import { isSelectableOption } from './optionNavigation'
import { SelectOptions } from './SelectOptions'
import type { CustomSelectProps } from './types'
import { useSelectNavigation } from './useSelectNavigation'
import { useSelectPointer } from './useSelectPointer'
import styles from './CustomSelect.module.css'

export type { CustomSelectOption } from './types'

export function CustomSelect({
  value,
  options,
  onChange,
  ariaLabel,
  placeholder = 'Выберите значение',
  emptyLabel = 'Нет доступных вариантов',
  disabled = false,
  className = '',
}: CustomSelectProps) {
  const id = useId()
  const triggerId = `${id}-trigger`
  const listboxId = `${id}-listbox`
  const getOptionId = (index: number) => `${id}-option-${index}`
  const {
    rootRef, triggerRef, optionRefs, isOpen, highlightedIndex, openDropdown, closeDropdown,
    selectOption, highlightOption, handleKeyDown, handleBlur,
  } = useSelectNavigation({ value, options, onChange, disabled })
  const pointer = useSelectPointer(isOpen, options, selectOption)
  const selectedOption = options.find((option) => option.value === value)
  const activeDescendantId = isOpen && isSelectableOption(options[highlightedIndex])
    ? getOptionId(highlightedIndex)
    : undefined

  return (
    <div
      ref={rootRef}
      onBlur={handleBlur}
      className={[
        styles.root, isOpen ? styles.rootOpen : '', disabled ? styles.rootDisabled : '', className,
      ].filter(Boolean).join(' ')}
    >
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        role="combobox"
        className={styles.trigger}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={activeDescendantId}
        disabled={disabled}
        onClick={(event) => {
          if (disabled) return
          if (pointer.consumeClick('trigger')) {
            event.preventDefault()
            event.stopPropagation()
            return
          }
          if (isOpen) closeDropdown()
          else openDropdown()
        }}
        onKeyDown={handleKeyDown}
      >
        <span className={[styles.triggerLabel, selectedOption ? '' : styles.triggerPlaceholder].filter(Boolean).join(' ')}>
          {selectedOption?.label ?? placeholder}
        </span>
        <span className={styles.chevron} aria-hidden="true">▾</span>
      </button>
      {isOpen && (
        <SelectOptions
          listboxId={listboxId}
          triggerId={triggerId}
          getOptionId={getOptionId}
          options={options}
          value={value}
          highlightedIndex={highlightedIndex}
          emptyLabel={emptyLabel}
          optionRefs={optionRefs}
          onHighlight={highlightOption}
          onSelect={selectOption}
          pointer={pointer}
        />
      )}
    </div>
  )
}
