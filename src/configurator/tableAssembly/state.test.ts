import { expect, it } from 'vitest'
import { createConfiguratorStore } from '../configuratorStore'
import { CONFIGURATION_STORAGE_KEY, LEGACY_CONFIGURATION_STORAGE_KEY, createConfigurationUrl, createDefaultSession, readSharedConfiguration, readSavedSession, updateSession } from '../savedConfiguration'
import { TABLE_BASES, TOP_SHAPES } from './catalog'
import { createDefaultAssembly, normalizeTableAssembly, updateTableAssembly } from './state'

it.each(TOP_SHAPES)('$id always resolves a compatible base, dimensions and material', ({ id }) => {
  for (const base of TABLE_BASES) {
    const result = normalizeTableAssembly({ shape: id, baseId: base.id, length: 999, width: -99, thickness: 0, baseHeight: Infinity, baseFinish: 'unknown' })
    const chosen = TABLE_BASES.find((entry) => entry.id === result.baseId)!
    expect(chosen.compatibleShapes).toContain(id)
    expect(chosen.allowedFinishes).toContain(result.baseFinish)
    expect(result.length).toBeLessThanOrEqual(id === 'circle' ? chosen.diameter!.max : chosen.length.max)
    expect(result.width).toBeGreaterThanOrEqual(id === 'circle' ? chosen.diameter!.min : chosen.width.min)
    expect(result.thickness).toBe(0.02)
    expect(result.baseHeight).toBe(chosen.height.base)
    if (id === 'circle') expect(result.length).toBe(result.width)
  }
})

it('explains an automatic compatibility change and preserves the chosen top finish', () => {
  const original = { ...createDefaultAssembly(), topFinish: 'marble-duo-gold' }
  const result = updateTableAssembly(original, { shape: 'circle' })
  expect(result.configuration.baseId).toBe('round-fluted')
  expect(result.configuration.baseFinish).toBe('metal-black-matte')
  expect(result.configuration.topFinish).toBe('marble-duo-gold')
  expect(result.notice).toContain('Для этой формы')
})

it('migrates v1 models and links without altering accepted configurations', () => {
  const legacy = { version: 1, selectedModelId: 'table-05-round-fluted-pedestal' as const, models: {
    'table-05-round-fluted-pedestal': { dimensions: { diameter: 1.3 }, materials: { primaryTop: 'marble-black-gold', frameMetal: 'metal-white-matte' } },
  } }
  const migrated = readSavedSession(JSON.stringify(legacy)).session
  expect(migrated.version).toBe(2)
  expect(migrated.mode).toBe('catalog')
  expect(migrated.models[legacy.selectedModelId]).toEqual(legacy.models[legacy.selectedModelId])
  const oldUrl = new URL('https://example.test/')
  oldUrl.searchParams.set('config', JSON.stringify({ version: 1, modelId: legacy.selectedModelId, ...legacy.models[legacy.selectedModelId] }))
  expect(readSharedConfiguration(oldUrl.href).status).toBe('valid')
  // Ссылки обычных моделей по-прежнему доступны приложениям этапа save/share v1.
  expect(JSON.parse(new URL(createConfigurationUrl(oldUrl.href, migrated)).searchParams.get('config')!).version).toBe(1)
})

it('restores and shares an assembly, resetting it independently from catalog models', () => {
  let session = updateSession(createDefaultSession(), { type: 'set-dimension', name: 'length', value: 1.8 })
  const catalog = session.models
  session = updateSession(session, { type: 'set-mode', mode: 'builder' })
  session = updateSession(session, { type: 'update-assembly', patch: { shape: 'circle', length: 1.3, thickness: 0.035, topFinish: 'marble-white-gold' } })
  session = updateSession(session, { type: 'update-assembly', patch: { baseHeight: 0.778, baseFinish: 'metal-white-matte' } })
  expect(readSavedSession(JSON.stringify(session)).session).toEqual(session)
  const parsed = readSharedConfiguration(createConfigurationUrl('https://example.test/?campaign=one#view', session))
  expect(parsed.status).toBe('valid')
  expect(parsed.assembly).toEqual(session.assembly)
  expect(parsed.configuration).toBeUndefined()
  const savedAssembly = session.assembly
  session = updateSession(session, { type: 'set-mode', mode: 'catalog' })
  expect(session.assembly).toBe(savedAssembly)
  session = updateSession(session, { type: 'set-mode', mode: 'builder' })
  session = updateSession(session, { type: 'reset-model' })
  expect(session.assembly).toEqual(createDefaultAssembly())
  expect(session.models).toBe(catalog)
})

it('reads the legacy storage key, writes v2 separately and prioritizes a builder link', () => {
  const old = JSON.stringify({ version: 1, selectedModelId: 'table-01', models: { 'table-01': { dimensions: { length: 1.8, width: 0.9 } } } })
  const values = new Map([[LEGACY_CONFIGURATION_STORAGE_KEY, old]])
  const shared = updateSession(createDefaultSession(), { type: 'set-mode', mode: 'builder' })
  const env = {
    getStorage: () => ({ getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value) } }),
    getHref: () => createConfigurationUrl('https://example.test/', shared),
    replaceUrl: () => {}, onPageHide: () => () => {},
  }
  const store = createConfiguratorStore(env)
  expect(store.getSnapshot().session.mode).toBe('builder')
  expect(store.getSnapshot().session.models['table-01'].dimensions).toEqual({ length: 1.8, width: 0.9 })
  const disconnect = store.connect()
  expect(JSON.parse(values.get(CONFIGURATION_STORAGE_KEY)!).version).toBe(2)
  expect(values.get(LEGACY_CONFIGURATION_STORAGE_KEY)).toBe(old)
  disconnect()
})

it('sanitizes an outdated assembly link and rejects malformed payloads', () => {
  const url = new URL('https://example.test/')
  url.searchParams.set('config', JSON.stringify({ version: 2, kind: 'table-assembly', assembly: { shape: 'circle', baseId: '__proto__', length: 99 } }))
  const parsed = readSharedConfiguration(url.href)
  expect(parsed.status).toBe('adjusted')
  expect(parsed.assembly!.baseId).toBe('round-fluted')
  expect(parsed.assembly!.length).toBe(1.4)
  for (const payload of [{ version: 2, kind: 'table-assembly', assembly: [] }, { version: 3, kind: 'table-assembly', assembly: {} }, { version: 1, kind: 'table-assembly', assembly: {} }]) {
    url.searchParams.set('config', JSON.stringify(payload))
    expect(readSharedConfiguration(url.href).status).toBe('invalid')
  }
})
