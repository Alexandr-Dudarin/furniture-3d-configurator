import { expect, it } from 'vitest'
import { normalizeWardrobeAssembly, previewWardrobeSectionUpdate, updateWardrobeAssembly, wardrobeSectionNeedsConfirmation, wardrobeLayoutAdjustments, isValidWardrobeLayout, wardrobeManualShelfLimit, wardrobeFreeSpaceBelow } from './state'
import { planWardrobeParts } from '../../three/wardrobeAssembly/wardrobeAssembly'

function example(height: number, shelves: number[], rod?: number) {
  return normalizeWardrobeAssembly({ sections: [{ id: 'section-1', height, width: .6, depth: .45,
    shelves: shelves.length, rod: rod !== undefined, layout: { shelves, ...(rod === undefined ? {} : { rod }) }, bodyFinish: 'oak-natural' }] })
}

it('reports the actual clear height between panel surfaces, including the bottom panel', () => {
  for (const positions of [[.3], [.5, 1, 1.6]]) {
    const config = example(2.8, positions), section = config.sections[0]
    const panels = planWardrobeParts(config).filter(p => /\/Bottom$|\/Shelf_/.test(p.name)).sort((a, b) => a.position[1] - b.position[1])
    positions.forEach((_, i) => {
      const lower = panels[i], upper = panels[i + 1]
      const physicalGap = upper.position[1] - upper.size[1] / 2 - (lower.position[1] + lower.size[1] / 2)
      expect(wardrobeFreeSpaceBelow(section, i)).toBeCloseTo(physicalGap, 8)
    })
  }
  const gap = wardrobeFreeSpaceBelow(example(2.8, [.3]).sections[0], 0)
  expect(gap).toBe(.214)
  expect(gap - .21).toBeCloseTo(.004, 8)
  expect(wardrobeFreeSpaceBelow(example(2.8, [.5, 1, 1.6]).sections[0], 2)).toBe(.584)
})

it('places a new rod under the existing high shelf without moving it or asking for confirmation', () => {
  for (const height of [2.2, 2.8]) for (const y of [1.85, 1.9, 1.95]) {
    const config = example(height, [y]), before = config.sections[0]
    const next = previewWardrobeSectionUpdate(before, { rod: true })
    expect(next.layout!.shelves).toEqual([y])
    expect(next.layout!.rod).toBeLessThan(y - .079999)
    expect(wardrobeSectionNeedsConfirmation(before, next)).toBe(false)
    expect(wardrobeLayoutAdjustments(before, next)).toEqual([])
    expect(updateWardrobeAssembly(config, { type: 'update-section', id: before.id, patch: { rod: true } }).sections[0]).toEqual(next)
    expect(next.bodyFinish).toBe('oak-natural')
  }
  const before = example(2.8, [2.2]).sections[0]
  expect(previewWardrobeSectionUpdate(before, { rod: true }).layout).toEqual({ shelves: [2.2], rod: 2.1 })
})

it('adds shelves below, above or between existing shelves without treating renumbering as movement', () => {
  for (const old of [[2.15, 2.45], [.3, .55], [.3, 2.55]]) {
    const config = example(2.8, old), before = config.sections[0]
    const next = previewWardrobeSectionUpdate(before, { shelves: 4 })
    expect(next.layout!.shelves).toHaveLength(4)
    old.forEach(y => expect(next.layout!.shelves).toContain(y))
    expect(wardrobeLayoutAdjustments(before, next)).toEqual([])
    expect(wardrobeSectionNeedsConfirmation(before, next)).toBe(false)
    expect(isValidWardrobeLayout(next, next.layout!)).toBe(true)
    if (old[0] === 2.15) expect(next.layout!.shelves.slice(0, 2).every(y => y < 2.15)).toBe(true)
    expect(updateWardrobeAssembly(config, { type: 'update-section', id: before.id, patch: { shelves: 4 } }).sections[0]).toEqual(next)
  }
})

