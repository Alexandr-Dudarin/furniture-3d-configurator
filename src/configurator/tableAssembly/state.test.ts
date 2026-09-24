import { expect, it } from 'vitest'
import { createConfiguratorStore } from '../configuratorStore'
import { CONFIGURATION_VERSION, CONFIGURATION_STORAGE_KEY, LEGACY_CONFIGURATION_STORAGE_KEY, createConfigurationUrl, createDefaultSession, readSharedConfiguration, readSavedSession, updateSession } from '../savedConfiguration'
import { getTableBase, getTabletopWidthConfig, TABLE_BASES, TABLETOP_EDGE_PROFILES, TOP_SHAPES } from './catalog'
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
  expect(migrated.version).toBe(CONFIGURATION_VERSION)
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

it('reads the legacy storage key, writes the current version separately and prioritizes a builder link', () => {
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
  expect(JSON.parse(values.get(CONFIGURATION_STORAGE_KEY)!).version).toBe(CONFIGURATION_VERSION)
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
  for (const payload of [{ version: 2, kind: 'table-assembly', assembly: [] }, { version: 99, kind: 'table-assembly', assembly: {} }, { version: 1, kind: 'table-assembly', assembly: {} }]) {
    url.searchParams.set('config', JSON.stringify(payload))
    expect(readSharedConfiguration(url.href).status).toBe('invalid')
  }
})

it.each(['ellipse', 'capsule'] as const)('%s stays elongated when reducing length, switching from a circle and restoring an old square configuration', (shape) => {
  const circle = normalizeTableAssembly({ shape: 'circle', length: 1.1 })
  const changed = updateTableAssembly(circle, { shape })
  expect(changed.configuration.length).toBe(1.1)
  expect(changed.configuration.width).toBe(0.9)
  expect(changed.notice).toContain('20 см')
  const large = normalizeTableAssembly({ shape, baseId: 'round-fluted', length: 1.4, width: 1.1 })
  expect(updateTableAssembly(large, { length: 1.1 }).configuration.width).toBe(0.9)
  const old = { ...circle, shape }
  const stored = readSavedSession(JSON.stringify({ ...createDefaultSession(), mode: 'builder', assembly: old }))
  expect(stored.session.assembly.width).toBe(0.9)
  const shared = readSharedConfiguration(createConfigurationUrl('https://example.test', { ...createDefaultSession(), mode: 'builder', assembly: old }))
  expect(shared.status).toBe('adjusted')
  expect(shared.assembly).toEqual(changed.configuration)
  for (const baseId of ['slat-pedestal', 'round-fluted', 'v-pedestal']) {
    const base = getTableBase(baseId)
    for (let i = 0; i <= Math.round((base.length.max - base.length.min) / base.length.step); i++) {
      const length = base.length.min + i * base.length.step
      const config = normalizeTableAssembly({ baseId, shape, length, width: 99 })
      const ui = getTabletopWidthConfig(base, shape, config.length)
      expect(config.length - config.width).toBeGreaterThanOrEqual(0.2 - 1e-8)
      expect(ui.max).toBe(config.width)
      expect(ui.min).toBeLessThanOrEqual(ui.max)
      expect(normalizeTableAssembly(config)).toEqual(config)
    }
  }
})

it('shares four-leg height limits and excludes the three curved shapes', () => {
  const base = getTableBase('four-legs')
  expect(base.height.min).toBe(0.64)
  expect(base.height.max).toBe(0.84)
  for (const shape of base.compatibleShapes) for (const baseHeight of [0.64, 0.71, 0.84]) {
    const assembly = normalizeTableAssembly({ baseId: base.id, shape, length: 2, width: 1, baseHeight, baseFinish: 'metal-white-matte' })
    const session = { ...createDefaultSession(), mode: 'builder' as const, assembly }
    expect(readSavedSession(JSON.stringify(session)).session.assembly).toEqual(assembly)
    const parsed = readSharedConfiguration(createConfigurationUrl('https://example.test', session))
    expect(parsed.status).toBe('valid')
    expect(parsed.assembly).toEqual(assembly)
  }
  for (const shape of ['circle', 'ellipse', 'capsule'] as const) {
    expect(base.compatibleShapes).not.toContain(shape)
    const changed = updateTableAssembly(normalizeTableAssembly({ baseId: base.id }), { shape })
    expect(changed.configuration.baseId).not.toBe(base.id)
    expect(changed.notice).toContain('Для этой формы')
  }
})

it.each(['four-legs', 'round-fluted', 'u-frame'])('%s uses 64–84 cm in whole centimetres for UI, defaults, storage and links', (baseId) => {
  const base = getTableBase(baseId)
  expect([base.height.min, base.height.max, base.height.step]).toEqual([0.64, 0.84, 0.01])
  const initial = normalizeTableAssembly({ baseId })
  expect(initial.baseHeight).toBe(baseId === 'four-legs' ? 0.71 : 0.74)
  for (let cm = 64; cm <= 84; cm++) {
    const config = normalizeTableAssembly({ ...initial, baseHeight: cm / 100 })
    expect(config.baseHeight).toBe(cm / 100)
    expect(normalizeTableAssembly(config)).toEqual(config)
  }
  for (const [previous, expected] of [[0.61, 0.64], [0.645, 0.65], [0.678, 0.68], [0.728, 0.73], [0.735, 0.74], [0.738, 0.74], [0.778, 0.78], [0.798, 0.8], [0.85, 0.84]]) {
    const old = { ...createDefaultSession(), mode: 'builder' as const, assembly: { ...initial, baseHeight: previous } }
    expect(readSavedSession(JSON.stringify(old)).session.assembly.baseHeight).toBe(expected)
    const shared = readSharedConfiguration(createConfigurationUrl('https://example.test', old))
    expect(shared.status).toBe('adjusted')
    expect(shared.assembly!.baseHeight).toBe(expected)
    const patch = updateTableAssembly(initial, { baseHeight: previous })
    expect(patch.configuration.baseHeight).toBe(expected)
    expect(patch.notice).toContain('Высота')
  }
  expect(normalizeTableAssembly({ baseId, baseHeight: NaN }).baseHeight).toBe(initial.baseHeight)
})

