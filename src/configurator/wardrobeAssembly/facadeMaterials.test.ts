import { expect, it } from 'vitest'
import { normalizeWardrobeAssembly, updateWardrobeAssembly, wardrobeSectionFinish } from './state'
import { createDefaultSession, createConfigurationUrl, readSharedConfiguration, readSavedSession, updateSession } from '../savedConfiguration'
import { getConfigurationSummary } from '../configurationSummary'

const original = () => normalizeWardrobeAssembly({ bodyFinish: 'oak-natural', sections: [
  { id: 'section-1', bodyFinish: 'board-muted-green', doors: { count: 1, finish: 'oak-black' }, drawers: { count: 2, height: .2 } },
  { id: 'section-2', doors: { count: 2 }, drawers: { count: 2, height: .2 } },
] })

it('preserves legacy live inheritance and keeps a separate facade finish when the body changes', () => {
  const old = original()
  expect(old).not.toHaveProperty('facadeFinish')
  expect(wardrobeSectionFinish(old, old.sections[0], 'facadeFinish')).toBe('board-muted-green')
  expect(wardrobeSectionFinish(old, old.sections[1], 'facadeFinish')).toBe('oak-natural')
  let next = updateWardrobeAssembly(old, { type: 'set-wardrobe-finish', slot: 'facadeFinish', finishId: 'board-white-matte' })
  next = updateWardrobeAssembly(next, { type: 'set-wardrobe-finish', slot: 'bodyFinish', finishId: 'oak-grey' })
  for (const s of next.sections) expect(wardrobeSectionFinish(next, s, 'facadeFinish')).toBe('board-white-matte')
  expect(wardrobeSectionFinish(next, next.sections[0], 'bodyFinish')).toBe('board-muted-green')
  expect(wardrobeSectionFinish(next, next.sections[1], 'bodyFinish')).toBe('oak-grey')
  expect(next.sections[0].doors?.finish).toBe('oak-black')
  expect(old.bodyFinish).toBe('oak-natural')
})

it('retains section overrides through global changes, reorder and reset to live inheritance', () => {
  let c = updateWardrobeAssembly(original(), { type: 'set-section-finish', id: 'section-1', slot: 'facadeFinish', finishId: 'board-powder-beige' })
  c = updateWardrobeAssembly(c, { type: 'set-wardrobe-finish', slot: 'facadeFinish', finishId: 'board-white-matte' })
  c = updateWardrobeAssembly(c, { type: 'move-section', id: 'section-1', direction: 1 })
  expect(c.sections[1].facadeFinish).toBe('board-powder-beige')
  c = updateWardrobeAssembly(c, { type: 'set-wardrobe-finish', slot: 'facadeFinish', finishId: null })
  expect(c).not.toHaveProperty('facadeFinish')
  expect(wardrobeSectionFinish(c, c.sections[1], 'facadeFinish')).toBe('board-powder-beige')
  c = updateWardrobeAssembly(c, { type: 'set-section-finish', id: 'section-1', slot: 'facadeFinish', finishId: null })
  expect(wardrobeSectionFinish(c, c.sections[1], 'facadeFinish')).toBe('board-muted-green')
  expect(c.sections[1].doors?.finish).toBe('oak-black')
  c = updateWardrobeAssembly(c, { type: 'add-section', preset: 'empty' })
  expect(c.sections[2]).not.toHaveProperty('facadeFinish')
})

it('rejects unavailable and hardware finishes for facades on imports and actions', () => {
  const old = original()
  for (const bad of ['metal-brass-satin', 'unknown', '', '__proto__']) {
    expect(updateWardrobeAssembly(old, { type: 'set-wardrobe-finish', slot: 'facadeFinish', finishId: bad })).toBe(old)
    expect(updateWardrobeAssembly(old, { type: 'set-section-finish', id: 'section-1', slot: 'facadeFinish', finishId: bad })).toBe(old)
    const imported = normalizeWardrobeAssembly({ ...old, facadeFinish: bad, sections: old.sections.map(s => ({ ...s, facadeFinish: bad })) })
    expect(imported).toEqual(old)
  }
})

it('roundtrips all finish levels and their absence in storage and URLs; summary reports actual doors and drawers', () => {
  const wardrobe = normalizeWardrobeAssembly({ ...original(), facadeFinish: 'board-white-matte', sections: original().sections.map((s, i) => i ? s : { ...s, facadeFinish: 'board-powder-beige' }) })
  const session = { ...createDefaultSession(), mode: 'wardrobe' as const, wardrobe }
  expect(readSavedSession(JSON.stringify(session))).toEqual({ session, notice: null })
  expect(readSharedConfiguration(createConfigurationUrl('https://example.test/', session))).toEqual({ status: 'valid', wardrobe })
  const rows = getConfigurationSummary(session).rows
  expect(rows.find(r => r.label === 'Секция 1: материал дверей')?.value).toContain('Чёрный дуб')
  expect(rows.find(r => r.label === 'Секция 1: материал фасадов ящиков')?.value).toContain('Пудрово-бежевый')
  expect(rows.find(r => r.label === 'Секция 2: материал дверей')?.value).toContain('Белый матовый')
  expect(updateSession(session, { type: 'reset-model' }).wardrobe).not.toHaveProperty('facadeFinish')
  const legacy = { ...session, wardrobe: original() }
  expect(readSavedSession(JSON.stringify(legacy))).toEqual({ session: legacy, notice: null })
})
