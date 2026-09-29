import { describe, expect, it } from 'vitest'
import { BODY_FINISHES, HARDWARE_FINISHES, MAX_SECTIONS, createDefaultWardrobe, createWardrobeSection, normalizeWardrobeAssembly, previewWardrobeSectionUpdate, updateWardrobeAssembly, wardrobeBounds, wardrobeHeightNeedsConfirmation, wardrobeSectionFinish } from './state'
import { getMaterialFinish } from '../../three/materials/materialRegistry'

describe('straight wardrobe assembly state', () => {
  it('starts with three independent sections and registered finishes', () => {
    const config = createDefaultWardrobe()
    expect(wardrobeBounds(config)).toEqual({ width: 2, height: 2.2, depth: .55 })
    expect(config.sections.map(s => [s.shelves, s.rod])).toEqual([[4, false], [1, true], [4, false]])
    expect(config.bodyFinish).toBe('board-grey-neutral')
    for (const id of [...BODY_FINISHES, ...HARDWARE_FINISHES]) expect(getMaterialFinish(id).id).toBe(id)
    expect(normalizeWardrobeAssembly(config)).toEqual(config)
  })
  it('snaps width/depth to 5 cm and height to 10 cm and clamps untrusted data', () => {
    const config = normalizeWardrobeAssembly({ sections: [
      { id: 'section-1', width: .673, height: 2.243, depth: .523, shelves: 30, rod: false },
      { id: 'section-1', width: -10, height: 99, depth: Infinity, shelves: -20, rod: true },
      { id: '__proto__', width: NaN, height: '2.2', depth: .1, shelves: 3, rod: true },
    ], bodyFinish: '__proto__', hardwareFinish: 'oak-natural' })
    expect(config.sections[0]).toMatchObject({ width: .65, height: 2.2, depth: .5, shelves: 6 })
    expect(config.sections[1]).toMatchObject({ width: .4, height: 2.8, depth: .55, shelves: 0 })
    expect(config.sections[2]).toMatchObject({ width: .6, height: 2.2, depth: .4, shelves: 2 })
    expect(new Set(config.sections.map(s => s.id)).size).toBe(3)
    expect(config.bodyFinish).toBe('board-grey-neutral'); expect(config.hardwareFinish).toBe('metal-black-matte')
    expect(normalizeWardrobeAssembly({ sections: Array(100).fill({}) }).sections).toHaveLength(MAX_SECTIONS)
    expect(normalizeWardrobeAssembly({ sections: [] })).toEqual(createDefaultWardrobe())
  })
  it('adds inherited height/depth, preserves IDs when reordered, and keeps one section', () => {
    let config = createDefaultWardrobe()
    config = updateWardrobeAssembly(config, { type: 'update-section', id: 'section-3', patch: { height: 2.5, depth: .45 } })
    config = updateWardrobeAssembly(config, { type: 'add-section', preset: 'hanging' })
    const added = config.sections[3]
    expect(added).toMatchObject({ id: 'section-4', height: 2.5, depth: .45, rod: true, shelves: 1 })
    config = updateWardrobeAssembly(config, { type: 'move-section', id: added.id, direction: -1 })
    expect(config.sections[2]).toBe(added)
    while (config.sections.length > 1) config = updateWardrobeAssembly(config, { type: 'remove-section', id: config.sections[0].id })
    expect(updateWardrobeAssembly(config, { type: 'remove-section', id: config.sections[0].id })).toBe(config)
    for (let i = 0; i < 8; i++) config = updateWardrobeAssembly(config, { type: 'add-section', preset: 'empty' })
    expect(config.sections).toHaveLength(6)
    expect(updateWardrobeAssembly(config, { type: 'add-section', preset: 'shelves' })).toBe(config)
    expect(updateWardrobeAssembly(config, { type: 'move-section', id: 'missing', direction: 1 })).toBe(config)
  })
  it('keeps hanging space clear and isolates edits to the chosen section', () => {
    const initial = createDefaultWardrobe()
    const next = updateWardrobeAssembly(initial, { type: 'update-section', id: 'section-1', patch: { rod: true } })
    expect(next.sections[0].shelves).toBe(1)
    expect(next.sections[1]).toBe(initial.sections[1])
    expect(initial.sections[0].shelves).toBe(4)
    expect(createWardrobeSection('section-5', 'empty')).toMatchObject({ shelves: 0, rod: false })
    expect(updateWardrobeAssembly(next, { type: 'set-wardrobe-finish', slot: 'bodyFinish', finishId: 'missing' })).toBe(next)
  })
  it('limits filling when shrinking sections and does not silently restore removed shelves', () => {
    let config = createDefaultWardrobe()
    config = updateWardrobeAssembly(config, { type: 'update-section', id: 'section-2', patch: { shelves: 2 } })
    expect(config.sections[1].shelves).toBe(2)
    config = updateWardrobeAssembly(config, { type: 'update-section', id: 'section-2', patch: { height: 1.5 }, confirmHeightChange: true })
    expect(config.sections[1].shelves).toBe(0)
    config = updateWardrobeAssembly(config, { type: 'update-section', id: 'section-2', patch: { height: .8 }, confirmHeightChange: true })
    expect(config.sections[1]).toMatchObject({ height: .8, rod: false, shelves: 0 })
    config = updateWardrobeAssembly(config, { type: 'update-section', id: 'section-2', patch: { height: 2.8, depth: .8 } })
    expect(config.sections[1]).toMatchObject({ height: 2.8, depth: .8, shelves: 0 })
    expect(createWardrobeSection('section-4', 'shelves', { height: .8 }).shelves).toBe(2)
  })
  it('waits for explicit confirmation before removing a rod or shelves, with a pure cancellable preview', () => {
    const config = createDefaultWardrobe(), current = config.sections[1]
    const preview = previewWardrobeSectionUpdate(current, { height: 1.4 })
    expect(preview).toMatchObject({ height: 1.4, rod: false, shelves: 1 })
    expect(wardrobeHeightNeedsConfirmation(current, preview)).toBe(true)
    expect(current).toMatchObject({ height: 2.2, rod: true, shelves: 1 })
    expect(updateWardrobeAssembly(config, { type: 'update-section', id: current.id, patch: { height: 1.4 } })).toBe(config)
    const accepted = updateWardrobeAssembly(config, { type: 'update-section', id: current.id, patch: { height: 1.4 }, confirmHeightChange: true })
    expect(accepted.sections[1]).toEqual(preview)
    expect(accepted.sections[0]).toBe(config.sections[0])
    const taller = updateWardrobeAssembly(accepted, { type: 'update-section', id: current.id, patch: { height: 2.2 } })
    expect(taller.sections[1].rod).toBe(false)
    expect(updateWardrobeAssembly(config, { type: 'update-section', id: 'section-1', patch: { height: .8 } })).toBe(config)
    expect(wardrobeHeightNeedsConfirmation(current, previewWardrobeSectionUpdate(current, { height: 1.6 }))).toBe(false)
  })
  it('rejects rods below 150 cm without dropping existing shelves and creates a valid new hanging section', () => {
    const low = createWardrobeSection('section-1', 'shelves', { height: 1.4 })
    const config = { ...createDefaultWardrobe(), sections: [low] }
    expect(updateWardrobeAssembly(config, { type: 'update-section', id: low.id, patch: { rod: true } })).toBe(config)
    const added = updateWardrobeAssembly(config, { type: 'add-section', preset: 'hanging' })
    expect(added.sections[1]).toMatchObject({ height: 1.5, rod: true, shelves: 0 })
    expect(added.sections[0]).toBe(low)
    for (const height of [.8, 1, 1.4]) {
      expect(normalizeWardrobeAssembly({ sections: [{ height, rod: true, shelves: 1 }] }).sections[0]).toMatchObject({ height, rod: false, shelves: 1 })
    }
  })
})

