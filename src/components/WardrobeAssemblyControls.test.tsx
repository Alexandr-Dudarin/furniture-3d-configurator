// @vitest-environment jsdom
import { useState } from 'react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { createFurnitureMotionStore } from '../configurator/furnitureMotionStore'
import {
  createDefaultWardrobe,
  updateWardrobeAssembly,
  wardrobeSectionFinish,
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

function scope(name: 'Вся сборка' | 'Секции и углы') {
  fireEvent.click(screen.getByRole('button', { name }))
}
function settings(name: 'Размеры' | 'Наполнение' | 'Двери' | 'Материалы') {
  fireEvent.click(
    within(screen.getByRole('group', { name: 'Настройки выбранной секции' })).getByRole('button', {
      name,
    }),
  )
}
function chooseSection(number: number) {
  scope('Секции и углы')
  const cards = screen.getByRole('group', { name: 'Выбор секции гардеробной' })
  fireEvent.click(within(cards).getByText(`Секция ${number}`, { selector: 'strong' }))
}

function section(title: string, open = true) {
  const details = screen
    .getAllByText(title, { selector: 'strong' })
    .find((item) => !item.closest('[hidden]'))!
    .closest('details')!
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
    settings('Наполнение')
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
    chooseSection(1)
    const dimensions = section('Секция 1: размеры', false)
    chooseSection(2)
    expect(dimensions.isConnected).toBe(true)
    expect(dimensions.open).toBe(false)
    expect(dimensions.textContent).toContain('Секция 2: размеры')
  })

  it('changes drawer handles, placement and pattern only in the selected section', () => {
    const panel = mountPanel()
    chooseSection(3)
    settings('Наполнение')
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
    fireEvent.click(screen.getByRole('button', { name: 'Настроить цвет ящиков →' }))
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Материалы', pressed: true }),
    )
  })

  it('preserves section facade overrides when the common finish changes', () => {
    let initial = createDefaultWardrobe()
    initial = updateWardrobeAssembly(initial, {
      type: 'update-section',
      id: 'section-1',
      patch: { doors: { count: 1, hinge: 'left', facadeStyle: 'smooth', handle: 'bar' } },
    })
    const panel = mountPanel(initial)
    chooseSection(1)
    settings('Материалы')
    const own = section('Фасады: двери и ящики')
    fireEvent.click(within(own).getByRole('radio', { name: 'Белый матовый' }))
    scope('Вся сборка')
    const common = section('Фасады: двери и ящики')
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
  it('separates assembly and section scopes without resetting selection or group', () => {
    mountPanel()
    expect(screen.getByRole('region', { name: 'Настройки всей сборки' })).toBeTruthy()
    expect(screen.queryByRole('slider', { name: 'Ширина секции' })).toBeNull()
    chooseSection(2)
    settings('Наполнение')
    expect(screen.getByRole('checkbox', { name: 'Штанга для одежды' })).toBeTruthy()
    expect(screen.queryByRole('slider', { name: 'Ширина секции' })).toBeNull()
    scope('Вся сборка')
    expect(screen.queryByRole('checkbox', { name: 'Штанга для одежды' })).toBeNull()
    scope('Секции и углы')
    expect(screen.getByRole('heading', { name: 'Секция 2' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Наполнение', pressed: true })).toBeTruthy()
    expect(screen.getByRole('checkbox', { name: 'Штанга для одежды' })).toBeTruthy()
  })

  it('edits both facade types locally, supports door exceptions and restores inheritance', () => {
    let initial = updateWardrobeAssembly(createDefaultWardrobe(), {
      type: 'update-section',
      id: 'section-1',
      confirmFillingChange: true,
      patch: {
        doors: { count: 1, hinge: 'left', facadeStyle: 'smooth', handle: 'bar' },
        drawers: {
          count: 1,
          height: 0.2,
          placement: 'recessed',
          facadeStyle: 'smooth',
          handle: 'bar',
        },
      },
    })
    initial = updateWardrobeAssembly(initial, {
      type: 'set-wardrobe-finish',
      slot: 'facadeFinish',
      finishId: 'board-graphite-matte',
    })
    const panel = mountPanel(initial)
    chooseSection(1)
    settings('Двери')
    fireEvent.click(screen.getByRole('button', { name: 'Настроить цвет фасадов →' }))
    const facades = section('Фасады: двери и ящики')
    fireEvent.click(within(facades).getByRole('radio', { name: 'Белый матовый' }))
    expect(panel.configuration().sections[0].facadeFinish).toBe('board-white-matte')
    expect(panel.configuration().sections[0].doors?.finish).toBeUndefined()
    expect(panel.configuration().sections[0].drawers).toBeTruthy()
    expect(
      wardrobeSectionFinish(
        panel.configuration(),
        panel.configuration().sections[1],
        'facadeFinish',
      ),
    ).toBe('board-graphite-matte')
    const doors = section('Отдельный цвет дверей')
    fireEvent.click(within(doors).getByRole('radio', { name: 'Дуб натуральный' }))
    expect(panel.configuration().sections[0].doors?.finish).toBe('oak-natural')
    expect(panel.configuration().sections[0].facadeFinish).toBe('board-white-matte')
    fireEvent.click(within(doors).getByRole('checkbox', { name: 'Свой материал только дверей' }))
    fireEvent.click(within(facades).getByRole('checkbox', { name: 'Свой материал фасадов секции' }))
    expect(panel.configuration().sections[0].doors?.finish).toBeUndefined()
    expect(panel.configuration().sections[0].facadeFinish).toBeUndefined()
    expect(
      wardrobeSectionFinish(
        panel.configuration(),
        panel.configuration().sections[0],
        'facadeFinish',
      ),
    ).toBe('board-graphite-matte')
  })

  it.each([1, 2])(
    'selects U corner %s from the plan with the keyboard and edits only it',
    (number) => {
      const initial = updateWardrobeAssembly(createDefaultWardrobe(), {
        type: 'set-arrangement',
        kind: 'u',
      })
      const panel = mountPanel(initial)
      fireEvent.keyDown(screen.getByRole('button', { name: `Выбрать угол ${number}` }), {
        key: number === 1 ? 'Enter' : ' ',
      })
      expect(screen.getByRole('region', { name: 'Настройки секций и углов' })).toBeTruthy()
      expect(screen.queryByRole('button', { name: /Удалить секцию/ })).toBeNull()
      const title = `угол ${number}: ${number === 1 ? 'левый' : 'правый'}`
      fireEvent.change(screen.getByRole('slider', { name: `Высота: ${title}` }), {
        target: { value: '2.4' },
      })
      const a = panel.configuration().arrangement!
      if (a.kind !== 'u') throw new Error('Expected U assembly')
      expect(number === 1 ? a.corner.height : a.secondCorner.height).toBe(2.4)
      expect(number === 1 ? a.secondCorner.height : a.corner.height).toBe(2.2)
      expect(panel.configuration().sections).toEqual(initial.sections)
      const cards = screen.getByRole('group', { name: 'Выбор секции гардеробной' })
      expect(within(cards).getByRole('button', { pressed: true }).textContent).toContain(
        `Угол ${number}`,
      )
    },
  )

  it('selects an L corner from its card and sets its finish without affecting other modules', () => {
    const initial = updateWardrobeAssembly(createDefaultWardrobe(), {
      type: 'set-arrangement',
      kind: 'l',
    })
    const panel = mountPanel(initial)
    scope('Секции и углы')
    fireEvent.click(
      within(screen.getByRole('group', { name: 'Выбор секции гардеробной' })).getByText('Угол 1'),
    )
    fireEvent.click(
      within(screen.getByRole('group', { name: 'Корпус и полки угла' })).getByRole('radio', {
        name: 'Белый матовый',
      }),
    )
    expect(panel.configuration().arrangement?.corner.bodyFinish).toBe('board-white-matte')
    expect(panel.configuration().bodyFinish).toBe(initial.bodyFinish)
    expect(panel.configuration().sections).toEqual(initial.sections)
  })

  it('falls back to the selected section when a corner disappears and does not reselect it later', () => {
    const initial = updateWardrobeAssembly(createDefaultWardrobe(), {
      type: 'set-arrangement',
      kind: 'u',
    })
    mountPanel(initial)
    fireEvent.click(screen.getByRole('button', { name: 'Выбрать угол 2' }))
    scope('Вся сборка')
    fireEvent.click(screen.getByRole('button', { name: 'Прямая' }))
    scope('Секции и углы')
    expect(screen.getByRole('heading', { name: 'Секция 1' })).toBeTruthy()
    scope('Вся сборка')
    fireEvent.click(screen.getByRole('button', { name: 'П-образная' }))
    scope('Секции и углы')
    expect(screen.getByRole('heading', { name: 'Секция 1 · сторона А' })).toBeTruthy()
  })
  it('confirms removal of corner shelves and allows cancellation', () => {
    let initial = updateWardrobeAssembly(createDefaultWardrobe(), {
      type: 'set-arrangement',
      kind: 'u',
    })
    initial = updateWardrobeAssembly(initial, {
      type: 'update-corner',
      cornerId: 'corner-2',
      patch: { shelves: 6 },
    })
    const panel = mountPanel(initial)
    fireEvent.click(screen.getByRole('button', { name: 'Выбрать угол 2' }))
    const height = screen.getByRole('slider', { name: 'Высота: угол 2: правый' })
    fireEvent.change(height, { target: { value: '.8' } })
    expect(screen.getByRole('alert').textContent).toContain('Уменьшить высоту угла?')
    expect(panel.configuration()).toEqual(initial)
    fireEvent.click(screen.getByRole('button', { name: 'Отмена' }))
    expect(screen.queryByRole('alert')).toBeNull()
    fireEvent.change(height, { target: { value: '.8' } })
    fireEvent.click(screen.getByRole('button', { name: 'Уменьшить' }))
    const a = panel.configuration().arrangement!
    if (a.kind !== 'u') throw new Error('Expected U assembly')
    expect(a.secondCorner.height).toBe(0.8)
    expect(a.secondCorner.shelves).toBeLessThan(6)
    expect(a.corner).toEqual(initial.arrangement!.corner)
    expect(panel.configuration().sections).toEqual(initial.sections)
  })
  it('can pin an inherited color by selecting the already checked swatch', () => {
    const panel = mountPanel()
    chooseSection(1)
    settings('Материалы')
    const body = section('Корпус, полки и короба ящиков')
    const same = within(body).getByRole('radio', { name: 'Серый нейтральный' })
    expect((same as HTMLInputElement).checked).toBe(true)
    fireEvent.click(same)
    expect(panel.configuration().sections[0].bodyFinish).toBe('board-grey-neutral')
    fireEvent.click(within(body).getByRole('checkbox', { name: 'Свой материал корпуса' }))
    expect(panel.configuration().sections[0].bodyFinish).toBeUndefined()
    fireEvent.keyDown(same, { key: ' ' })
    expect(panel.configuration().sections[0].bodyFinish).toBe('board-grey-neutral')
    scope('Вся сборка')
    const common = section('Корпус, полки и короба ящиков')
    fireEvent.click(within(common).getByRole('radio', { name: 'Белый матовый' }))
    expect(
      wardrobeSectionFinish(panel.configuration(), panel.configuration().sections[0], 'bodyFinish'),
    ).toBe('board-grey-neutral')
    expect(
      wardrobeSectionFinish(panel.configuration(), panel.configuration().sections[1], 'bodyFinish'),
    ).toBe('board-white-matte')
    const facades = section('Фасады: двери и ящики')
    fireEvent.click(within(facades).getByRole('radio', { name: 'Белый матовый' }))
    expect(panel.configuration().facadeFinish).toBe('board-white-matte')
  })
})
