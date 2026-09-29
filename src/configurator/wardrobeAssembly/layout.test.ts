import { describe, expect, it } from 'vitest'
import { createDefaultWardrobe, createWardrobeSection, normalizeWardrobeAssembly, previewWardrobeSectionUpdate, updateWardrobeAssembly, wardrobeSectionNeedsConfirmation } from './state'
import { automaticLayout, fitWardrobeLayout, isValidWardrobeLayout, wardrobeLayoutAdjustments, wardrobeRodRange, wardrobeShelfRange, wardrobeShelfYs, wardrobeRodY, wardrobeManualShelfLimit } from './layout'

function manual(id = 'section-1') {
  return updateWardrobeAssembly(createDefaultWardrobe(), { type: 'set-layout-mode', id, manual: true })
}

describe('manual wardrobe filling positions', () => {
  it('keeps automatic legacy layouts unchanged until explicit opt-in and resets only positioning', () => {
    const before = createDefaultWardrobe(), section = before.sections[0]
    const automatic = wardrobeShelfYs(section)
    expect(section.layout).toBeUndefined()
    const edited = manual()
    expect(edited.sections[0].layout).toBeDefined()
    expect(edited.sections[0].shelves).toBe(section.shelves)
    expect(edited.sections[1]).toEqual(before.sections[1])
    let next = updateWardrobeAssembly(edited, { type: 'set-section-finish', id: section.id, slot: 'bodyFinish', finishId: 'oak-natural' })
    next = updateWardrobeAssembly(next, { type: 'set-layout-mode', id: section.id, manual: false })
    expect(next.sections[0].layout).toBeUndefined()
    expect(wardrobeShelfYs(next.sections[0])).toEqual(automatic)
    expect(next.sections[0].bodyFinish).toBe('oak-natural')
  })
  it('offers only feasible grid layouts across every height and filling preset, without silently removing shelves on opt-in', () => {
    for (let cm = 80; cm <= 280; cm += 10) for (const rod of [false, true]) for (let shelves = 0; shelves <= 6; shelves++) {
      const section = normalizeWardrobeAssembly({ sections: [{ height: cm / 100, shelves, rod }] }).sections[0]
      const layout = fitWardrobeLayout(section)
      const before = { ...createDefaultWardrobe(), sections: [section] }
      const after = updateWardrobeAssembly(before, { type: 'set-layout-mode', id: section.id, manual: true })
      expect(after.sections[0].shelves).toBe(section.shelves)
      if (layout) {
        expect(after.sections[0].layout).toEqual(layout)
        expect(isValidWardrobeLayout(section, layout)).toBe(true)
        expect(normalizeWardrobeAssembly(after)).toEqual(after)
      } else expect(after).toBe(before)
    }
    const packed = createWardrobeSection('section-1', 'shelves', { height: 1.4 })
    packed.shelves = 5
    expect(fitWardrobeLayout(packed)).toBeNull()
    expect(wardrobeManualShelfLimit(1.4, false)).toBe(4)
  })
  it('moves one shelf by 5 cm, preserving all others and rejecting off-grid, collision and invalid-index requests', () => {
    const config = manual(), before = config.sections[0], positions = before.layout!.shelves
    const range = wardrobeShelfRange(before, 1), height = range.max
    const changed = updateWardrobeAssembly(config, { type: 'move-shelf', id: before.id, index: 1, height })
    expect(changed.sections[0].layout!.shelves).toEqual(positions.map((y, i) => i === 1 ? height : y))
    expect(changed.sections[1]).toBe(config.sections[1])
    for (const bad of [range.min - .05, range.max + .05, range.min + .001, NaN, Infinity]) {
      expect(updateWardrobeAssembly(config, { type: 'move-shelf', id: before.id, index: 1, height: bad })).toBe(config)
    }
    for (const index of [-1, 1.5, 6, NaN]) expect(updateWardrobeAssembly(config, { type: 'move-shelf', id: before.id, index, height })).toBe(config)
    const automatic = createDefaultWardrobe()
    expect(updateWardrobeAssembly(automatic, { type: 'move-shelf', id: before.id, index: 1, height })).toBe(automatic)
  })
  it('limits rod and both hanging shelves against each other and the 120/60 cm restrictions', () => {
    let config = createDefaultWardrobe()
    config = updateWardrobeAssembly(config, { type: 'update-section', id: 'section-2', patch: { shelves: 2 } })
    config = updateWardrobeAssembly(config, { type: 'set-layout-mode', id: 'section-2', manual: true })
    const before = config.sections[1], range = wardrobeRodRange(before)
    const changed = updateWardrobeAssembly(config, { type: 'move-rod', id: before.id, height: range.min })
    expect(changed.sections[1].layout!.rod).toBeGreaterThanOrEqual(1.2)
    expect(changed.sections[1].layout!.shelves).toEqual(before.layout!.shelves)
    expect(updateWardrobeAssembly(config, { type: 'move-rod', id: before.id, height: 1.15 })).toBe(config)
    expect(updateWardrobeAssembly(config, { type: 'move-rod', id: before.id, height: range.max + .05 })).toBe(config)
    for (const index of [0, 1]) {
      const limit = wardrobeShelfRange(changed.sections[1], index)
      expect(updateWardrobeAssembly(changed, { type: 'move-shelf', id: before.id, index, height: index ? limit.max + .05 : limit.min - .05 })).toBe(changed)
    }
  })
  it('keeps absolute heights when dimensions grow and previews required moves/removals before shrinking', () => {
    const config = manual(), before = config.sections[0]
    const taller = updateWardrobeAssembly(config, { type: 'update-section', id: before.id, patch: { height: 2.8, width: .8, depth: .8 } })
    expect(taller.sections[0].layout).toEqual(before.layout)
    const preview = previewWardrobeSectionUpdate(before, { height: 1.8 })
    expect(preview.shelves).toBe(before.shelves)
    expect(wardrobeLayoutAdjustments(before, preview).length).toBeGreaterThan(0)
    expect(wardrobeSectionNeedsConfirmation(before, preview)).toBe(true)
    expect(updateWardrobeAssembly(config, { type: 'update-section', id: before.id, patch: { height: 1.8 } })).toBe(config)
    const accepted = updateWardrobeAssembly(config, { type: 'update-section', id: before.id, patch: { height: 1.8 }, confirmFillingChange: true })
    expect(accepted.sections[0]).toEqual(preview)
    const low = previewWardrobeSectionUpdate(before, { height: .8 })
    expect(low.shelves).toBeLessThan(before.shelves)
    expect(isValidWardrobeLayout(low, low.layout!)).toBe(true)
    expect(before.height).toBe(2.2)
  })
  it('confirms filling changes that move existing parts and preserves manual shelves when removing a rod', () => {
    let config = manual()
    const before = config.sections[0], next = previewWardrobeSectionUpdate(before, { rod: true })
    expect(wardrobeSectionNeedsConfirmation(before, next)).toBe(true)
    expect(updateWardrobeAssembly(config, { type: 'update-section', id: before.id, patch: { rod: true } })).toBe(config)
    config = updateWardrobeAssembly(config, { type: 'update-section', id: before.id, patch: { rod: true }, confirmFillingChange: true })
    expect(config.sections[0]).toEqual(next)
    const without = previewWardrobeSectionUpdate(next, { rod: false })
    expect(without.layout!.shelves).toEqual([...next.layout!.shelves].sort((a, b) => a - b))
    expect(without.layout).not.toHaveProperty('rod')
    expect(wardrobeLayoutAdjustments(next, without)).toEqual([])
  })
  it('normalizes malformed layouts, off-grid values and impossible positions without NaN or overlap', () => {
    for (const layout of [null, {}, [], { shelves: 'bad' }, { shelves: Array(100).fill(.5) }, { shelves: [NaN], rod: Infinity }, { shelves: [-100, 99, .81, .5] }, { shelves: [1e308, -1e308], rod: 1e308 }]) {
      for (const rod of [false, true]) {
        const config = normalizeWardrobeAssembly({ sections: [{ height: 1.6, shelves: 4, rod, layout }] })
        const section = config.sections[0]
        if (section.layout) expect(isValidWardrobeLayout(section, section.layout)).toBe(true)
        expect(wardrobeShelfYs(section).every(Number.isFinite)).toBe(true)
        expect(Number.isFinite(wardrobeRodY(section))).toBe(true)
        expect(normalizeWardrobeAssembly(config)).toEqual(config)
      }
    }
  })
  it('retains manual layout/materials by section ID through reorder and avoids copying them to new sections', () => {
    let config = manual('section-3')
    const before = config.sections[2].layout
    config = updateWardrobeAssembly(config, { type: 'set-section-finish', id: 'section-3', slot: 'bodyFinish', finishId: 'oak-natural' })
    config = updateWardrobeAssembly(config, { type: 'move-section', id: 'section-3', direction: -1 })
    expect(config.sections[1].layout).toEqual(before)
    expect(config.sections[1].bodyFinish).toBe('oak-natural')
    config = updateWardrobeAssembly(config, { type: 'add-section', preset: 'shelves' })
    expect(config.sections.at(-1)!.layout).toBeUndefined()
    expect(automaticLayout(config.sections.at(-1)!).shelves).toHaveLength(4)
  })
})