it('reserves room for every requested shelf instead of blocking a later insertion by splitting a gap poorly', () => {
  const before = example(1.6, [1.35]).sections[0]
  const next = previewWardrobeSectionUpdate(before, { shelves: 5 })
  expect(next.layout!.shelves).toHaveLength(5)
  expect(next.layout!.shelves).toContain(1.35)
  expect(wardrobeSectionNeedsConfirmation(before, next)).toBe(false)
  expect(isValidWardrobeLayout(next, next.layout!)).toBe(true)
})

it('never moves an existing pair when an independent grid scan proves that all additions fit', () => {
  for (const height of [1.2, 1.6, 2.8]) {
    // All shelf coordinates are grid ticks. Panel + 20 cm clearance requires
    // five ticks between shelves. Floor/top bounds come from actual surfaces.
    const topTick = Math.floor((height - .032 - .2 + 1e-8) / .05)
    for (let a = 6; a <= topTick; a++) for (let b = a + 5; b <= topTick; b++) {
      const config = example(height, [a / 20, b / 20]), before = config.sections[0]
      let room = 0, last = -Infinity
      for (let tick = 6; tick <= topTick; tick++) {
        if (Math.abs(tick - a) < 5 || Math.abs(tick - b) < 5 || tick - last < 5) continue
        room++; last = tick
      }
      const count = Math.min(wardrobeManualShelfLimit(height, false), 2 + room)
      if (count <= 2) continue
      const next = previewWardrobeSectionUpdate(before, { shelves: count })
      expect(next.shelves).toBe(count)
      expect(next.layout!.shelves).toContain(a / 20)
      expect(next.layout!.shelves).toContain(b / 20)
      expect(isValidWardrobeLayout(next, next.layout!)).toBe(true)
      expect(wardrobeSectionNeedsConfirmation(before, next)).toBe(false)
    }
  }
})

it('still requires confirmation when the requested filling cannot fit around existing positions', () => {
  for (const [config, patch] of [[example(1.2, [.5, .85]), { shelves: 3 }], [example(2.2, [.9]), { rod: true }]] as const) {
    const before = config.sections[0], next = previewWardrobeSectionUpdate(before, patch)
    expect(wardrobeLayoutAdjustments(before, next).length).toBeGreaterThan(0)
    expect(wardrobeSectionNeedsConfirmation(before, next)).toBe(true)
    expect(updateWardrobeAssembly(config, { type: 'update-section', id: before.id, patch })).toBe(config)
    expect(updateWardrobeAssembly(config, { type: 'update-section', id: before.id, patch, confirmFillingChange: true }).sections[0]).toEqual(next)
    expect(isValidWardrobeLayout(next, next.layout!)).toBe(true)
  }
})

it('keeps an existing rod and upper shelf in place when adding a lower shelf', () => {
  for (const count of [1, 2]) {
    const before = example(2.2, count === 1 ? [] : [1.8], 1.6).sections[0]
    const next = previewWardrobeSectionUpdate(before, { shelves: count })
    expect(next.layout!.rod).toBe(1.6)
    before.layout!.shelves.forEach(y => expect(next.layout!.shelves).toContain(y))
    expect(wardrobeSectionNeedsConfirmation(before, next)).toBe(false)
    expect(isValidWardrobeLayout(next, next.layout!)).toBe(true)
  }
})

it('confirms implicit shelf removal on a rod preset switch, but not an explicit shelf count reduction', () => {
  const config = example(2.8, [2.15, 2.45]), before = config.sections[0]
  const next = previewWardrobeSectionUpdate(before, { rod: true })
  expect(next.layout!.shelves).toEqual([2.45])
  expect(wardrobeLayoutAdjustments(before, next)).toEqual([])
  expect(wardrobeSectionNeedsConfirmation(before, next)).toBe(true)
  expect(updateWardrobeAssembly(config, { type: 'update-section', id: before.id, patch: { rod: true } })).toBe(config)
  expect(wardrobeSectionNeedsConfirmation(before, previewWardrobeSectionUpdate(before, { shelves: 1 }))).toBe(false)
})
