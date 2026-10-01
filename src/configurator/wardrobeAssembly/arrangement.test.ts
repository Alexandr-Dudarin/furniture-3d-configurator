import { expect, it } from 'vitest'
import { createDefaultWardrobe, normalizeWardrobeAssembly, updateWardrobeAssembly, wardrobeAdjustmentNotice, wardrobeBounds, wardrobeClosedBounds } from './state'
import { placementPolygon, wardrobePlacement, wardrobeSectionCount } from './arrangement'
import { createConfigurationUrl, createDefaultSession, readSavedSession, readSharedConfiguration } from '../savedConfiguration'
import { getConfigurationSummary } from '../configurationSummary'
const corner = () => updateWardrobeAssembly(createDefaultWardrobe(), { type: 'set-arrangement', kind: 'l' })

it('preserves a straight configuration exactly and retains all section settings on both turns and return', () => {
  const straight = normalizeWardrobeAssembly({ sections: [{ width: .6, doors: { count: 1 }, facadeFinish: 'oak-black', drawers: { count: 2, height: .2 } }, { width: .8, bodyFinish: 'board-muted-green' }] })
  expect(straight.arrangement).toBeUndefined()
  let c = updateWardrobeAssembly(straight, { type: 'set-arrangement', kind: 'l' })
  expect(c.sections).toEqual(straight.sections)
  expect(wardrobeSectionCount(c)).toBe(3)
  c = updateWardrobeAssembly(c, { type: 'set-arrangement', kind: 'l', side: 'right' })
  expect(c.arrangement?.side).toBe('right')
  expect(updateWardrobeAssembly(c, { type: 'set-arrangement', kind: 'straight' })).toEqual(straight)
})
it('has a real corner between disjoint runs and mirrors placement without changing dimensions', () => {
  const left = corner(), right = updateWardrobeAssembly(left, { type: 'set-arrangement', kind: 'l', side: 'right' })
  const a = wardrobePlacement(left), b = wardrobePlacement(right)
  expect(a.bounds).toEqual(b.bounds)
  expect(a.bounds).toEqual({ width: 2.45, height: 2.2, depth: 1.65 })
  a.sections.forEach((p, i) => { expect(p.x).toBeCloseTo(-b.sections[i].x); expect(p.z).toBeCloseTo(b.sections[i].z) })
  const bounds = a.sections.map(p => { const points = placementPolygon(p); return { x0: Math.min(...points.map(p => p[0])), x1: Math.max(...points.map(p => p[0])), z0: Math.min(...points.map(p => p[1])), z1: Math.max(...points.map(p => p[1])) } })
  bounds.forEach((p, i) => bounds.slice(i + 1).forEach(q => expect(Math.min(Math.min(p.x1, q.x1) - Math.max(p.x0, q.x0), Math.min(p.z1, q.z1) - Math.max(p.z0, q.z0))).toBeLessThanOrEqual(1e-8)))
  expect(a.corner!.polygon).toHaveLength(5)
})
it('enforces 21 total including the corner on actions and imports, keeps each arm nonempty, and never silently truncates on return to straight', () => {
  let c = corner()
  for (let i = 0; i < 40; i++) c = updateWardrobeAssembly(c, { type: 'add-section', preset: 'empty', arm: i % 2 as 0 | 1 })
  expect(c.sections).toHaveLength(20); expect(wardrobeSectionCount(c)).toBe(21)
  expect(updateWardrobeAssembly(c, { type: 'add-section', preset: 'empty' })).toBe(c)
  expect(updateWardrobeAssembly(c, { type: 'set-arrangement', kind: 'straight' })).toBe(c)
  const imported = normalizeWardrobeAssembly({ ...c, sections: Array(100).fill(c.sections[0]) })
  expect(wardrobeSectionCount(imported)).toBe(21)
  expect(new Set(imported.sections.map(s => s.id)).size).toBe(20)
  expect(wardrobeAdjustmentNotice({ ...c, sections: Array(100).fill(c.sections[0]) }, imported)).toContain('21')
  c = updateWardrobeAssembly(c, { type: 'set-arm-count', count: -100 })
  expect(c.arrangement!.split).toBe(1)
  expect(updateWardrobeAssembly(c, { type: 'remove-section', id: c.sections[0].id })).toBe(c)
  c = updateWardrobeAssembly(c, { type: 'set-arm-count', count: 999 })
  expect(c.arrangement!.split).toBe(19)
  expect(updateWardrobeAssembly(c, { type: 'remove-section', id: c.sections.at(-1)!.id })).toBe(c)
})
it('adds to the chosen arm and preserves identity, overrides and filling when moving across the boundary', () => {
  let c = corner()
  const originalB = c.sections.at(-1)!.id
  c = updateWardrobeAssembly(c, { type: 'add-section', preset: 'hanging', arm: 0 })
  expect(c.arrangement!.split).toBe(3); expect(c.sections.at(-1)!.id).toBe(originalB)
  const added = c.sections[2]
  c = updateWardrobeAssembly(c, { type: 'move-section', id: added.id, direction: 1 })
  expect(c.sections[3]).toEqual(added)
  c = updateWardrobeAssembly(c, { type: 'remove-section', id: c.sections[0].id })
  expect(c.arrangement!.split).toBe(2)
})
it('normalizes corner dimensions/finishes, limits shelves, and confirms only a height edit that removes shelves', () => {
  let c = corner()
  expect(updateWardrobeAssembly(c, { type: 'update-corner', patch: { height: .8 } })).toBe(c)
  c = updateWardrobeAssembly(c, { type: 'update-corner', patch: { height: .8 }, confirmFillingChange: true })
  expect(c.arrangement!.corner).toEqual({ height: .8, shelves: 2 })
  c = updateWardrobeAssembly(c, { type: 'update-corner', patch: { bodyFinish: 'oak-natural' } })
  expect(c.arrangement!.corner.bodyFinish).toBe('oak-natural')
  c = updateWardrobeAssembly(c, { type: 'update-corner', patch: { bodyFinish: undefined } })
  expect(c.arrangement!.corner.bodyFinish).toBeUndefined()
  const invalid = normalizeWardrobeAssembly({ ...c, arrangement: { kind: 'l', side: 'invalid', split: NaN, corner: { height: 300, shelves: 100, bodyFinish: 'metal-black-matte' } } })
  expect(invalid.arrangement).toEqual({ kind: 'l', side: 'left', split: 2, corner: { height: 2.8, shelves: 6 } })
})
it('roundtrips the maximum configured assembly in storage and links and describes arm and corner materials', () => {
  const wardrobe = normalizeWardrobeAssembly({ ...corner(), sections: Array.from({ length: 20 }, (_, i) => ({ id: `section-${i + 1}`, width: 1, height: 2.8, depth: .8, shelves: 2, rod: true, drawers: { count: 2, height: .3, facadeStyle: 'fluted-wide', handle: 'edge-pull' }, doors: { count: 2, handle: 'profile', facadeStyle: 'frame', finish: 'oak-black' }, bodyFinish: 'board-muted-green', facadeFinish: 'board-white-matte', hardwareFinish: 'metal-brass-satin' })), arrangement: { kind: 'l', side: 'right', split: 10, corner: { height: 2.8, shelves: 6, bodyFinish: 'oak-natural' } } })
  const session = { ...createDefaultSession(), mode: 'wardrobe' as const, wardrobe }
  expect(readSavedSession(JSON.stringify(session))).toEqual({ session, notice: null })
  const url = createConfigurationUrl('https://example.test/', session)
  expect(new URL(url).searchParams.get('config')!.length).toBeLessThan(16000)
  expect(readSharedConfiguration(url)).toEqual({ status: 'valid', wardrobe })
  const rows = getConfigurationSummary(session).rows
  expect(rows.find(r => r.label === 'Компоновка')!.value).toContain('21')
  expect(rows.find(r => r.label === 'Угловой модуль')!.value).toContain('Дуб натуральный')
  expect(rows.find(r => r.label === 'Секция 11')!.value).toContain('Сторона Б')
  expect(wardrobeClosedBounds(wardrobe).height).toBe(wardrobeBounds(wardrobe).height)
})
