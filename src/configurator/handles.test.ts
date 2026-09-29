import { expect, it } from 'vitest'
import { CATALOG_HANDLES, DOOR_HANDLES } from './handles'
import { getFurnitureDefinitions } from './furnitureRegistry'
import { createDefaultSession, updateSession, readSavedSession, readSharedConfiguration, createConfigurationUrl, applySharedConfiguration } from './savedConfiguration'
import { getConfigurationSummary } from './configurationSummary'
import { MAX_SECTIONS, createDefaultWardrobe, updateWardrobeAssembly } from './wardrobeAssembly/state'

it.each(getFurnitureDefinitions().filter(d => d.handles))('$id roundtrips handles, independent doors/drawers, old defaults and reset', definition => {
  let s = updateSession(createDefaultSession(), { type: 'select-model', modelId: definition.id })
  expect(s.models[definition.id].handles).toBeUndefined()
  const old = s
  for (const option of CATALOG_HANDLES) {
    s = updateSession(s, { type: 'set-handles', kind: 'doors', value: option.value })
    if (definition.handles!.targets.some(t => t.kind === 'drawer')) s = updateSession(s, { type: 'set-handles', kind: 'drawers', value: 'profile' })
    s = updateSession(s, { type: 'set-material', slot: 'hardware', finishId: 'metal-brass-satin' })
    expect(readSavedSession(JSON.stringify(s)).session).toEqual(s)
    const read = readSharedConfiguration(createConfigurationUrl('https://example.test', s))
    expect(read.status).toBe('valid')
    expect(applySharedConfiguration(createDefaultSession(), read.configuration!).models[definition.id]).toEqual(s.models[definition.id])
    expect(getConfigurationSummary(s).rows).toContainEqual({ label: 'Ручки дверей', value: DOOR_HANDLES.find(o => o.value === option.value)!.label })
  }
  expect(updateSession(s, { type: 'reset-model' })).toEqual(old)
  expect(readSavedSession(JSON.stringify(old)).session).toEqual(old)
  const url = new URL(createConfigurationUrl('https://example.test', old)), data = JSON.parse(url.searchParams.get('config')!)
  data.handles = { doors: '__proto__', drawers: { nested: true } }; url.searchParams.set('config', JSON.stringify(data))
  const read = readSharedConfiguration(url.href)
  expect(read.status).toBe('adjusted'); expect(read.configuration?.handles).toBeUndefined()
})
it('allows exactly seven sections and rejects the eighth without mutation', () => {
  expect(MAX_SECTIONS).toBe(7)
  let c = createDefaultWardrobe()
  while (c.sections.length < 7) c = updateWardrobeAssembly(c, { type: 'add-section', preset: 'empty' })
  expect(c.sections).toHaveLength(7)
  expect(updateWardrobeAssembly(c, { type: 'add-section', preset: 'empty' })).toBe(c)
  const s = { ...createDefaultSession(), mode: 'wardrobe' as const, wardrobe: c }
  expect(readSharedConfiguration(createConfigurationUrl('https://example.test', s))).toEqual({ status: 'valid', wardrobe: c })
})