it('inherits each finish live while preserving explicit choices, even when equal to the common finish', () => {
  const initial = createDefaultWardrobe()
  let config = updateWardrobeAssembly(initial, { type: 'set-section-finish', id: 'section-1', slot: 'bodyFinish', finishId: initial.bodyFinish })
  config = updateWardrobeAssembly(config, { type: 'set-section-finish', id: 'section-2', slot: 'hardwareFinish', finishId: 'metal-brass-satin' })
  config = updateWardrobeAssembly(config, { type: 'set-wardrobe-finish', slot: 'bodyFinish', finishId: 'oak-natural' })
  config = updateWardrobeAssembly(config, { type: 'set-wardrobe-finish', slot: 'hardwareFinish', finishId: 'metal-white-matte' })
  expect(wardrobeSectionFinish(config, config.sections[0], 'bodyFinish')).toBe('board-grey-neutral')
  expect(wardrobeSectionFinish(config, config.sections[1], 'bodyFinish')).toBe('oak-natural')
  expect(wardrobeSectionFinish(config, config.sections[1], 'hardwareFinish')).toBe('metal-brass-satin')
  expect(config.sections[2]).toBe(initial.sections[2])
  config = updateWardrobeAssembly(config, { type: 'set-section-finish', id: 'section-1', slot: 'bodyFinish', finishId: null })
  expect(config.sections[0]).not.toHaveProperty('bodyFinish')
  expect(wardrobeSectionFinish(config, config.sections[0], 'bodyFinish')).toBe('oak-natural')
  expect(config.sections[1].hardwareFinish).toBe('metal-brass-satin')
})
it('keeps section finishes with their ID through reorder, dimensions and filling changes; new sections inherit', () => {
  let config = createDefaultWardrobe()
  config = updateWardrobeAssembly(config, { type: 'set-section-finish', id: 'section-2', slot: 'bodyFinish', finishId: 'oak-black' })
  config = updateWardrobeAssembly(config, { type: 'set-section-finish', id: 'section-2', slot: 'hardwareFinish', finishId: 'metal-brass-satin' })
  config = updateWardrobeAssembly(config, { type: 'move-section', id: 'section-2', direction: 1 })
  config = updateWardrobeAssembly(config, { type: 'update-section', id: 'section-2', patch: { width: .9, height: 1.4, depth: .8 }, confirmHeightChange: true })
  expect(config.sections[2]).toMatchObject({ id: 'section-2', bodyFinish: 'oak-black', hardwareFinish: 'metal-brass-satin', rod: false })
  config = updateWardrobeAssembly(config, { type: 'add-section', preset: 'hanging' })
  expect(config.sections[3]).not.toHaveProperty('bodyFinish')
  expect(config.sections[3]).not.toHaveProperty('hardwareFinish')
  config = updateWardrobeAssembly(config, { type: 'update-section', id: 'section-2', patch: { height: 2, rod: true } })
  expect(config.sections[2].hardwareFinish).toBe('metal-brass-satin')
  const other = config.sections[3]
  config = updateWardrobeAssembly(config, { type: 'remove-section', id: 'section-2' })
  expect(config.sections[2]).toBe(other)
})
it('rejects wrong-slot and unknown finishes and normalizes invalid section overrides to inheritance', () => {
  const config = createDefaultWardrobe()
  for (const finishId of ['metal-black-matte', 'missing', '__proto__']) {
    expect(updateWardrobeAssembly(config, { type: 'set-section-finish', id: 'section-1', slot: 'bodyFinish', finishId })).toBe(config)
  }
  expect(updateWardrobeAssembly(config, { type: 'set-section-finish', id: 'missing', slot: 'bodyFinish', finishId: 'oak-natural' })).toBe(config)
  expect(updateWardrobeAssembly(config, { type: 'set-section-finish', id: 'section-1', slot: 'bodyFinish', finishId: null })).toBe(config)
  for (const invalid of ['missing', 'metal-black-matte', 42, {}, false, null]) {
    const normalized = normalizeWardrobeAssembly({ ...config, sections: [{ ...config.sections[0], bodyFinish: invalid, hardwareFinish: 'oak-natural' }] })
    expect(normalized.sections[0]).not.toHaveProperty('bodyFinish')
    expect(normalized.sections[0]).not.toHaveProperty('hardwareFinish')
    expect(normalizeWardrobeAssembly(normalized)).toEqual(normalized)
  }
})
