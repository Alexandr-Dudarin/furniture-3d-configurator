import { expect, it, vi } from 'vitest'
import { automaticLayout, createDefaultWardrobe, isValidWardrobeLayout, normalizeWardrobeAssembly, PANEL_THICKNESS, previewWardrobeSectionUpdate, wardrobeFillingFloor, wardrobeFreeSpaceBelow, wardrobeSectionNeedsConfirmation, wardrobeShelfYs, wardrobeRodY, updateWardrobeAssembly } from './state'
import { CONFIGURATION_STORAGE_KEY, createDefaultSession, readSavedSession, readSharedConfiguration, createConfigurationUrl } from '../savedConfiguration'
import { createConfiguratorStore } from '../configuratorStore'
import { getConfigurationSummary } from '../configurationSummary'

const make = (section: object) => normalizeWardrobeAssembly({ sections: [{ id: 'section-1', height: 2.2, width: .6, depth: .55, shelves: 0, rod: false, ...section }] })
it('keeps existing upper shelves and rod when drawers fit underneath, with no confirmation', () => {
  const current = make({ shelves: 1, rod: true, layout: { shelves: [1.9], rod: 1.8 } }).sections[0]
  const next = previewWardrobeSectionUpdate(current, { drawers: { count: 2, height: .25 } })
  expect(next.layout).toEqual(current.layout)
  expect(wardrobeSectionNeedsConfirmation(current, next)).toBe(false)
  expect(wardrobeFillingFloor(next)).toBeCloseTo(.602)
  const shelves = make({ shelves: 2, layout: { shelves: [1.5, 1.9] } }).sections[0]
  expect(previewWardrobeSectionUpdate(shelves, { drawers: { count: 4, height: .2 } }).layout).toEqual(shelves.layout)
})
it('counts clear shelf space from the upper surface of the drawer lid', () => {
  const section = make({ drawers: { count: 2, height: .2 }, shelves: 2, layout: { shelves: [.75, 1.35] } }).sections[0]
  expect(wardrobeFreeSpaceBelow(section, 0)).toBeCloseTo(.248)
  expect(wardrobeFreeSpaceBelow(section, 1)).toBeCloseTo(.584)
})
it('preserves clearance for every height, row height and filling mode, including manual grid', () => {
  for (let cm = 80; cm <= 280; cm += 10) for (const height of [.2, .25, .3]) for (const rod of [false, true]) for (const shelves of [0, 2, 6]) for (const manual of [false, true]) {
    const section = make({ height: cm / 100, rod, shelves, drawers: { count: 4, height }, ...(manual ? { layout: { shelves: [1, 1.5, 2, 2.25, 2.5, 2.7], rod: 1.8 } } : {}) }).sections[0]
    expect(section.drawers!.count).toBeGreaterThan(0)
    const floor = wardrobeFillingFloor(section)
    const ys = wardrobeShelfYs(section).sort((a, b) => a - b)
    let below = floor
    for (const y of ys) {
      expect(y - PANEL_THICKNESS / 2 - below).toBeGreaterThanOrEqual(.2 - 1e-8)
      below = y + PANEL_THICKNESS / 2
    }
    expect(section.height - PANEL_THICKNESS - below).toBeGreaterThanOrEqual(.2 - 1e-8)
    if (section.rod) {
      const y = wardrobeRodY(section), layout = section.layout ?? automaticLayout(section)
      const lower = section.shelves >= 2 ? layout.shelves[1] + .016 : floor
      const upper = section.shelves >= 1 ? layout.shelves[0] : section.height - .016
      expect(y).toBeGreaterThanOrEqual(1.2)
      expect(y - .0125 - lower).toBeGreaterThanOrEqual(.6 - 1e-8)
      expect(upper - y).toBeGreaterThanOrEqual(.08 - 1e-8)
    }
    if (manual) { expect(section.layout).toBeDefined(); expect(isValidWardrobeLayout(section, section.layout!)).toBe(true) }
  }
})
it('requires confirmation for displaced shelves, implicit drawer removal and automatic filling moves', () => {
  const current = make({ shelves: 2, layout: { shelves: [.35, .85] } }).sections[0]
  const next = previewWardrobeSectionUpdate(current, { drawers: { count: 2, height: .25 } })
  expect(wardrobeSectionNeedsConfirmation(current, next)).toBe(true)
  expect(next.layout!.shelves[0]).toBeGreaterThan(.8)
  const auto = make({ shelves: 4 }).sections[0]
  expect(wardrobeSectionNeedsConfirmation(auto, previewWardrobeSectionUpdate(auto, { drawers: { count: 1, height: .2 } }))).toBe(true)
  const low = make({ height: .8, drawers: { count: 2, height: .2 } }).sections[0]
  const tallerRows = previewWardrobeSectionUpdate(low, { drawers: { count: 2, height: .3 } })
  expect(tallerRows.drawers!.count).toBe(1)
  expect(wardrobeSectionNeedsConfirmation(low, tallerRows)).toBe(true)
  const high = make({ drawers: { count: 4, height: .3 } }).sections[0]
  expect(wardrobeSectionNeedsConfirmation(high, previewWardrobeSectionUpdate(high, { height: .8 }))).toBe(true)
  const crowded = make({ height: 1.5, drawers: { count: 4, height: .3 } }).sections[0]
  expect(wardrobeSectionNeedsConfirmation(crowded, previewWardrobeSectionUpdate(crowded, { rod: true }))).toBe(true)
})
it('does not mutate session, saved data or URL before accepting drawer displacement', () => {
  const session = { ...createDefaultSession(), mode: 'wardrobe' as const, wardrobe: make({ shelves: 2, layout: { shelves: [.35, .85] } }) }
  const values = new Map([[CONFIGURATION_STORAGE_KEY, JSON.stringify(session)]])
  let href = createConfigurationUrl('https://example.test', session)
  const storage = vi.fn((key: string, value: string) => { values.set(key, value) })
  const store = createConfiguratorStore({ getHref: () => href, replaceUrl: value => { href = value }, getStorage: () => ({ getItem: key => values.get(key) ?? null, setItem: storage }), onPageHide: () => () => {} })
  const disconnect = store.connect(), before = store.getSnapshot(), saved = values.get(CONFIGURATION_STORAGE_KEY), oldHref = href
  const action = { type: 'update-section' as const, id: 'section-1', patch: { drawers: { count: 2, height: .25 } } }
  store.dispatch({ type: 'wardrobe-action', action })
  expect(store.getSnapshot()).toBe(before); expect(values.get(CONFIGURATION_STORAGE_KEY)).toBe(saved); expect(href).toBe(oldHref)
  store.dispatch({ type: 'wardrobe-action', action: { ...action, confirmFillingChange: true } }); disconnect()
  const accepted = store.getSnapshot().session
  expect(accepted.wardrobe.sections[0].drawers).toEqual(action.patch.drawers)
  expect(readSavedSession(values.get(CONFIGURATION_STORAGE_KEY)!).session).toEqual(accepted)
  expect(readSharedConfiguration(createConfigurationUrl(href, accepted))).toEqual({ status: 'valid', wardrobe: accepted.wardrobe })
})
it('roundtrips drawers and finishes, includes their specification and preserves old v4 assemblies', () => {
  const wardrobe = make({ drawers: { count: 3, height: .25 }, shelves: 1, layout: { shelves: [1.7] }, bodyFinish: 'oak-natural', hardwareFinish: 'metal-brass-satin' })
  const session = { ...createDefaultSession(), mode: 'wardrobe' as const, wardrobe }
  expect(readSavedSession(JSON.stringify(session))).toEqual({ session, notice: null })
  expect(readSharedConfiguration(createConfigurationUrl('https://example.test', session))).toEqual({ status: 'valid', wardrobe })
  const rows = getConfigurationSummary(session).rows
  expect(rows.find(r => r.label.endsWith(': ящики'))?.value).toContain('25 см')
  expect(rows.find(r => r.label.endsWith(': ручки'))?.value).toContain('Латунь')
  expect(normalizeWardrobeAssembly(createDefaultWardrobe())).toEqual(createDefaultWardrobe())
  const removed = updateWardrobeAssembly(wardrobe, { type: 'update-section', id: 'section-1', patch: { drawers: undefined } })
  expect(removed.sections[0]).not.toHaveProperty('drawers')
  expect(removed.sections[0].layout).toEqual(wardrobe.sections[0].layout)
})
it('sanitizes untrusted drawer input, and creates fresh sections without copying drawers', () => {
  for (const drawers of [null, false, [], {}, { count: NaN, height: Infinity }, { count: -5, height: .1 }]) expect(make({ drawers }).sections[0]).not.toHaveProperty('drawers')
  expect(make({ drawers: { count: 500, height: .1 } }).sections[0].drawers).toEqual({ count: 4, height: .2 })
  const config = make({ drawers: { count: 2, height: .25 } })
  expect(updateWardrobeAssembly(config, { type: 'add-section', preset: 'empty' }).sections[1]).not.toHaveProperty('drawers')
})
