import { expect, it } from 'vitest'
import { createDefaultWardrobe, normalizeWardrobeAssembly, updateWardrobeAssembly, wardrobeAdjustmentNotice, wardrobeAisleWidth } from './state'
import { wardrobeArmRanges, wardrobePlacement, wardrobeSectionCount, placementPolygon, type WardrobeArm } from './arrangement'
import { createConfigurationUrl, createDefaultSession, readSavedSession, readSharedConfiguration } from '../savedConfiguration'
import { getConfigurationSummary } from '../configurationSummary'

const u = () => updateWardrobeAssembly(createDefaultWardrobe(), { type: 'set-arrangement', kind: 'u' })
const counts = (c: ReturnType<typeof u>) => wardrobeArmRanges(c).map(r => r.end - r.start)

it('switches straight/L/U without changing any ordinary section and requires room for two corners', () => {
  const straight = createDefaultWardrobe(), corner = updateWardrobeAssembly(straight, { type: 'set-arrangement', kind: 'l', side: 'right' })
  const config = updateWardrobeAssembly(corner, { type: 'set-arrangement', kind: 'u' })
  expect(counts(config)).toEqual([1, 1, 1]); expect(wardrobeSectionCount(config)).toBe(5)
  expect(config.sections).toEqual(straight.sections)
  expect(updateWardrobeAssembly(config, { type: 'set-arrangement', kind: 'straight' })).toEqual(straight)
  expect(updateWardrobeAssembly(config, { type: 'set-arrangement', kind: 'l' }).sections).toEqual(straight.sections)
  const short = normalizeWardrobeAssembly({ sections: [{}, {}] })
  expect(updateWardrobeAssembly(short, { type: 'set-arrangement', kind: 'u' })).toBe(short)
  const fullL = normalizeWardrobeAssembly({ arrangement: { kind: 'l' }, sections: Array(20).fill({}) })
  expect(updateWardrobeAssembly(fullL, { type: 'set-arrangement', kind: 'u' })).toBe(fullL)
})
it('adds/removes on all three arms, never removes their last section, and preserves IDs/settings at boundaries', () => {
  let c = u()
  for (const arm of [0, 1, 2] as const) c = updateWardrobeAssembly(c, { type: 'add-section', preset: 'empty', arm })
  expect(counts(c)).toEqual([2, 2, 2])
  expect(c.sections.map(s => s.id)).toEqual(['section-1', 'section-4', 'section-2', 'section-5', 'section-3', 'section-6'])
  c = updateWardrobeAssembly(c, { type: 'set-arm-count', arm: 0, count: 3 })
  expect(counts(c)).toEqual([3, 2, 1])
  c = updateWardrobeAssembly(c, { type: 'set-arm-count', arm: 1, count: -999 })
  expect(counts(c)).toEqual([3, 1, 2])
  const selected = c.sections[3]
  c = updateWardrobeAssembly(c, { type: 'move-section', id: selected.id, direction: 1 })
  expect(c.sections[4]).toEqual(selected)
  for (const arm of [0, 1, 2] as const) {
    while (counts(c)[arm] > 1) c = updateWardrobeAssembly(c, { type: 'remove-section', id: c.sections[wardrobeArmRanges(c)[arm].start].id })
    expect(updateWardrobeAssembly(c, { type: 'remove-section', id: c.sections[wardrobeArmRanges(c)[arm].start].id })).toBe(c)
  }
  expect(counts(c)).toEqual([1, 1, 1])
})
it('normalizes hostile imports and enforces 21 including BOTH corners without truncating live shape changes', () => {
  let c = u()
  for (let i = 0; i < 45; i++) c = updateWardrobeAssembly(c, { type: 'add-section', preset: 'shelves', arm: (i % 3) as WardrobeArm })
  expect(c.sections).toHaveLength(19); expect(wardrobeSectionCount(c)).toBe(21)
  expect(updateWardrobeAssembly(c, { type: 'add-section', preset: 'empty' })).toBe(c)
  expect(updateWardrobeAssembly(c, { type: 'set-arrangement', kind: 'straight' })).toBe(c)
  const input = { ...c, sections: Array(50).fill(c.sections[0]), arrangement: { kind: 'u', split: Infinity, secondSplit: -100, corner: { height: 99 }, secondCorner: { height: -.8, shelves: 999, bodyFinish: 'invalid' } } }
  const normalized = normalizeWardrobeAssembly(input)
  expect(wardrobeSectionCount(normalized)).toBe(21)
  expect(counts(normalized).every(n => n >= 1)).toBe(true)
  expect(new Set(normalized.sections.map(s => s.id)).size).toBe(19)
  expect(normalized.arrangement).toMatchObject({ kind: 'u', corner: { height: 2.8 }, secondCorner: { height: .8, shelves: 2 } })
  expect(wardrobeAdjustmentNotice(input, normalized)).toContain('21')
})
it('edits corner height/shelves/material independently and only confirms removal of shelves', () => {
  let c = u(), left = c.arrangement!.corner
  expect(updateWardrobeAssembly(c, { type: 'update-corner', cornerId: 'corner-2', patch: { height: .8 } })).toBe(c)
  c = updateWardrobeAssembly(c, { type: 'update-corner', cornerId: 'corner-2', patch: { height: .8, bodyFinish: 'oak-natural' }, confirmFillingChange: true })
  expect(c.arrangement).toMatchObject({ corner: left, secondCorner: { height: .8, shelves: 2, bodyFinish: 'oak-natural' } })
  c = updateWardrobeAssembly(c, { type: 'update-corner', cornerId: 'corner-2', patch: { bodyFinish: undefined } })
  expect(c.arrangement).toMatchObject({ secondCorner: { height: .8, shelves: 2 } })
  left = c.arrangement!.corner
  c = updateWardrobeAssembly(c, { type: 'update-corner', patch: { bodyFinish: 'oak-black' } })
  expect(c.arrangement!.corner).toEqual({ ...left, bodyFinish: 'oak-black' })
})
it('places three disjoint inward-facing runs, fits two joined corners and accounts for closed handles in the aisle', () => {
  const c = normalizeWardrobeAssembly({ arrangement: { kind: 'u', split: 2, secondSplit: 4 }, sections: [
    { width: .4, depth: .4 }, { width: 1, depth: .6 },
    { width: .6, depth: .8, doors: { count: 1, handle: 'profile' } }, { width: .8, depth: .4 },
    { width: 1, depth: .65, drawers: { count: 1, placement: 'flush', handle: 'edge-pull' } },
  ] })
  const layout = wardrobePlacement(c)
  expect(layout.bounds.width).toBeCloseTo(3.85); expect(layout.bounds.depth).toBeCloseTo(2.5)
  expect(layout.corners).toHaveLength(2)
  expect(layout.corners.map(p => p.id)).toEqual(['corner-1', 'corner-2'])
  expect(layout.corners[0].origin[0]).toBeCloseTo(-layout.bounds.width / 2)
  expect(layout.corners[1].origin[0]).toBeCloseTo(layout.bounds.width / 2)
  expect(layout.sections.map(p => p.yaw)).toEqual([0, 0, Math.PI / 2, Math.PI / 2, -Math.PI / 2])
  const rects = [...layout.corners.map(p => p.polygon), ...layout.sections.map(p => placementPolygon(p))].map(poly => ({ x0: Math.min(...poly.map(p => p[0])), x1: Math.max(...poly.map(p => p[0])), z0: Math.min(...poly.map(p => p[1])), z1: Math.max(...poly.map(p => p[1])) }))
  rects.forEach((a, i) => rects.slice(i + 1).forEach(b => expect(Math.min(Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0), Math.min(a.z1, b.z1) - Math.max(a.z0, b.z0))).toBeLessThanOrEqual(1e-8)))
  expect(wardrobeAisleWidth(c)).toBeGreaterThan(2.2); expect(wardrobeAisleWidth(c)).toBeLessThan(2.4)
  expect(wardrobeAisleWidth(createDefaultWardrobe())).toBeNull()
})
it('roundtrips a fully configured 21-section U in storage/URL and describes both corners, all arms and aisle', () => {
  const wardrobe = normalizeWardrobeAssembly({ arrangement: { kind: 'u', split: 7, secondSplit: 13, corner: { height: 2.8, shelves: 6, bodyFinish: 'oak-natural' }, secondCorner: { height: .8, shelves: 2, bodyFinish: 'board-muted-green' } },
    sections: Array.from({ length: 19 }, (_, i) => ({ id: `section-${i + 1}`, width: 1, height: 2.8, depth: .8, shelves: 2, rod: true, drawers: { count: 2, height: .3, facadeStyle: 'fluted-wide', handle: 'edge-pull' }, doors: { count: 2, handle: 'profile', facadeStyle: 'frame', finish: 'oak-black' }, bodyFinish: 'board-muted-green', facadeFinish: 'board-white-matte', hardwareFinish: 'metal-brass-satin' })) })
  const session = { ...createDefaultSession(), mode: 'wardrobe' as const, wardrobe }
  expect(readSavedSession(JSON.stringify(session))).toEqual({ session, notice: null })
  const url = createConfigurationUrl('https://example.test/', session)
  expect(new URL(url).searchParams.get('config')!.length).toBeLessThan(16000)
  expect(readSharedConfiguration(url)).toEqual({ status: 'valid', wardrobe })
  const rows = getConfigurationSummary(session).rows
  expect(rows.find(r => r.label === 'Компоновка')!.value).toContain('21')
  expect(rows.find(r => r.label === 'Угол 1: левый')!.value).toContain('Дуб натуральный')
  expect(rows.find(r => r.label === 'Угол 2: правый')!.value).toContain('Тёмно-зелёный')
  expect(rows.find(r => r.label === 'Секция 14')!.value).toContain('Сторона В')
  expect(rows.find(r => r.label.startsWith('Проход'))!.value).toContain('ручек')
})
