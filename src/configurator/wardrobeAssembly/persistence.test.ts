import { expect, it, vi } from 'vitest'
import { CONFIGURATION_STORAGE_KEY, PREVIOUS_CONFIGURATION_STORAGE_KEY, OLDER_CONFIGURATION_STORAGE_KEY, LEGACY_CONFIGURATION_STORAGE_KEY, createConfigurationUrl, createDefaultSession, readSavedSession, readSharedConfiguration, updateSession } from '../savedConfiguration'
import { createDefaultWardrobe, normalizeWardrobeAssembly } from './state'
import { createConfiguratorStore } from '../configuratorStore'
import { getConfigurationSummary } from '../configurationSummary'

const origin = 'https://example.test/viewer/?campaign=test#model'
it('roundtrips inserted shelves and a rod under an existing shelf without correction or lost materials', () => {
  let session = createDefaultSession()
  session = { ...session, mode: 'wardrobe', wardrobe: normalizeWardrobeAssembly({ sections: [
    { id: 'section-1', height: 2.8, shelves: 2, rod: false, layout: { shelves: [2.15, 2.45] }, bodyFinish: 'oak-natural' },
    { id: 'section-2', height: 2.8, shelves: 1, rod: false, layout: { shelves: [2.2] }, hardwareFinish: 'metal-brass-satin' },
  ] }) }
  session = updateSession(session, { type: 'wardrobe-action', action: { type: 'update-section', id: 'section-1', patch: { shelves: 4 } } })
  session = updateSession(session, { type: 'wardrobe-action', action: { type: 'update-section', id: 'section-2', patch: { rod: true } } })
  expect(session.wardrobe.sections[0].layout!.shelves).toEqual(expect.arrayContaining([2.15, 2.45]))
  expect(session.wardrobe.sections[0].shelves).toBe(4)
  expect(session.wardrobe.sections[1].layout).toEqual({ shelves: [2.2], rod: 2.1 })
  expect(readSavedSession(JSON.stringify(session))).toEqual({ session, notice: null })
  expect(readSharedConfiguration(createConfigurationUrl(origin, session))).toEqual({ status: 'valid', wardrobe: session.wardrobe })
  expect(session.wardrobe.sections[0].bodyFinish).toBe('oak-natural')
  expect(session.wardrobe.sections[1].hardwareFinish).toBe('metal-brass-satin')
})
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
  expect(result.status).toBe('adjusted'); expect(result.wardrobe?.sections).toHaveLength(7)
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

it('roundtrips inherited and explicit section finishes in storage, URL and the result summary', () => {
  let session = example()
  session = updateSession(session, { type: 'wardrobe-action', action: { type: 'set-section-finish', id: 'section-2', slot: 'bodyFinish', finishId: 'oak-natural' } })
  session = updateSession(session, { type: 'wardrobe-action', action: { type: 'set-section-finish', id: 'section-2', slot: 'hardwareFinish', finishId: 'metal-brass-satin' } })
  session = updateSession(session, { type: 'wardrobe-action', action: { type: 'set-section-finish', id: 'section-1', slot: 'bodyFinish', finishId: 'board-grey-neutral' } })
  expect(readSavedSession(JSON.stringify(session))).toEqual({ session, notice: null })
  expect(readSharedConfiguration(createConfigurationUrl(origin, session))).toEqual({ status: 'valid', wardrobe: session.wardrobe })
  const summary = getConfigurationSummary(session)
  expect(summary.rows.find(r => r.label === 'Секция 1: корпус и полки')?.value).toBe('Дуб натуральный · свой')
  expect(summary.rows.find(r => r.label === 'Секция 1: штанга')?.value).toBe('Латунь сатиновая · свой')
  expect(summary.rows.find(r => r.label === 'Секция 3: корпус и полки')?.value).toContain('общий')
  const restored = readSavedSession(JSON.stringify(session)).session
  const changed = updateSession(restored, { type: 'wardrobe-action', action: { type: 'set-wardrobe-finish', slot: 'bodyFinish', finishId: 'board-white-matte' } })
  expect(changed.wardrobe.sections[1].bodyFinish).toBe('board-grey-neutral')
  expect(changed.wardrobe.sections[2]).not.toHaveProperty('bodyFinish')
  const reset = updateSession(changed, { type: 'reset-model' })
  expect(reset.wardrobe).toEqual(createDefaultWardrobe())
  expect(reset.models).toBe(changed.models)
  expect(reset.assembly).toBe(changed.assembly)
})
it('reads old v4 assemblies without corrections and explains invalid section materials', () => {
  const old = example()
  expect(readSavedSession(JSON.stringify(old)).notice).toBeNull()
  expect(readSharedConfiguration(createConfigurationUrl(origin, old)).status).toBe('valid')
  const invalid = { ...old, wardrobe: { ...old.wardrobe, sections: old.wardrobe.sections.map((section, i) => i === 0 ? { ...section, bodyFinish: 'metal-white-matte', hardwareFinish: 'metal-brass-satin' } : section) } }
  const result = readSavedSession(JSON.stringify(invalid))
  expect(result.notice).toContain('материалы отдельных секций')
  expect(result.session.wardrobe.sections[0]).not.toHaveProperty('bodyFinish')
  expect(result.session.wardrobe.sections[0].hardwareFinish).toBe('metal-brass-satin')
  const shared = readSharedConfiguration(createConfigurationUrl(origin, invalid))
  expect(shared.status).toBe('adjusted')
  expect(shared.notice).toBe(result.notice)
  expect(readSharedConfiguration(createConfigurationUrl(origin, result.session)).status).toBe('valid')
})

