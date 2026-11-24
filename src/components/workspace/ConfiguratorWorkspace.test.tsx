// @vitest-environment jsdom
import { useState } from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { ConfiguratorWorkspace } from './ConfiguratorWorkspace'

afterEach(cleanup)

it('keeps editor input and each page scroll position when opening save tools', () => {
  function Editor() {
    const [value, setValue] = useState('80')
    return <input aria-label="Ширина" value={value} onChange={event => setValue(event.target.value)} />
  }
  const { container } = render(<ConfiguratorWorkspace mode="wardrobe" title="Гардеробная"
    persistence="saved" notice={null} onModeChange={vi.fn()} viewer={<div />}
    settings={<Editor />} save={<button>Копировать ссылку</button>} />)
  const scroller = container.querySelector<HTMLDivElement>('.workspace-scroll')!
  fireEvent.change(screen.getByLabelText('Ширина'), { target: { value: '90' } })
  fireEvent.scroll(scroller, { target: { scrollTop: 460 } })
  fireEvent.click(screen.getByRole('button', { name: 'Сохранить и поделиться' }))
  expect(screen.queryByRole('textbox', { name: 'Ширина' })).toBeNull()
  expect(scroller.scrollTop).toBe(0)
  fireEvent.scroll(scroller, { target: { scrollTop: 110 } })
  fireEvent.click(screen.getByRole('button', { name: 'Настройки' }))
  expect((screen.getByLabelText('Ширина') as HTMLInputElement).value).toBe('90')
  expect(scroller.scrollTop).toBe(460)
  fireEvent.click(screen.getByRole('button', { name: 'Сохранить и поделиться' }))
  expect(scroller.scrollTop).toBe(110)
})

it('restores an expanded panel after hiding it and keeps the selected page', () => {
  const { container } = render(<ConfiguratorWorkspace mode="wardrobe" title="Гардеробная"
    persistence="unavailable" notice="Восстановлены настройки" onModeChange={vi.fn()}
    viewer={<div />} settings={<div />} save={<button>Копировать ссылку</button>} />)
  fireEvent.click(screen.getByRole('button', { name: 'Сохранить и поделиться' }))
  fireEvent.click(screen.getByRole('button', { name: 'Увеличить панель настроек' }))
  fireEvent.click(screen.getByRole('button', { name: 'Скрыть панель и показать модель' }))
  expect(container.firstElementChild?.getAttribute('data-panel-size')).toBe('collapsed')
  expect(screen.getByRole('button', { name: 'Открыть настройки' }).getAttribute('aria-expanded')).toBe('false')
  fireEvent.click(screen.getByRole('button', { name: 'Открыть настройки' }))
  expect(container.firstElementChild?.getAttribute('data-panel-size')).toBe('large')
  expect(screen.getByRole('button', { name: 'Сохранить и поделиться' }).getAttribute('aria-pressed')).toBe('true')
  expect(screen.getByText('Восстановлены настройки')).toBeTruthy()
  expect(screen.getByText(/Автосохранение недоступно/)).toBeTruthy()
})
