import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createConfiguratorStore } from './configuratorStore'
import { CONFIGURATION_STORAGE_KEY, createConfigurationUrl, createDefaultSession, readSharedConfiguration, updateSession } from './savedConfiguration'

const roundId = 'table-05-round-fluted-pedestal'
const origin = 'https://furniture.example/'

function environment(initialHref = origin, saved?: string) {
  let href = initialHref
  const values = new Map(saved ? [[CONFIGURATION_STORAGE_KEY, saved]] : [])
  const storage = {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => { values.set(key, value) }),
  }
  const pageHide = new Set<() => void>()
  return {
    storage, values, pageHide,
    getStorage: () => storage,
    getHref: () => href,
    replaceUrl: vi.fn((next: string) => { href = next }),
    onPageHide: (callback: () => void) => {
      pageHide.add(callback)
      return () => { pageHide.delete(callback) }
    },
  }
}

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('browser configuration lifecycle', () => {
  it('hydrates before subscribing and remembers different models through a reload', () => {
    const env = environment()
    const store = createConfiguratorStore(env)
    const disconnect = store.connect()
    const firstId = store.getSnapshot().session.selectedModelId
    store.dispatch({ type: 'set-dimension', name: 'length', value: 1.8 })
    store.dispatch({ type: 'set-material', slot: 'primaryTop', finishId: 'marble-white-gold' })
    store.dispatch({ type: 'select-model', modelId: roundId })
    store.dispatch({ type: 'set-dimension', name: 'diameter', value: 1.3 })
    store.dispatch({ type: 'set-material', slot: 'frameMetal', finishId: 'metal-white-matte' })
    expect(store.getSnapshot().persistence).toBe('pending')
    vi.advanceTimersByTime(250)
    expect(store.getSnapshot().persistence).toBe('saved')
    const restored = createConfiguratorStore(env)
    expect(restored.getSnapshot().session).toEqual(store.getSnapshot().session)
    restored.dispatch({ type: 'select-model', modelId: firstId })
    expect(restored.getSnapshot().session.models[firstId].dimensions.length).toBe(1.8)
    expect(restored.getSnapshot().session.models[firstId].materials.primaryTop).toBe('marble-white-gold')
    disconnect()
  })

  it('gives a shared configuration priority, keeping other saved models intact', () => {
    let local = updateSession(createDefaultSession(), { type: 'set-dimension', name: 'length', value: 1.8 })
    local = updateSession(local, { type: 'select-model', modelId: roundId })
    local = updateSession(local, { type: 'set-material', slot: 'frameMetal', finishId: 'metal-white-matte' })
    const url = new URL(origin)
    url.searchParams.set('config', JSON.stringify({ version: 1, modelId: roundId, dimensions: { diameter: 1.3 } }))
    const env = environment(url.href, JSON.stringify(local))
    const store = createConfiguratorStore(env)
    expect(store.getSnapshot().session.selectedModelId).toBe(roundId)
    expect(store.getSnapshot().session.models[roundId].dimensions.diameter).toBe(1.3)
    expect(store.getSnapshot().session.models[roundId].materials.frameMetal).toBe('metal-black-matte')
    expect(store.getSnapshot().session.models['table-01'].dimensions.length).toBe(1.8)
    expect(store.getSnapshot().notice).toContain('заменены')
  })

  it('updates an opened link after editing so reload cannot undo the latest values', () => {
    const shared = updateSession(createDefaultSession(), { type: 'select-model', modelId: roundId })
    const env = environment(createConfigurationUrl(`${origin}?campaign=demo#view`, shared))
    const store = createConfiguratorStore(env)
    const disconnect = store.connect()
    store.dispatch({ type: 'set-dimension', name: 'diameter', value: 1.3 })
    vi.advanceTimersByTime(250)
    expect(readSharedConfiguration(env.getHref()).configuration!.dimensions.diameter).toBe(1.3)
    expect(createConfiguratorStore(env).getSnapshot().session.models[roundId].dimensions.diameter).toBe(1.3)
    expect(new URL(env.getHref()).searchParams.get('campaign')).toBe('demo')
    expect(new URL(env.getHref()).hash).toBe('#view')
    disconnect()
  })

  it('copies the latest state before a pending save and includes only the selected model', () => {
    const store = createConfiguratorStore(environment())
    store.dispatch({ type: 'select-model', modelId: roundId })
    store.dispatch({ type: 'set-dimension', name: 'diameter', value: 1.3 })
    const parsed = readSharedConfiguration(store.getShareUrl())
    expect(parsed.status).toBe('valid')
    expect(parsed.configuration!.dimensions).toEqual({ diameter: 1.3 })
    expect(Object.hasOwn(parsed.configuration!, 'models')).toBe(false)
  })

  it('discards an invalid link without losing the saved session or unrelated URL fields', () => {
    const saved = updateSession(createDefaultSession(), { type: 'select-model', modelId: roundId })
    const env = environment(`${origin}?config=invalid&campaign=demo#view`, JSON.stringify(saved))
    const store = createConfiguratorStore(env)
    expect(store.getSnapshot().session.selectedModelId).toBe(roundId)
    expect(store.getSnapshot().notice).toContain('недоступна')
    const disconnect = store.connect()
    expect(env.getHref()).toBe(`${origin}?campaign=demo#view`)
    disconnect()
  })

  it('debounces slider writes but flushes immediately when leaving the page', () => {
    const env = environment()
    const store = createConfiguratorStore(env)
    const disconnect = store.connect()
    const writes = env.storage.setItem.mock.calls.length
    for (const value of [1.3, 1.4, 1.5, 1.6]) store.dispatch({ type: 'set-dimension', name: 'length', value })
    expect(env.storage.setItem).toHaveBeenCalledTimes(writes)
    env.pageHide.forEach((callback) => callback())
    expect(env.storage.setItem).toHaveBeenCalledTimes(writes + 1)
    expect(JSON.parse(env.values.get(CONFIGURATION_STORAGE_KEY)!).models['table-01'].dimensions.length).toBe(1.6)
    vi.advanceTimersByTime(500)
    expect(env.storage.setItem).toHaveBeenCalledTimes(writes + 1)
    disconnect()
    expect(env.pageHide.size).toBe(0)
  })

  it('remains editable and shareable if storage access throws', () => {
    const env = environment()
    env.getStorage = () => { throw new Error('SecurityError') }
    const store = createConfiguratorStore(env)
    const disconnect = store.connect()
    expect(store.getSnapshot().persistence).toBe('unavailable')
    store.dispatch({ type: 'set-dimension', name: 'length', value: 1.8 })
    vi.advanceTimersByTime(250)
    expect(store.getSnapshot().persistence).toBe('unavailable')
    expect(readSharedConfiguration(store.getShareUrl()).configuration!.dimensions.length).toBe(1.8)
    disconnect()
  })

  it('reports storage quota errors and recovers on the next successful save', () => {
    const env = environment()
    env.storage.setItem.mockImplementationOnce(() => { throw new Error('QuotaExceededError') })
    const store = createConfiguratorStore(env)
    const disconnect = store.connect()
    expect(store.getSnapshot().persistence).toBe('unavailable')
    store.dispatch({ type: 'set-dimension', name: 'length', value: 1.8 })
    vi.advanceTimersByTime(250)
    expect(store.getSnapshot().persistence).toBe('saved')
    disconnect()
  })

  it('tolerates repeated connection cleanup in React StrictMode', () => {
    const env = environment()
    const store = createConfiguratorStore(env)
    const listener = vi.fn()
    const unsubscribe = store.subscribe(listener)
    store.connect()()
    const disconnect = store.connect()
    store.dispatch({ type: 'set-dimension', name: 'length', value: 1.8 })
    disconnect()
    vi.advanceTimersByTime(500)
    expect(env.pageHide.size).toBe(0)
    expect(vi.getTimerCount()).toBe(0)
    expect(listener).toHaveBeenCalled()
    unsubscribe()
    listener.mockClear()
    store.dispatch({ type: 'set-dimension', name: 'length', value: 1.7 })
    expect(listener).not.toHaveBeenCalled()
  })
})