it('roundtrips manual heights and independent finishes without modifying legacy automatic assemblies', () => {
  let session = example()
  const legacy = readSharedConfiguration(createConfigurationUrl(origin, session))
  expect(legacy.status).toBe('valid')
  expect(legacy.wardrobe!.sections.every(section => section.layout === undefined)).toBe(true)
  session = updateSession(session, { type: 'wardrobe-action', action: { type: 'set-layout-mode', id: 'section-2', manual: true } })
  session = updateSession(session, { type: 'wardrobe-action', action: { type: 'move-rod', id: 'section-2', height: 1.5 } })
  session = updateSession(session, { type: 'wardrobe-action', action: { type: 'set-section-finish', id: 'section-2', slot: 'bodyFinish', finishId: 'oak-natural' } })
  expect(session.wardrobe.sections[0].layout!.rod).toBe(1.5)
  expect(readSavedSession(JSON.stringify(session))).toEqual({ session, notice: null })
  expect(readSharedConfiguration(createConfigurationUrl(origin, session))).toEqual({ status: 'valid', wardrobe: session.wardrobe })
  const rows = getConfigurationSummary(session).rows
  expect(rows.find(row => row.label === 'Секция 1: ось штанги от пола')?.value).toBe('150 см')
  expect(rows.find(row => row.label === 'Секция 1: низ полок от пола')?.value).toContain('Верхняя полка')
  const reset = updateSession(session, { type: 'reset-model' })
  expect(reset.wardrobe).toEqual(createDefaultWardrobe())
  expect(reset.models).toBe(session.models)
})
it('does not persist a pending manual reposition, and explains corrections to imported layouts', () => {
  let initial = example()
  initial = updateSession(initial, { type: 'wardrobe-action', action: { type: 'set-layout-mode', id: 'section-1', manual: true } })
  const values = new Map([[CONFIGURATION_STORAGE_KEY, JSON.stringify(initial)]])
  let href = createConfigurationUrl(origin, initial)
  const store = createConfiguratorStore({ getHref: () => href, replaceUrl: value => { href = value }, getStorage: () => ({ getItem: k => values.get(k) ?? null, setItem: (k, v) => { values.set(k, v) } }), onPageHide: () => () => {} })
  const disconnect = store.connect(), before = store.getSnapshot(), saved = values.get(CONFIGURATION_STORAGE_KEY), originalUrl = href
  store.dispatch({ type: 'wardrobe-action', action: { type: 'update-section', id: 'section-1', patch: { height: 1.8 } } })
  expect(store.getSnapshot()).toBe(before)
  expect(values.get(CONFIGURATION_STORAGE_KEY)).toBe(saved)
  expect(href).toBe(originalUrl)
  store.dispatch({ type: 'wardrobe-action', action: { type: 'update-section', id: 'section-1', patch: { height: 1.8 }, confirmFillingChange: true } })
  disconnect()
  const accepted = store.getSnapshot().session
  expect(accepted.wardrobe.sections.find(s => s.id === 'section-1')!.height).toBe(1.8)
  expect(readSavedSession(values.get(CONFIGURATION_STORAGE_KEY)!).session).toEqual(accepted)
  const invalid = { ...accepted, wardrobe: { ...accepted.wardrobe, sections: accepted.wardrobe.sections.map(s => s.id === 'section-1' ? { ...s, layout: { shelves: [-10, .31, .32, 90] } } : s) } }
  const corrected = readSavedSession(JSON.stringify(invalid))
  expect(corrected.notice).toContain('Положения полок')
  const shared = readSharedConfiguration(createConfigurationUrl(origin, invalid))
  expect(shared.status).toBe('adjusted')
  expect(shared.notice).toBe(corrected.notice)
  expect(readSharedConfiguration(createConfigurationUrl(origin, corrected.session)).status).toBe('valid')
})