it.each(['u-frame', 'v-pedestal'])('%s round-trips every supported shape through storage and shared URLs', (baseId) => {
  const base = getTableBase(baseId)
  for (const shape of base.compatibleShapes) {
    const assembly = normalizeTableAssembly({ baseId, shape, length: base.length.max, width: base.width.max, baseHeight: base.height.max, topFinish: 'marble-black-gold', baseFinish: 'metal-white-matte' })
    expect(assembly.baseId).toBe(baseId)
    const session = { ...createDefaultSession(), mode: 'builder' as const, assembly }
    expect(readSavedSession(JSON.stringify(session)).session.assembly).toEqual(assembly)
    const parsed = readSharedConfiguration(createConfigurationUrl('https://example.test', session))
    expect(parsed.status).toBe('valid')
    expect(parsed.assembly).toEqual(assembly)
  }
})

it('widens a V-pedestal ellipse for the mount and replaces U-frames for curved tops', () => {
  const start = normalizeTableAssembly({ baseId: 'v-pedestal', shape: 'rectangle', length: 1.2, width: 0.8 })
  const ellipse = updateTableAssembly(start, { shape: 'ellipse' })
  expect(ellipse.configuration.baseId).toBe('v-pedestal')
  expect(ellipse.configuration.width).toBe(0.9)
  expect(getTabletopWidthConfig(getTableBase('v-pedestal'), 'ellipse', 1.2)).toMatchObject({ min: 0.9, max: 1, base: 0.9 })
  expect(ellipse.notice).toBeTruthy()
  for (const shape of ['circle', 'ellipse', 'capsule'] as const) {
    const result = updateTableAssembly(normalizeTableAssembly({ baseId: 'u-frame' }), { shape })
    expect(result.configuration.baseId).toBe(shape === 'circle' ? 'round-fluted' : 'slat-pedestal')
    expect(result.notice).toContain('Для этой формы')
  }
})

it.each(TABLETOP_EDGE_PROFILES)('$id survives shape/base/material changes, storage and links, then resets to the previous bevel', ({ id }) => {
  let session = updateSession(createDefaultSession(), { type: 'set-mode', mode: 'builder' })
  session = updateSession(session, { type: 'update-assembly', patch: { edgeProfile: id, baseId: 'u-frame', thickness: 0.05 } })
  session = updateSession(session, { type: 'update-assembly', patch: { shape: 'ellipse', baseId: 'v-pedestal', topFinish: 'marble-white-gold' } })
  expect(session.assembly.edgeProfile).toBe(id)
  expect(readSavedSession(JSON.stringify(session)).session).toEqual(session)
  const shared = readSharedConfiguration(createConfigurationUrl('https://example.test', session))
  expect(shared.status).toBe('valid')
  expect(shared.assembly).toEqual(session.assembly)
  const catalog = session.models
  const reset = updateSession(session, { type: 'reset-model' })
  expect(reset.assembly.edgeProfile).toBe('bevel-1')
  expect(reset.models).toBe(catalog)
})

it('reads complete pre-v5 assembly links and storage without changing their appearance or raising an adjustment notice', () => {
  const old = { shape: 'circle', baseId: 'v-pedestal', length: 1.1, width: 1.1, thickness: 0.035, baseHeight: 0.743, topFinish: 'marble-white-gold', baseFinish: 'metal-black-matte' }
  const stored = readSavedSession(JSON.stringify({ version: 2, mode: 'builder', models: {}, selectedModelId: 'table-01', assembly: old }))
  expect(stored.notice).toBeNull()
  expect(stored.session.assembly).toEqual({ ...old, edgeProfile: 'bevel-1' })
  const url = new URL('https://example.test')
  url.searchParams.set('config', JSON.stringify({ version: 2, kind: 'table-assembly', assembly: old }))
  expect(readSharedConfiguration(url.href)).toEqual({ status: 'valid', assembly: { ...old, edgeProfile: 'bevel-1' } })
  // Добавление нового поля не делает частичную старую ссылку полной.
  url.searchParams.set('config', JSON.stringify({ version: 2, kind: 'table-assembly', assembly: { shape: 'circle' } }))
  expect(readSharedConfiguration(url.href).status).toBe('adjusted')
})

it.each(['unknown', '__proto__', null, 5, { id: 'bullnose' }])('replaces an invalid edge profile %j without losing other settings', (edgeProfile) => {
  const initial = normalizeTableAssembly({ baseId: 'u-frame', length: 1.4, baseHeight: 0.81 })
  const raw = { ...initial, edgeProfile }
  expect(normalizeTableAssembly(raw)).toEqual({ ...initial, edgeProfile: 'bevel-1' })
  const url = new URL('https://example.test')
  url.searchParams.set('config', JSON.stringify({ version: 2, kind: 'table-assembly', assembly: raw }))
  expect(readSharedConfiguration(url.href).status).toBe('adjusted')
})
