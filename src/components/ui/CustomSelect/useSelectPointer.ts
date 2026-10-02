import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react'
import { isSelectableOption } from './optionNavigation'
import type { CustomSelectOption } from './types'

const MOVE_THRESHOLD_PX = 10
const SYNTHETIC_CLICK_TIMEOUT_MS = 450
type ClickTarget = 'trigger' | 'option'
type PointerState = {
  pointerId: number
  value: string
  startX: number
  startY: number
  moved: boolean
}
type OptionPointerEvent = ReactPointerEvent<HTMLButtonElement>

// Browsers may emit a click after touch/pen pointerup, even after the menu has
// closed. Suppress that duplicate, while allowing scrolling through the list.
export function useSelectPointer(
  isOpen: boolean,
  options: CustomSelectOption[],
  selectOption: (index: number, focusTrigger: boolean) => void,
) {
  const pointerRef = useRef<PointerState | null>(null)
  const blockedRef = useRef({ trigger: false, option: false })
  const timersRef = useRef<Record<ClickTarget, number | null>>({ trigger: null, option: null })

  const suppressClick = (target: ClickTarget) => {
    blockedRef.current[target] = true
    const timer = timersRef.current[target]
    if (timer !== null) window.clearTimeout(timer)
    timersRef.current[target] = window.setTimeout(() => {
      blockedRef.current[target] = false
      timersRef.current[target] = null
    }, SYNTHETIC_CLICK_TIMEOUT_MS)
  }

  const consumeClick = (target: ClickTarget) => {
    if (!blockedRef.current[target]) return false
    blockedRef.current[target] = false
    return true
  }

  const hasMoved = (event: OptionPointerEvent, state: PointerState) =>
    Math.abs(event.clientX - state.startX) > MOVE_THRESHOLD_PX ||
    Math.abs(event.clientY - state.startY) > MOVE_THRESHOLD_PX

  const handlePointerDown = (event: OptionPointerEvent, index: number) => {
    if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return
    const option = options[index]
    if (!isSelectableOption(option)) return
    pointerRef.current = {
      pointerId: event.pointerId, value: option.value,
      startX: event.clientX, startY: event.clientY, moved: false,
    }
  }

  const handlePointerMove = (event: OptionPointerEvent) => {
    const state = pointerRef.current
    if (state?.pointerId === event.pointerId && hasMoved(event, state)) state.moved = true
  }

  const handlePointerUp = (event: OptionPointerEvent, index: number) => {
    const state = pointerRef.current
    if (!state || state.pointerId !== event.pointerId) return
    pointerRef.current = null
    suppressClick('option')
    const option = options[index]
    if (state.moved || hasMoved(event, state) || !isSelectableOption(option) || state.value !== option.value) return
    event.preventDefault()
    event.stopPropagation()
    suppressClick('trigger')
    selectOption(index, false)
  }

  const handlePointerCancel = (event: OptionPointerEvent) => {
    if (pointerRef.current?.pointerId !== event.pointerId) return
    pointerRef.current = null
    suppressClick('option')
  }

  useEffect(() => {
    if (!isOpen) pointerRef.current = null
  }, [isOpen])

  useEffect(() => {
    const timers = timersRef.current
    return () => {
      for (const timer of Object.values(timers)) {
        if (timer !== null) window.clearTimeout(timer)
      }
    }
  }, [])

  return { consumeClick, handlePointerDown, handlePointerMove, handlePointerUp, handlePointerCancel }
}
