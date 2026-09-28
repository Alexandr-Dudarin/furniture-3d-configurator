import { describe, expect, it } from 'vitest'
import { BODY_FINISHES, HARDWARE_FINISHES, MAX_SECTIONS, createDefaultWardrobe, createWardrobeSection, normalizeWardrobeAssembly, updateWardrobeAssembly, wardrobeBounds } from './state'
import { getMaterialFinish } from '../../three/materials/materialRegistry'

describe('straight wardrobe assembly state', () => {
  it('starts with three independent sections and registered finishes', () => {
    const config = createDefaultWardrobe()
    expect(wardrobeBounds(config)).toEqual({ width: 2, height: 2.2, depth: .55 })
    expect(config.sections.map(s => [s.shelves, s.rod])).toEqual([[4, false], [1, true], [4, false]])
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
    expect(config.sections[1]).toMatchObject({ width: .4, height: 2.6, depth: .55, shelves: 0 })
    expect(config.sections[2]).toMatchObject({ width: .6, height: 2.2, depth: .4, shelves: 1 })
    expect(new Set(config.sections.map(s => s.id)).size).toBe(3)
    expect(config.bodyFinish).toBe('oak-natural'); expect(config.hardwareFinish).toBe('metal-black-matte')
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
})
