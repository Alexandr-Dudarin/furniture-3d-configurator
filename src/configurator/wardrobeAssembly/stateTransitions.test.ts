import { expect, it } from 'vitest'
import {
  normalizeWardrobeAssembly,
  previewWardrobeSectionUpdate,
  updateWardrobeAssembly,
  wardrobeSectionFinish,
  type WardrobeAssemblyAction,
} from './state'

// Nested objects are frozen as well: a mutation must fail before it can corrupt
// the live scene, a pending confirmation or another subscriber's saved snapshot.
function freeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze)
    Object.freeze(value)
  }
  return value
}

function example() {
  return normalizeWardrobeAssembly({
    arrangement: { kind: 'u', split: 2, secondSplit: 4 },
    sections: [
      { id: 'section-1', shelves: 2, layout: { shelves: [0.55, 1.5] } },
      { id: 'section-2', shelves: 1, rod: true, layout: { shelves: [2.05], rod: 1.8 } },
      { id: 'section-3', shelves: 0, drawers: { count: 2, height: 0.25, placement: 'flush' } },
      { id: 'section-4', shelves: 2 },
      { id: 'section-5', shelves: 0 },
      { id: 'section-6', shelves: 0 },
    ],
  })
}

it('keeps earlier snapshots and untouched sections through a mixed editing session', () => {
  const actions: WardrobeAssemblyAction[] = [
    { type: 'set-wardrobe-finish', slot: 'facadeFinish', finishId: 'oak-black' },
    { type: 'set-section-finish', id: 'section-3', slot: 'facadeFinish', finishId: 'board-white-matte' },
    { type: 'update-section', id: 'section-3', patch: { width: 0.8 } },
    { type: 'set-layout-mode', id: 'section-4', manual: true },
    { type: 'move-shelf', id: 'section-1', index: 0, height: 0.6 },
    { type: 'move-rod', id: 'section-2', height: 1.7 },
    { type: 'update-corner', cornerId: 'corner-2', patch: { bodyFinish: 'oak-natural' } },
    { type: 'add-section', arm: 2, preset: 'empty' },
    { type: 'move-section', id: 'section-7', direction: -1 },
    { type: 'remove-section', id: 'section-7' },
    { type: 'set-arm-count', arm: 0, count: 3 },
    { type: 'set-arrangement', kind: 'l', side: 'right' },
  ]
  let current = freeze(example())
  for (const action of actions) {
    const before = JSON.stringify(current)
    const next = updateWardrobeAssembly(current, freeze(action))
    expect(next, action.type).not.toBe(current)
    expect(JSON.stringify(current), action.type).toBe(before)
    for (const section of current.sections) {
      if ('id' in action && action.id === section.id) continue
      expect(
        next.sections.find((item) => item.id === section.id),
        action.type,
      ).toBe(section)
    }
    current = freeze(next)
  }
  const drawers = current.sections.find((section) => section.id === 'section-3')!
  expect(drawers).toMatchObject({ width: 0.8, drawers: { count: 2, placement: 'flush' } })
  expect(wardrobeSectionFinish(current, drawers, 'facadeFinish')).toBe('board-white-matte')
  expect(current.arrangement).toMatchObject({ kind: 'l', side: 'right', split: 3 })
})

it('keeps the original snapshot when a door change still needs confirmation', () => {
  const current = freeze(example())
  const section = current.sections[2]
  const patch = freeze({
    doors: {
      count: 1 as const,
      hinge: 'left' as const,
      facadeStyle: 'frame' as const,
      handle: 'bar' as const,
    },
  })
  const preview = previewWardrobeSectionUpdate(section, patch)
  expect(preview.drawers?.placement).toBe('recessed')
  expect(section.drawers?.placement).toBe('flush')
  expect(updateWardrobeAssembly(current, { type: 'update-section', id: section.id, patch })).toBe(current)
  const accepted = updateWardrobeAssembly(current, {
    type: 'update-section',
    id: section.id,
    patch,
    confirmFillingChange: true,
  })
  expect(accepted.sections[2]).toEqual(preview)
  expect(current.sections[2]).toBe(section)
  expect(current.sections[2].doors).toBeUndefined()
})

it('copies manual positions only for the edited section and treats rejected moves as no-ops', () => {
  const current = freeze(example())
  const next = updateWardrobeAssembly(current, { type: 'move-shelf', id: 'section-1', index: 0, height: 0.6 })
  expect(next.sections[0].layout?.shelves).toEqual([0.6, 1.5])
  expect(current.sections[0].layout?.shelves).toEqual([0.55, 1.5])
  expect(next.sections[0].layout).not.toBe(current.sections[0].layout)
  expect(next.sections[1].layout).toBe(current.sections[1].layout)
  expect(
    updateWardrobeAssembly(current, { type: 'move-shelf', id: 'section-1', index: 0, height: 0.55 }),
  ).toBe(current)
  expect(updateWardrobeAssembly(current, { type: 'move-rod', id: 'section-2', height: 1.15 })).toBe(current)
  expect(
    updateWardrobeAssembly(current, { type: 'move-shelf', id: 'section-1', index: 0, height: 1.4 }),
  ).toBe(current)
})
