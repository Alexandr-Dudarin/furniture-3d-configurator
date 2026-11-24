// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { DOOR_HANDLES } from '../../configurator/handles'
import { DRAWER_HANDLES } from '../../configurator/wardrobeAssembly/drawerHandles'
import { getFurnitureDefinitions } from '../../configurator/furnitureRegistry'
import { createDefaultSession, updateSession } from '../../configurator/savedConfiguration'
import { createFurnitureMotionStore } from '../../configurator/furnitureMotionStore'
import { CabinetControls } from '../CabinetControls'
import { HandlePicker } from './HandlePicker'

afterEach(cleanup)

describe('handle previews and selection', () => {
  it('shows the current handle before opening and reflects restored configuration', () => {
    const onChange = vi.fn()
    const props = { label: 'Ручки ящиков', kind: 'drawers' as const, options: DRAWER_HANDLES, onChange }
    const view = render(<HandlePicker {...props} value="edge-pull" />)
    const button = screen.getByRole('button', { name: 'Показать варианты: Ручки ящиков' })
    expect(button.textContent).toContain('Планка · 11 см')
    expect(button.querySelector('img')?.getAttribute('src')).toContain('drawers-edge-pull.svg')
    expect(screen.queryByRole('radio')).toBeNull()
    fireEvent.click(button)
    expect(screen.getByRole<HTMLInputElement>('radio', { name: 'Планка · 11 см' }).checked).toBe(true)
    fireEvent.click(screen.getByRole('radio', { name: 'Полуовальная выемка' }))
    expect(onChange).toHaveBeenCalledExactlyOnceWith('finger-notch')
    view.rerender(<HandlePicker {...props} value="finger-notch" />)
    expect(button.querySelector('img')?.getAttribute('src')).toContain('drawers-finger-notch.svg')
    expect(button.textContent).toContain('Выемка 10 × 3 см')
    expect(screen.getByRole<HTMLInputElement>('radio', { name: 'Полуовальная выемка' }).checked).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Скрыть варианты: Ручки ящиков' }))
    expect(screen.queryByRole('radio')).toBeNull()
    view.rerender(<HandlePicker {...props} value="bar" />)
    expect(button.textContent).toContain('Скоба')
    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('separates door and drawer choices, sizes, radio groups and callbacks', () => {
    const onDoor = vi.fn(), onDrawer = vi.fn()
    render(<>
      <HandlePicker label="Двери" kind="doors" value="profile" options={DOOR_HANDLES} onChange={onDoor} />
      <HandlePicker label="Ящики" kind="drawers" value="profile" options={DRAWER_HANDLES} onChange={onDrawer} />
    </>)
    fireEvent.click(screen.getByRole('button', { name: 'Показать варианты: Двери' }))
    fireEvent.click(screen.getByRole('button', { name: 'Показать варианты: Ящики' }))
    const doors = within(screen.getByRole('group', { name: 'Двери' }))
    const drawers = within(screen.getByRole('group', { name: 'Ящики' }))
    expect(doors.getByText('Длина 33 см')).toBeTruthy()
    expect(drawers.getByText('Длина 22 см')).toBeTruthy()
    expect(doors.queryByRole('radio', { name: 'Полуовальная выемка' })).toBeNull()
    expect(drawers.queryByRole('radio', { name: 'Исходные ручки модели' })).toBeNull()
    const doorKnob = doors.getByRole<HTMLInputElement>('radio', { name: 'Круглая кнопка' })
    const drawerKnob = drawers.getByRole<HTMLInputElement>('radio', { name: 'Круглая кнопка' })
    expect(doorKnob.name).not.toBe(drawerKnob.name)
    const doorSize = document.getElementById(doorKnob.getAttribute('aria-describedby')!)
    const drawerSize = document.getElementById(drawerKnob.getAttribute('aria-describedby')!)
    expect(doorSize?.textContent).toBe('Диаметр 4,9 см')
    expect(drawerSize?.textContent).toBe('Диаметр 2,8 см')
    fireEvent.click(doorKnob)
    expect(onDoor).toHaveBeenCalledExactlyOnceWith('knob')
    expect(onDrawer).not.toHaveBeenCalled()
    fireEvent.click(drawers.getByRole('radio', { name: 'Захват сверху · 4 см' }))
    expect(onDrawer).toHaveBeenCalledExactlyOnceWith('top-grip')
    expect(onDoor).toHaveBeenCalledTimes(1)
  })

  it('dispatches catalogue changes for the correct facade and can restore original hardware', () => {
    const definition = getFurnitureDefinitions().find(item => item.id === 'wardrobe-07-center-drawers')!
    const session = updateSession(createDefaultSession(), { type: 'select-model', modelId: definition.id })
    const dispatch = vi.fn()
    const configuration = { ...session.models[definition.id], handles: { doors: 'knob' as const, drawers: 'profile' as const } }
    render(<CabinetControls definition={definition} configuration={configuration}
      dispatch={dispatch} motionStore={createFurnitureMotionStore()} />)
    const details = screen.getByText('Ручки', { selector: 'strong' }).closest('details')!
    details.open = true
    fireEvent(details, new Event('toggle'))
    fireEvent.click(screen.getByRole('button', { name: 'Показать варианты: Ручки дверей' }))
    fireEvent.click(within(screen.getByRole('group', { name: 'Ручки дверей' }))
      .getByRole('radio', { name: 'Исходные ручки модели' }))
    expect(dispatch).toHaveBeenLastCalledWith({ type: 'set-handles', kind: 'doors', value: 'original' })
    fireEvent.click(screen.getByRole('button', { name: 'Показать варианты: Ручки ящиков' }))
    fireEvent.click(within(screen.getByRole('group', { name: 'Ручки ящиков' }))
      .getByRole('radio', { name: 'Без ручек' }))
    expect(dispatch).toHaveBeenLastCalledWith({ type: 'set-handles', kind: 'drawers', value: 'none' })
    expect(dispatch).toHaveBeenCalledTimes(2)
  })
})
