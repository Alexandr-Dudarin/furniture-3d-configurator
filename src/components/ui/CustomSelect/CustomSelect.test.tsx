// @vitest-environment jsdom
import { useState } from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CustomSelect, type CustomSelectOption } from './CustomSelect'

const options: CustomSelectOption[] = [
  { value: 'oak', label: 'Дуб', description: 'Натуральное дерево' },
  { value: 'unavailable', label: 'Недоступный', disabled: true },
  { value: 'ash', label: 'Ясень' },
  { value: 'grey', label: 'Серый' },
]

beforeEach(() => {
  vi.useFakeTimers()
  Object.defineProperty(Element.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
  })
})
afterEach(() => {
  cleanup()
  Reflect.deleteProperty(Element.prototype, 'scrollIntoView')
  vi.useRealTimers()
})

function mountSelect(initial = 'oak', choices = options) {
  const onChange = vi.fn()
  function Harness() {
    const [value, setValue] = useState(initial)
    return <CustomSelect value={value} options={choices} ariaLabel="Материал"
      onChange={(next) => { onChange(next); setValue(next) }} />
  }
  render(<Harness />, { reactStrictMode: true })
  const trigger = screen.getByRole('combobox', { name: 'Материал' })
  trigger.focus()
  return { trigger, onChange }
}

function activeOption(trigger: HTMLElement) {
  const id = trigger.getAttribute('aria-activedescendant')
  return id ? document.getElementById(id) : null
}

function key(trigger: HTMLElement, key: string) {
  fireEvent.keyDown(trigger, { key })
}

// jsdom has no native PointerEvent. Supply the coordinates and pointer identity
// that React receives from a real browser, without replacing the component.
function pointer(target: HTMLElement, type: string, init: Partial<PointerEventInit> = {}) {
  const event = new MouseEvent(type, {
    bubbles: true, cancelable: true, clientX: 20, clientY: 20, ...init,
  })
  Object.defineProperties(event, {
    pointerId: { value: init.pointerId ?? 1 },
    pointerType: { value: init.pointerType ?? 'touch' },
  })
  fireEvent(target, event)
  return event
}

