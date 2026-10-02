// @vitest-environment jsdom
import { useState } from 'react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { createFurnitureMotionStore } from '../configurator/furnitureMotionStore'
import {
  createDefaultWardrobe,
  updateWardrobeAssembly,
} from '../configurator/wardrobeAssembly/state'
import { WardrobeAssemblyControls } from './WardrobeAssemblyControls'

// jsdom does not implement dialog display or scrolling. Keep the real panel,
// controls and configuration reducer; substitute only these browser methods.
const browserMethods = [
  [HTMLDialogElement.prototype, 'showModal'],
  [HTMLDialogElement.prototype, 'close'],
  [Element.prototype, 'scrollIntoView'],
] as const
const originals = browserMethods.map(([prototype, name]) =>
  Object.getOwnPropertyDescriptor(prototype, name),
)
beforeAll(() => {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.open = true
    },
  })
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.open = false
    },
  })
  Object.defineProperty(Element.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
  })
})
afterEach(cleanup)
afterAll(() =>
  browserMethods.forEach(([prototype, name], index) => {
    const descriptor = originals[index]
    if (descriptor) Object.defineProperty(prototype, name, descriptor)
    else Reflect.deleteProperty(prototype, name)
  }),
)

function mountPanel(initial = createDefaultWardrobe()) {
  let current = initial
  const onFrame = vi.fn()
  const motionStore = createFurnitureMotionStore()
  function Harness() {
    const [configuration, setConfiguration] = useState(initial)
    current = configuration
    return (
      <WardrobeAssemblyControls
        configuration={configuration}
        motionStore={motionStore}
        onFrame={onFrame}
        onAction={(action) =>
          setConfiguration((previous) => updateWardrobeAssembly(previous, action))
        }
      />
    )
  }
  render(<Harness />, { reactStrictMode: true })
  return { configuration: () => current, onFrame }
}

function chooseSection(number: number) {
  const cards = screen.getByRole('group', { name: 'Выбор секции гардеробной' })
  fireEvent.click(within(cards).getByText(`Секция ${number}`, { selector: 'strong' }))
}

function section(title: string, open = true) {
  const details = screen.getByText(title, { selector: 'strong' }).closest('details')!
  details.open = open
  fireEvent(details, new Event('toggle'))
  return details
}

function chooseOption(label: string, option: string) {
  fireEvent.click(screen.getByRole('combobox', { name: label }))
  fireEvent.click(screen.getByRole('option', { name: option }))
}

