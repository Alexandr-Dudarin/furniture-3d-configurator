// @vitest-environment jsdom
import { useEffect, useSyncExternalStore } from 'react'
import { afterAll, afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import type { ConfiguratorStore } from './configurator/configuratorStore'
import type { PngExportStore } from './configurator/pngExportStore'
import { CONFIGURATION_STORAGE_KEY, createDefaultSession, readSharedConfiguration } from './configurator/savedConfiguration'
import App from './App'

const scene = vi.hoisted(() => ({ mount: vi.fn(), unmount: vi.fn(), capture: vi.fn() }))
// Keep the actual application/store/editors; substitute only WebGL and browser downloads.
vi.mock('./components/FurnitureViewer', () => ({
  FurnitureViewer: function Viewer({ store, pngExport }: { store: ConfiguratorStore; pngExport: PngExportStore }) {
    const { session } = useSyncExternalStore(store.subscribe, store.getSnapshot)
    useEffect(() => { scene.mount(); return () => { scene.unmount() } }, [])
    useEffect(() => pngExport.attach({ session, capture: scene.capture }), [pngExport, session])
    return <div className="viewer" />
  },
}))

const originalScroll = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollIntoView')
beforeAll(() => Object.defineProperty(Element.prototype, 'scrollIntoView', { configurable: true, value: vi.fn() }))
afterAll(() => {
  if (originalScroll) Object.defineProperty(Element.prototype, 'scrollIntoView', originalScroll)
  else Reflect.deleteProperty(Element.prototype, 'scrollIntoView')
})
beforeEach(() => {
  vi.clearAllMocks()
  window.history.replaceState(null, '', '/')
  window.localStorage.clear()
  window.localStorage.setItem(CONFIGURATION_STORAGE_KEY, JSON.stringify({ ...createDefaultSession(), mode: 'wardrobe' }))
})
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals() })

it('keeps the selected section, edited width and open settings while sharing the current configuration', async () => {
  const clipboard = vi.fn().mockResolvedValue(undefined)
  vi.stubGlobal('navigator', { clipboard: { writeText: clipboard } })
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'Секции и углы' }))
  fireEvent.click(within(screen.getByRole('group', { name: 'Выбор секции гардеробной' })).getByText('Секция 2', { selector: 'strong' }))
  fireEvent.change(screen.getByRole('slider', { name: 'Ширина секции' }), { target: { value: '.75' } })
  fireEvent.click(screen.getByRole('button', { name: 'Сохранить и поделиться' }))
  fireEvent.click(screen.getByRole('button', { name: 'Копировать ссылку' }))
  await screen.findByText('Ссылка скопирована')
  const shared = readSharedConfiguration(clipboard.mock.calls[0][0])
  expect(shared).toMatchObject({ status: 'valid', wardrobe: { sections: expect.arrayContaining([expect.objectContaining({ id: 'section-2', width: .75 })]) } })
  fireEvent.click(screen.getByRole('button', { name: 'Настройки' }))
  expect(screen.getByText('Секция 2: размеры')).toBeTruthy()
  expect((screen.getByRole('textbox', { name: 'Ширина секции, см' }) as HTMLInputElement).value).toBe('75')
  expect(scene.mount).toHaveBeenCalledOnce()
  expect(scene.unmount).not.toHaveBeenCalled()
})

it('offers a manual link if clipboard access fails, and opens settings when changing mode', async () => {
  vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('Denied')) } })
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'Сохранить и поделиться' }))
  fireEvent.click(screen.getByRole('button', { name: 'Копировать ссылку' }))
  const link = await screen.findByRole('textbox', { name: 'Ссылка на конфигурацию' }) as HTMLTextAreaElement
  expect(readSharedConfiguration(link.value)).toMatchObject({ status: 'valid', wardrobe: expect.any(Object) })
  fireEvent.click(screen.getByRole('button', { name: 'Готовые модели' }))
  expect(screen.getByRole('combobox', { name: 'Выбор модели мебели' })).toBeTruthy()
  expect(screen.queryByRole('textbox', { name: 'Ссылка на конфигурацию' })).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Сохранить и поделиться' }))
  fireEvent.click(screen.getByRole('button', { name: 'Копировать ссылку' }))
  const nextLink = await screen.findByRole('textbox', { name: 'Ссылка на конфигурацию' }) as HTMLTextAreaElement
  expect(readSharedConfiguration(nextLink.value)).toMatchObject({ configuration: { modelId: createDefaultSession().selectedModelId } })
  expect(scene.mount).toHaveBeenCalledOnce()
})

it('exports PNG through the same scene after switching pages', async () => {
  vi.useFakeTimers()
  const blob = new Blob(['png'], { type: 'image/png' })
  scene.capture.mockResolvedValue(blob)
  const objectUrl = vi.fn().mockReturnValue('blob:preview')
  const revoke = vi.fn()
  vi.stubGlobal('URL', class extends URL { static createObjectURL = objectUrl; static revokeObjectURL = revoke })
  const download = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'Сохранить и поделиться' }))
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Сохранить вид в PNG' })) })
  expect(download).toHaveBeenCalledOnce()
  expect(scene.capture).toHaveBeenCalledOnce()
  expect(objectUrl).toHaveBeenCalledWith(blob)
  expect(screen.getByText('PNG передан на скачивание.')).toBeTruthy()
  expect(scene.mount).toHaveBeenCalledOnce()
  await act(() => vi.advanceTimersByTimeAsync(60_000))
  expect(revoke).toHaveBeenCalledWith('blob:preview')
})