describe('CustomSelect', () => {
  it('exposes the name, current value, descriptions and selected option', () => {
    const { trigger } = mountSelect()
    expect(trigger.textContent).toContain('Дуб')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(trigger)
    const listbox = screen.getByRole('listbox', { name: 'Материал' })
    expect(trigger.getAttribute('aria-controls')).toBe(listbox.id)
    expect(screen.getByText('Натуральное дерево')).toBeTruthy()
    expect(activeOption(trigger)?.getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('option', { name: 'Недоступный' }).getAttribute('aria-disabled')).toBe('true')
  })

  it('selects by mouse, returns focus and does not emit unchanged values', () => {
    const { trigger, onChange } = mountSelect()
    fireEvent.click(trigger)
    fireEvent.click(screen.getByRole('option', { name: 'Ясень' }))
    expect(onChange.mock.calls).toEqual([['ash']])
    expect(trigger.textContent).toContain('Ясень')
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(document.activeElement).toBe(trigger)
    fireEvent.click(trigger)
    fireEvent.click(screen.getByRole('option', { name: 'Ясень' }))
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('cycles enabled options with arrows and commits only with Enter', () => {
    const { trigger, onChange } = mountSelect()
    key(trigger, 'ArrowDown')
    expect(activeOption(trigger)?.textContent).toContain('Дуб')
    key(trigger, 'ArrowDown')
    expect(activeOption(trigger)?.textContent).toBe('Ясень')
    key(trigger, 'ArrowUp')
    key(trigger, 'ArrowUp')
    expect(activeOption(trigger)?.textContent).toBe('Серый')
    key(trigger, 'ArrowDown')
    expect(activeOption(trigger)?.textContent).toContain('Дуб')
    key(trigger, 'ArrowDown')
    expect(onChange).not.toHaveBeenCalled()
    key(trigger, 'Enter')
    expect(onChange.mock.calls).toEqual([['ash']])
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('opens on the selected value and supports Home, End and Space', () => {
    const { trigger, onChange } = mountSelect('ash')
    key(trigger, 'ArrowUp')
    expect(activeOption(trigger)?.textContent).toBe('Ясень')
    key(trigger, 'End')
    expect(activeOption(trigger)?.textContent).toBe('Серый')
    key(trigger, 'Home')
    expect(activeOption(trigger)?.textContent).toContain('Дуб')
    key(trigger, ' ')
    expect(onChange.mock.calls).toEqual([['oak']])
    key(trigger, ' ')
    expect(screen.getByRole('listbox')).toBeTruthy()
  })

  it('closes with Escape or an outside mouse/touch action without selecting', () => {
    const { trigger, onChange } = mountSelect()
    for (const dismiss of [
      () => key(trigger, 'Escape'),
      () => fireEvent.mouseDown(document.body),
      () => fireEvent.touchStart(document.body),
    ]) {
      fireEvent.click(trigger)
      key(trigger, 'ArrowDown')
      dismiss()
      expect(screen.queryByRole('listbox')).toBeNull()
    }
    expect(onChange).not.toHaveBeenCalled()
  })

  it('shows placeholder and empty message safely when there are no options', () => {
    const { trigger, onChange } = mountSelect('missing', [])
    expect(trigger.textContent).toContain('Выберите значение')
    key(trigger, 'Enter')
    expect(screen.getByText('Нет доступных вариантов')).toBeTruthy()
    for (const name of ['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter']) key(trigger, name)
    expect(activeOption(trigger)).toBeNull()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('does not select disabled options, including a fully disabled list', () => {
    const { trigger, onChange } = mountSelect('unavailable', options.map((o) => ({ ...o, disabled: true })))
    fireEvent.click(trigger)
    fireEvent.click(screen.getByRole('option', { name: 'Ясень' }))
    key(trigger, 'ArrowDown')
    key(trigger, 'Enter')
    expect(activeOption(trigger)).toBeNull()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('closes when disabled and stays closed when enabled again', () => {
    const props = { value: 'oak', options, onChange: vi.fn(), ariaLabel: 'Материал' }
    const { rerender } = render(<CustomSelect {...props} />)
    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)
    rerender(<CustomSelect {...props} disabled />)
    expect(screen.queryByRole('listbox')).toBeNull()
    fireEvent.click(trigger)
    key(trigger, 'Enter')
    expect(screen.queryByRole('listbox')).toBeNull()
    rerender(<CustomSelect {...props} />)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(trigger)
    expect(activeOption(trigger)?.textContent).toContain('Дуб')
  })

  it('scrolls the selected option into view and then follows keyboard navigation', () => {
    const { trigger } = mountSelect('ash')
    fireEvent.click(trigger)
    const selected = screen.getByRole('option', { name: 'Ясень' })
    act(() => vi.advanceTimersByTime(50))
    const scroll = vi.mocked(selected.scrollIntoView)
    expect(scroll).toHaveBeenCalledWith({ block: 'center' })
    expect(scroll.mock.contexts).toContain(selected)
    scroll.mockClear()
    key(trigger, 'End')
    act(() => vi.advanceTimersByTime(50))
    expect(scroll).toHaveBeenCalledWith({ block: 'nearest' })
    expect(scroll.mock.contexts).toContain(screen.getByRole('option', { name: 'Серый' }))
  })

  it.each(['touch', 'pen'])('selects a %s tap once and suppresses the synthetic trigger click', (pointerType) => {
    const { trigger, onChange } = mountSelect()
    fireEvent.click(trigger)
    const option = screen.getByRole('option', { name: 'Ясень' })
    pointer(option, 'pointerdown', { pointerType })
    pointer(option, 'pointerup', { pointerType })
    expect(onChange.mock.calls).toEqual([['ash']])
    fireEvent.click(trigger)
    expect(screen.queryByRole('listbox')).toBeNull()
    act(() => vi.advanceTimersByTime(500))
    fireEvent.click(trigger)
    expect(screen.getByRole('listbox')).toBeTruthy()
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it.each(['clientX', 'clientY'])('does not select after a scroll gesture along %s', (axis) => {
    const { trigger, onChange } = mountSelect()
    fireEvent.click(trigger)
    const option = screen.getByRole('option', { name: 'Ясень' })
    pointer(option, 'pointerdown')
    pointer(option, 'pointermove', { [axis]: 50 })
    pointer(option, 'pointerup', { [axis]: 50 })
    fireEvent.click(option)
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('listbox')).toBeTruthy()
    act(() => vi.advanceTimersByTime(500))
    fireEvent.click(option)
    expect(onChange.mock.calls).toEqual([['ash']])
  })

  it('ignores another pointer and release on a different option', () => {
    const { trigger, onChange } = mountSelect()
    fireEvent.click(trigger)
    const ash = screen.getByRole('option', { name: 'Ясень' })
    const grey = screen.getByRole('option', { name: 'Серый' })
    pointer(ash, 'pointerdown')
    pointer(ash, 'pointerup', { pointerId: 2 })
    expect(onChange).not.toHaveBeenCalled()
    pointer(grey, 'pointerup')
    fireEvent.click(grey)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('uses independent IDs for several selects', () => {
    const props = { value: 'oak', options, onChange: vi.fn(), ariaLabel: 'Материал' }
    render(<><CustomSelect {...props} /><CustomSelect {...props} /></>)
    const triggers = screen.getAllByRole('combobox')
    expect(triggers[0].id).not.toBe(triggers[1].id)
    expect(triggers[0].getAttribute('aria-controls')).not.toBe(triggers[1].getAttribute('aria-controls'))
  })

  it.each([false, true])('lets Tab leave the combobox (Shift: %s) without changing the value', (shiftKey) => {
    const { trigger, onChange } = mountSelect()
    fireEvent.click(trigger)
    for (const option of screen.getAllByRole('option')) expect(option.tabIndex).toBe(-1)
    key(trigger, 'ArrowDown')
    const notPrevented = fireEvent.keyDown(trigger, { key: 'Tab', shiftKey })
    expect(notPrevented).toBe(true)
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('closes when focus moves to another control', () => {
    const { trigger, onChange } = mountSelect()
    fireEvent.click(trigger)
    const outside = document.createElement('button')
    document.body.append(outside)
    act(() => outside.focus())
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(document.activeElement).toBe(outside)
    expect(onChange).not.toHaveBeenCalled()
    outside.remove()
  })

  it('does not select after a cancelled touch, even if a synthetic click follows', () => {
    const { trigger, onChange } = mountSelect()
    fireEvent.click(trigger)
    const option = screen.getByRole('option', { name: 'Ясень' })
    pointer(option, 'pointerdown')
    pointer(option, 'pointercancel')
    pointer(option, 'pointerup')
    fireEvent.click(option)
    expect(onChange).not.toHaveBeenCalled()
    pointer(option, 'pointerdown')
    pointer(option, 'pointerup')
    expect(onChange.mock.calls).toEqual([['ash']])
  })

  it('checks release coordinates when no intermediate pointermove was delivered', () => {
    const { trigger, onChange } = mountSelect()
    fireEvent.click(trigger)
    const option = screen.getByRole('option', { name: 'Ясень' })
    pointer(option, 'pointerdown')
    pointer(option, 'pointerup', { clientY: 80 })
    fireEvent.click(option)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('does not select a replacement option during an unfinished touch', () => {
    const props = { value: 'oak', options, onChange: vi.fn(), ariaLabel: 'Материал' }
    const { rerender } = render(<CustomSelect {...props} />)
    fireEvent.click(screen.getByRole('combobox'))
    pointer(screen.getByRole('option', { name: 'Ясень' }), 'pointerdown')
    rerender(<CustomSelect {...props} options={[options[0], options[1], options[3]]} />)
    const replacement = screen.getByRole('option', { name: 'Серый' })
    pointer(replacement, 'pointerup')
    fireEvent.click(replacement)
    expect(props.onChange).not.toHaveBeenCalled()
  })

  it('reopens on an externally changed value and recovers after the options shrink', () => {
    const props = { value: 'grey', options, onChange: vi.fn(), ariaLabel: 'Материал' }
    const { rerender } = render(<CustomSelect {...props} />)
    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)
    rerender(<CustomSelect {...props} options={[options[0]]} />)
    expect(activeOption(trigger)).toBeNull()
    key(trigger, 'Enter')
    expect(props.onChange).not.toHaveBeenCalled()
    key(trigger, 'ArrowDown')
    expect(activeOption(trigger)?.textContent).toContain('Дуб')
    key(trigger, 'Escape')
    rerender(<CustomSelect {...props} value="ash" />)
    fireEvent.click(trigger)
    expect(activeOption(trigger)?.textContent).toBe('Ясень')
  })

  it('cleans up scheduled scroll and synthetic click timers on unmount', () => {
    const { trigger } = mountSelect()
    fireEvent.click(trigger)
    // Drain jsdom's asynchronous focus notifications, keeping RAF and the
    // component's delayed click suppression pending for the cleanup check.
    act(() => vi.advanceTimersByTime(0))
    cleanup()
    expect(vi.getTimerCount()).toBe(0)
    const second = mountSelect()
    fireEvent.click(second.trigger)
    const option = screen.getByRole('option', { name: 'Ясень' })
    pointer(option, 'pointerdown')
    pointer(option, 'pointerup')
    act(() => vi.advanceTimersByTime(0))
    expect(vi.getTimerCount()).toBeGreaterThan(0)
    cleanup()
    expect(vi.getTimerCount()).toBe(0)
  })
})