describe('wardrobe panel interactions', () => {
  it('edits the selected section and keeps its identity when it is moved', () => {
    const panel = mountPanel()
    chooseSection(2)
    fireEvent.change(screen.getByRole('slider', { name: 'Ширина секции' }), {
      target: { value: '.75' },
    })
    expect(panel.configuration().sections[1]).toMatchObject({ id: 'section-2', width: 0.75 })
    expect(panel.configuration().sections[0].width).toBe(0.6)
    fireEvent.click(screen.getByRole('button', { name: 'Переставить выбранную секцию влево' }))
    expect(panel.configuration().sections[0].id).toBe('section-2')
    expect(screen.getByRole('textbox', { name: 'Ширина секции, см' }).getAttribute('value')).toBe(
      '75',
    )
    expect(screen.getByText('Секция 1: размеры')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Вернуть общий вид' }))
    expect(panel.onFrame).toHaveBeenCalledOnce()
  })

  it('selects the newly added section even when IDs have gaps', () => {
    const panel = mountPanel()
    chooseSection(2)
    fireEvent.click(screen.getByRole('button', { name: 'Удалить секцию 2' }))
    expect(panel.configuration().sections.map((item) => item.id)).toEqual([
      'section-1',
      'section-3',
    ])
    fireEvent.click(screen.getByRole('button', { name: '+ Пустая секция' }))
    expect(panel.configuration().sections[2]).toMatchObject({ id: 'section-2', shelves: 0 })
    fireEvent.change(screen.getByRole('slider', { name: 'Ширина секции' }), {
      target: { value: '.8' },
    })
    expect(panel.configuration().sections[2].width).toBe(0.8)
    expect(panel.configuration().sections[0].width).toBe(0.6)
  })

  it('keeps filling unchanged until confirmation and supports cancellation', () => {
    const panel = mountPanel()
    chooseSection(2)
    const changeHeight = () =>
      fireEvent.change(screen.getByRole('slider', { name: 'Высота секции' }), {
        target: { value: '1.4' },
      })
    changeHeight()
    expect(screen.getByRole('dialog').textContent).toContain('Штанга будет удалена')
    expect(panel.configuration().sections[1]).toMatchObject({ height: 2.2, rod: true })
    fireEvent.click(screen.getByRole('button', { name: 'Отмена' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(panel.configuration().sections[1].rod).toBe(true)
    changeHeight()
    fireEvent.click(screen.getByRole('button', { name: 'Изменить высоту' }))
    expect(panel.configuration().sections[1]).toMatchObject({ height: 1.4, rod: false })
    expect(screen.queryByRole('checkbox', { name: 'Штанга для одежды' })).toBeNull()
  })

  it('discards a confirmation after configuration restore, even with the same section ID', () => {
    const initial = createDefaultWardrobe()
    const onAction = vi.fn()
    const motionStore = createFurnitureMotionStore()
    const props = { onAction, onFrame: vi.fn(), motionStore }
    const view = render(<WardrobeAssemblyControls {...props} configuration={initial} />)
    chooseSection(2)
    fireEvent.change(screen.getByRole('slider', { name: 'Высота секции' }), {
      target: { value: '1.4' },
    })
    expect(screen.getByRole('dialog')).toBeTruthy()
    view.rerender(<WardrobeAssemblyControls {...props} configuration={createDefaultWardrobe()} />)
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(onAction).not.toHaveBeenCalled()
    fireEvent.change(screen.getByRole('slider', { name: 'Ширина секции' }), {
      target: { value: '.8' },
    })
    expect(onAction).toHaveBeenCalledWith({
      type: 'update-section',
      id: 'section-2',
      patch: { width: 0.8 },
    })
  })

  it('keeps sections collapsed when selecting a different module', () => {
    mountPanel()
    const dimensions = section('Секция 1: размеры', false)
    chooseSection(2)
    expect(dimensions.isConnected).toBe(true)
    expect(dimensions.open).toBe(false)
    expect(dimensions.textContent).toContain('Секция 2: размеры')
  })

  it('changes drawer handles, placement and pattern only in the selected section', () => {
    const panel = mountPanel()
    chooseSection(3)
    chooseOption('Количество ящиков в выбранной секции', '2')
    // Automatic shelf relocation may require confirmation when adding a block.
    if (screen.queryByRole('dialog'))
      fireEvent.click(screen.getByRole('button', { name: 'Изменить наполнение' }))
    chooseOption('Положение фасадов ящиков', 'Вровень с корпусом')
    chooseOption('Ручки ящиков выбранной секции', 'Полуовальная выемка')
    fireEvent.click(
      within(
        screen.getByRole('group', { name: 'Рисунок фасадов ящиков выбранной секции' }),
      ).getByRole('radio', { name: 'Рамочный' }),
    )
    expect(panel.configuration().sections[2].drawers).toMatchObject({
      count: 2,
      placement: 'flush',
      handle: 'finger-notch',
      facadeStyle: 'frame',
    })
    expect(panel.configuration().sections[0].drawers).toBeUndefined()
  })

  it('preserves section facade overrides when the common finish changes', () => {
    let initial = createDefaultWardrobe()
    initial = updateWardrobeAssembly(initial, {
      type: 'update-section',
      id: 'section-1',
      patch: { doors: { count: 1, hinge: 'left', facadeStyle: 'smooth', handle: 'bar' } },
    })
    const panel = mountPanel(initial)
    const own = section('Секция 1: материалы')
    fireEvent.click(within(own).getByRole('checkbox', { name: 'Свой материал фасадов секции' }))
    fireEvent.click(within(own).getByRole('radio', { name: 'Белый матовый' }))
    const common = section('Материалы всей сборки')
    const facades = within(common).getByRole('group', { name: 'Фасады: двери и ящики' })
    fireEvent.click(within(facades).getByRole('radio', { name: 'Графит матовый' }))
    expect(panel.configuration().facadeFinish).toBe('board-graphite-matte')
    expect(panel.configuration().sections[0].facadeFinish).toBe('board-white-matte')
    expect(panel.configuration().sections[1].facadeFinish).toBeUndefined()
  })

  it.each(['l', 'u'] as const)('adds to the selected arm in a %s layout', (kind) => {
    const initial = updateWardrobeAssembly(createDefaultWardrobe(), {
      type: 'set-arrangement',
      kind,
    })
    const panel = mountPanel(initial)
    fireEvent.click(screen.getByRole('button', { name: /Выбрать секцию 3, сторона/ }))
    fireEvent.click(screen.getByRole('button', { name: '+ Пустая секция' }))
    expect(panel.configuration().sections[3].id).toBe('section-4')
    expect(panel.configuration().arrangement?.split).toBe(initial.arrangement?.split)
    expect(screen.getByText('Секция 4: размеры')).toBeTruthy()
  })
})
