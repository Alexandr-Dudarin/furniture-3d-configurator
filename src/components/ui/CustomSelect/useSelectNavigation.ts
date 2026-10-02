import { useCallback, useEffect, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react'
import type { CustomSelectProps } from './types'
import {
  getEnabledOptionIndexes,
  getInitialHighlightedIndex,
  getNextHighlightedIndex,
  isSelectableOption,
} from './optionNavigation'

type NavigationProps = Pick<CustomSelectProps, 'value' | 'options' | 'onChange' | 'disabled'>

export function useSelectNavigation({ value, options, onChange, disabled }: NavigationProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])
  const scrollOnOpenRef = useRef(false)
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(() => getInitialHighlightedIndex(options, value))

  // Reset before committing a disabled render, so re-enabling cannot reopen an
  // old menu. Opening it again initializes the highlight and scroll flag.
  if (disabled && isOpen) setIsOpen(false)

  const openDropdown = () => {
    if (disabled) return
    setHighlightedIndex(getInitialHighlightedIndex(options, value))
    scrollOnOpenRef.current = true
    setIsOpen(true)
  }

  const closeDropdown = useCallback(() => {
    scrollOnOpenRef.current = false
    setIsOpen(false)
  }, [])

  const selectOption = (index: number, focusTrigger = true) => {
    const option = options[index]
    if (disabled || !isSelectableOption(option)) return
    setHighlightedIndex(index)
    if (option.value !== value) onChange(option.value)
    closeDropdown()
    if (focusTrigger) triggerRef.current?.focus()
    else triggerRef.current?.blur()
  }

  const highlightOption = (index: number) => {
    if (isSelectableOption(options[index])) setHighlightedIndex(index)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault()
        if (!isOpen) openDropdown()
        else setHighlightedIndex((current) =>
          getNextHighlightedIndex(options, current, event.key === 'ArrowDown' ? 1 : -1),
        )
        break
      case 'Home':
      case 'End': {
        event.preventDefault()
        const enabled = getEnabledOptionIndexes(options)
        setHighlightedIndex((event.key === 'Home' ? enabled[0] : enabled[enabled.length - 1]) ?? -1)
        break
      }
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (!isOpen) openDropdown()
        else selectOption(highlightedIndex)
        break
      case 'Escape':
        if (isOpen) {
          event.preventDefault()
          closeDropdown()
        }
        break
      case 'Tab':
        // Keep native Tab/Shift+Tab movement; options use virtual focus.
        closeDropdown()
        break
    }
  }

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) closeDropdown()
  }

  useEffect(() => {
    optionRefs.current = optionRefs.current.slice(0, options.length)
  }, [options.length])

  useEffect(() => {
    if (!isOpen || !scrollOnOpenRef.current) return
    const selected = getInitialHighlightedIndex(options, value)
    if (selected < 0) {
      scrollOnOpenRef.current = false
      return
    }
    const frame = window.requestAnimationFrame(() => {
      optionRefs.current[selected]?.scrollIntoView({ block: 'center' })
      scrollOnOpenRef.current = false
    })
    return () => window.cancelAnimationFrame(frame)
  }, [isOpen, options, value])

  useEffect(() => {
    if (!isOpen || highlightedIndex < 0 || scrollOnOpenRef.current) return
    const frame = window.requestAnimationFrame(() => {
      optionRefs.current[highlightedIndex]?.scrollIntoView({ block: 'nearest' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [highlightedIndex, isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleOutside = (event: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) closeDropdown()
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('touchstart', handleOutside)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('touchstart', handleOutside)
    }
  }, [isOpen, closeDropdown])

  return {
    rootRef, triggerRef, optionRefs, isOpen, highlightedIndex,
    openDropdown, closeDropdown, selectOption, highlightOption, handleKeyDown, handleBlur,
  }
}
