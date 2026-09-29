import { expect, it, vi } from 'vitest'
import { CONFIGURATION_STORAGE_KEY, PREVIOUS_CONFIGURATION_STORAGE_KEY, OLDER_CONFIGURATION_STORAGE_KEY, LEGACY_CONFIGURATION_STORAGE_KEY, createConfigurationUrl, createDefaultSession, readSavedSession, readSharedConfiguration, updateSession } from '../savedConfiguration'
import { createDefaultWardrobe } from './state'
import { createConfiguratorStore } from '../configuratorStore'
import { getConfigurationSummary } from '../configurationSummary'

const origin = 'https://example.test/viewer/?campaign=test#model'
function example() {
  let session = updateSession(createDefaultSession(), { type: 'set-mode', mode: 'wardrobe' })
  session = updateSession(session, { type: 'wardrobe-action', action: { type: 'update-section', id: 'section-2', patch: { width: 1, height: 2.5, depth: .4 } } })
  return updateSession(session, { type: 'wardrobe-action', action: { type: 'move-section', id: 'section-2', direction: -1 } })
}

it('roundtrips order, dimensions and filling in storage and a version 4 link', () => {
  const session = example(), href = createConfigurationUrl(origin, session)
  expect(readSavedSession(JSON.stringify(session)).session).toEqual(session)
  expect(readSharedConfiguration(href)).toEqual({ status: 'valid', wardrobe: session.wardrobe })
  const url = new URL(href)
  expect(JSON.parse(url.searchParams.get('config')!).version).toBe(4)
  expect(url.pathname).toBe('/viewer/'); expect(url.hash).toBe('#model'); expect(url.searchParams.get('campaign')).toBe('test')
  const summary = getConfigurationSummary(session)
  expect(summary.fileStem).toBe('wardrobe-assembly')
  expect(summary.rows.find(r => r.label === 'Секция 1')?.value).toContain('торцевая штанга')
})
it.each([[1, LEGACY_CONFIGURATION_STORAGE_KEY], [2, OLDER_CONFIGURATION_STORAGE_KEY], [3, PREVIOUS_CONFIGURATION_STORAGE_KEY]])('migrates version %s without losing previous furniture settings', (version, key) => {
  let old = updateSession(createDefaultSession(), { type: 'select-model', modelId: 'dresser-12-brooklyn-six-drawer' })
  old = updateSession(old, { type: 'set-dimension', name: 'height', value: .8 })
  old = updateSession(old, { type: 'set-facade-style', style: 'frame' })
  const serialized = JSON.stringify({ ...old, version, wardrobe: undefined })
  const values = new Map([[String(key), serialized]])
  const store = createConfiguratorStore({ getStorage: () => ({ getItem: k => values.get(k) ?? null, setItem: (k, v) => { values.set(k, v) } }), getHref: () => origin, replaceUrl: () => {}, onPageHide: () => () => {} })
  expect(store.getSnapshot().session.models).toEqual(old.models)
  expect(store.getSnapshot().session.wardrobe).toEqual(createDefaultWardrobe())
  const disconnect = store.connect(); disconnect()
  expect(readSavedSession(values.get(CONFIGURATION_STORAGE_KEY)!).session.models).toEqual(old.models)
})
it('rejects malformed links and bounds excessive section data', () => {
  const url = new URL(origin)
  for (const wardrobe of [null, {}, { sections: [] }]) {
    url.searchParams.set('config', JSON.stringify({ version: 4, kind: 'wardrobe-assembly', wardrobe }))
    expect(readSharedConfiguration(url.href).status).toBe('invalid')
  }
  url.searchParams.set('config', JSON.stringify({ version: 4, kind: 'wardrobe-assembly', wardrobe: { sections: Array(20).fill({ width: 500, shelves: 100 }) } }))
  const result = readSharedConfiguration(url.href)
  expect(result.status).toBe('adjusted'); expect(result.wardrobe?.sections).toHaveLength(6)
  expect(result.wardrobe?.sections.every(s => s.width === 1 && s.shelves === 6)).toBe(true)
})
it('resets only the wardrobe and preserves it across the other modes', () => {
  let session = example()
  const changed = session.wardrobe, models = session.models, table = session.assembly
  for (const mode of ['catalog', 'builder', 'wardrobe'] as const) session = updateSession(session, { type: 'set-mode', mode })
  expect(session.wardrobe).toBe(changed)
  session = updateSession(session, { type: 'reset-model' })
  expect(session.wardrobe).toEqual(createDefaultWardrobe())
  expect(session.models).toBe(models); expect(session.assembly).toBe(table)
})
it('preserves an existing oak assembly and roundtrips new sizes and the lower hanging shelf', () => {
  const old = example()
  old.wardrobe.bodyFinish = 'oak-natural'
  expect(readSavedSession(JSON.stringify(old)).session.wardrobe.bodyFinish).toBe('oak-natural')
  expect(readSharedConfiguration(createConfigurationUrl(origin, old)).wardrobe?.bodyFinish).toBe('oak-natural')
  let changed = updateSession(old, { type: 'wardrobe-action', action: { type: 'update-section', id: 'section-2', patch: { height: 2.8, depth: .8, shelves: 2 } } })
  changed = updateSession(changed, { type: 'wardrobe-action', action: { type: 'update-section', id: 'section-1', patch: { height: .8 }, confirmHeightChange: true } })
  expect(readSavedSession(JSON.stringify(changed)).session).toEqual(changed)
  expect(readSharedConfiguration(createConfigurationUrl(origin, changed))).toEqual({ status: 'valid', wardrobe: changed.wardrobe })
  expect(getConfigurationSummary(changed).rows.find(r => r.label === 'Секция 1')?.value).toContain('верхняя и нижняя полки')
  expect(updateSession(changed, { type: 'reset-model' }).wardrobe.bodyFinish).toBe('board-grey-neutral')
})
it('normalizes old low hanging sections and surfaces the adjustment for both storage and links', () => {
  const old = example()
  old.wardrobe.sections[0] = { ...old.wardrobe.sections[0], height: 1.4, rod: true, shelves: 2 }
  const restored = readSavedSession(JSON.stringify(old))
  expect(restored.session.wardrobe.sections[0]).toMatchObject({ height: 1.4, rod: false, shelves: 2 })
  expect(restored.notice).toContain('150 см')
  expect(restored.session.models).toEqual(old.models)
  const href = createConfigurationUrl(origin, old)
  const shared = readSharedConfiguration(href)
  expect(shared.status).toBe('adjusted')
  expect(shared.notice).toContain('150 см')
  expect(shared.wardrobe).toEqual(restored.session.wardrobe)
  const store = createConfiguratorStore({ getHref: () => href, replaceUrl: () => {}, getStorage: () => ({ getItem: () => null, setItem: () => {} }), onPageHide: () => () => {} })
  expect(store.getSnapshot().notice).toBe(shared.notice)
})
it('does not save or publish a pending height change until it is confirmed', () => {
  const initial = example(), values = new Map([[CONFIGURATION_STORAGE_KEY, JSON.stringify(initial)]])
  const store = createConfiguratorStore({ getHref: () => origin, replaceUrl: () => {}, getStorage: () => ({ getItem: k => values.get(k) ?? null, setItem: (k, v) => { values.set(k, v) } }), onPageHide: () => () => {} })
  const disconnect = store.connect(), listener = vi.fn(), unsubscribe = store.subscribe(listener)
  const before = store.getSnapshot(), saved = values.get(CONFIGURATION_STORAGE_KEY), href = store.getShareUrl()
  store.dispatch({ type: 'wardrobe-action', action: { type: 'update-section', id: 'section-2', patch: { height: 1.4 } } })
  expect(store.getSnapshot()).toBe(before)
  expect(values.get(CONFIGURATION_STORAGE_KEY)).toBe(saved)
  expect(store.getShareUrl()).toBe(href)
  expect(listener).not.toHaveBeenCalled()
  store.dispatch({ type: 'wardrobe-action', action: { type: 'update-section', id: 'section-2', patch: { height: 1.4 }, confirmHeightChange: true } })
  expect(store.getSnapshot().session.wardrobe.sections[0]).toMatchObject({ height: 1.4, rod: false })
  expect(listener).toHaveBeenCalledTimes(1)
  unsubscribe(); disconnect()
  expect(readSavedSession(values.get(CONFIGURATION_STORAGE_KEY)!).session.wardrobe.sections[0].rod).toBe(false)
})
it('opens a wardrobe link before saved state and updates that link after edits', () => {
  vi.useFakeTimers()
  try {
    const shared = example(), values = new Map([[CONFIGURATION_STORAGE_KEY, JSON.stringify(createDefaultSession())]])
    let href = createConfigurationUrl(origin, shared)
    const store = createConfiguratorStore({ getHref: () => href, replaceUrl: next => { href = next }, getStorage: () => ({ getItem: k => values.get(k) ?? null, setItem: (k, v) => { values.set(k, v) } }), onPageHide: () => () => {} })
    expect(store.getSnapshot().session.mode).toBe('wardrobe')
    expect(store.getSnapshot().session.wardrobe).toEqual(shared.wardrobe)
    const disconnect = store.connect()
    store.dispatch({ type: 'wardrobe-action', action: { type: 'remove-section', id: 'section-2' } })
    vi.advanceTimersByTime(300)
    expect(readSharedConfiguration(href).wardrobe?.sections).toHaveLength(2)
    expect(readSavedSession(values.get(CONFIGURATION_STORAGE_KEY)!).session.wardrobe.sections).toHaveLength(2)
    disconnect()
  } finally { vi.useRealTimers() }
})
