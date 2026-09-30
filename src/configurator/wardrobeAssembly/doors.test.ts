import { expect, it } from 'vitest'
import { normalizeWardrobeAssembly, previewWardrobeSectionUpdate, updateWardrobeAssembly, wardrobeSectionNeedsConfirmation, wardrobeSectionDrawerInset } from './state'
import { wardrobeDoorWidth } from './doors'
import { createDefaultSession, createConfigurationUrl, readSharedConfiguration, readSavedSession, updateSession } from '../savedConfiguration'
import { getConfigurationSummary } from '../configurationSummary'

const config = (patch: object = {}) => normalizeWardrobeAssembly({ sections: [{ id: 'section-1', width: .6, doors: { count: 1 }, ...patch }] })
it('limits every leaf to 60 cm and promotes a single door when width grows', () => {
  for (let mm = 400; mm <= 1000; mm += 50) for (const count of [1, 2]) {
    const s = config({ width: mm / 1000, doors: { count } }).sections[0]
    expect(wardrobeDoorWidth(s.width, s.doors!.count)).toBeLessThanOrEqual(.6)
    expect(s.doors!.count).toBe(mm > 600 ? 2 : count)
  }
  const s = config().sections[0], wider = previewWardrobeSectionUpdate(s, { width: .65 })
  expect(wider.doors?.count).toBe(2)
  expect(wardrobeSectionNeedsConfirmation(s, wider)).toBe(false)
  expect(previewWardrobeSectionUpdate(wider, { width: .6 }).doors?.count).toBe(2)
  expect(wardrobeDoorWidth(.6, 1)).toBeCloseTo(.596)
  expect(wardrobeDoorWidth(1, 2)).toBeCloseTo(.496)
})
it('requires confirmation only when doors convert flush drawers to recessed', () => {
  const c = config({ doors: undefined, drawers: { count: 2, height: .2, placement: 'flush', handle: 'edge-pull', facadeStyle: 'frame' } })
  const doors = config().sections[0].doors!
  const a = { type: 'update-section' as const, id: 'section-1', patch: { doors } }
  expect(updateWardrobeAssembly(c, a)).toBe(c)
  const next = updateWardrobeAssembly(c, { ...a, confirmFillingChange: true })
  expect(next.sections[0].drawers).toEqual({ ...c.sections[0].drawers, placement: 'recessed' })
  expect(wardrobeSectionDrawerInset(next.sections[0])).toBeCloseTo(.04)
  const removed = previewWardrobeSectionUpdate(next.sections[0], { doors: undefined })
  expect(removed.doors).toBeUndefined()
  expect(removed.drawers?.placement).toBe('recessed')
  const originalRecessed = config({ doors: undefined, drawers: { count: 2, height: .2 } }).sections[0]
  expect(wardrobeSectionNeedsConfirmation(originalRecessed, previewWardrobeSectionUpdate(originalRecessed, { doors }))).toBe(false)
})
it('normalizes invalid imported doors without changing old open sections', () => {
  for (const doors of [null, [], true, {}, { count: 3 }, { count: -1 }]) expect(config({ doors }).sections[0]).not.toHaveProperty('doors')
  const s = config({ width: 100, doors: { count: 1, hinge: 'bad', handle: 'script', facadeStyle: 'bad', finish: 'missing' }, drawers: { count: 1, height: .2, placement: 'flush' } }).sections[0]
  expect(s.doors).toEqual({ count: 2, hinge: 'left', handle: 'bar', facadeStyle: 'smooth' })
  expect(s.drawers?.placement).toBe('recessed')
  const old = normalizeWardrobeAssembly({ sections: [{ id: 'section-1', width: .4 }] })
  expect(normalizeWardrobeAssembly(old)).toEqual(old)
  expect(old.sections[0]).not.toHaveProperty('doors')
})
it('roundtrips doors, finishes and handles through URLs, storage and summary; reset removes doors', () => {
  const wardrobe = config({ doors: { count: 2, hinge: 'right', handle: 'profile', facadeStyle: 'fluted-wide', finish: 'oak-natural' } })
  const session = { ...createDefaultSession(), mode: 'wardrobe' as const, wardrobe }
  expect(readSavedSession(JSON.stringify(session))).toEqual({ session, notice: null })
  const link = createConfigurationUrl('https://example.test/', session)
  expect(readSharedConfiguration(link)).toEqual({ status: 'valid', wardrobe })
  const summary = getConfigurationSummary(session)
  expect(summary.rows.find(r => r.label === 'Секция 1: материал дверей')?.value).toContain('Дуб натуральный')
  expect(summary.rows.find(r => r.label === 'Секция 1: рисунок дверей')?.value).toBe('Широкие канавки')
  expect(updateSession(session, { type: 'reset-model' }).wardrobe.sections.every(s => !s.doors)).toBe(true)
})
it('retains hinge, finish and facade when widths and drawer counts change', () => {
  const c = config({ doors: { count: 1, hinge: 'right', handle: 'knob', facadeStyle: 'frame', finish: 'oak-black' } })
  const next = previewWardrobeSectionUpdate(c.sections[0], { width: 1, drawers: { count: 2, height: .2 } })
  expect(next.doors).toEqual({ ...c.sections[0].doors, count: 2 })
  expect(next.drawers?.placement).toBe('recessed')
})
