import { expect, it } from 'vitest'
import { createDefaultSession, createConfigurationUrl, readSavedSession, readSharedConfiguration, updateSession } from '../savedConfiguration'
import { getConfigurationSummary } from '../configurationSummary'
import { normalizeWardrobeAssembly, previewWardrobeSectionUpdate, wardrobeBounds, wardrobeClosedBounds, wardrobeSectionClosedDepth, wardrobeSectionNeedsConfirmation, type WardrobeDrawers } from './state'

function assembly(placement?: WardrobeDrawers['placement']) {
  return normalizeWardrobeAssembly({ sections: [{ id: 'section-1', height: 2.2, width: .6, depth: .55, rod: true, shelves: 1,
    layout: { shelves: [1.9], rod: 1.8 }, drawers: { count: 2, height: .25, ...(placement ? { placement } : {}) },
    bodyFinish: 'oak-natural', hardwareFinish: 'metal-brass-satin' }] })
}
it('preserves old recessed configurations exactly and roundtrips either explicit placement', () => {
  for (const placement of [undefined, 'recessed', 'flush'] as const) {
    const wardrobe = assembly(placement), session = { ...createDefaultSession(), mode: 'wardrobe' as const, wardrobe }
    expect(readSavedSession(JSON.stringify(session))).toEqual({ session, notice: null })
    expect(readSharedConfiguration(createConfigurationUrl('https://example.test', session))).toEqual({ status: 'valid', wardrobe })
    if (placement === undefined) expect(wardrobe.sections[0].drawers).toEqual({ count: 2, height: .25 })
    else expect(wardrobe.sections[0].drawers!.placement).toBe(placement)
  }
})
it('changes placement without moving manual filling, requesting confirmation or losing materials', () => {
  const current = assembly().sections[0]
  const flush = previewWardrobeSectionUpdate(current, { drawers: { ...current.drawers!, placement: 'flush' } })
  expect(wardrobeSectionNeedsConfirmation(current, flush)).toBe(false)
  expect(flush).toEqual({ ...current, drawers: { ...current.drawers!, placement: 'flush' } })
  const recessed = previewWardrobeSectionUpdate(flush, { drawers: { ...flush.drawers!, placement: 'recessed' } })
  expect(wardrobeSectionNeedsConfirmation(flush, recessed)).toBe(false)
  expect(recessed.layout).toEqual(current.layout)
  const extra = previewWardrobeSectionUpdate(flush, { drawers: { ...flush.drawers!, count: 3 } })
  expect(extra.drawers!.placement).toBe('flush')
  expect(previewWardrobeSectionUpdate(extra, { depth: .8 }).drawers!.placement).toBe('flush')
  expect(previewWardrobeSectionUpdate(flush, { drawers: { ...flush.drawers!, height: .3 } }).drawers!.placement).toBe('flush')
})
it('bounds a mixed-depth assembly by its actual deepest closed handle or carcass, not a blanket offset', () => {
  const wardrobe = assembly('flush'), section = wardrobe.sections[0]
  expect(wardrobeBounds(wardrobe).depth).toBe(.55)
  expect(wardrobeSectionClosedDepth(section)).toBe(.578)
  expect(wardrobeClosedBounds(wardrobe).depth).toBe(.578)
  wardrobe.sections.push({ ...section, id: 'section-2', depth: .8, drawers: undefined })
  expect(wardrobeClosedBounds(wardrobe).depth).toBe(.8)
  wardrobe.sections[1].drawers = { count: 1, height: .2, placement: 'flush' }
  expect(wardrobeClosedBounds(wardrobe).depth).toBe(.828)
  const rows = getConfigurationSummary({ ...createDefaultSession(), mode: 'wardrobe', wardrobe }).rows
  expect(rows.find(r => r.label === 'Максимальная глубина корпуса')?.value).toBe('80 см')
  expect(rows.find(r => r.label === 'Глубина сборки с дверями и ручками (всё закрыто)')?.value).toBe('82,8 см')
  expect(rows.find(r => r.label === 'Секция 1: положение фасадов ящиков')?.value).toBe('Вровень с корпусом')
})
it('explains invalid imported placement and preserves the valid choice across session edits', () => {
  let session = { ...createDefaultSession(), mode: 'wardrobe' as const, wardrobe: assembly('flush') }
  const invalid = { ...session, wardrobe: { ...session.wardrobe, sections: [{ ...session.wardrobe.sections[0], drawers: { count: 2, height: .25, placement: 'unknown' } }] } }
  const restored = readSavedSession(JSON.stringify(invalid))
  expect(restored.notice).toContain('Параметры ящиков')
  expect(restored.session.wardrobe.sections[0].drawers).toEqual({ count: 2, height: .25 })
  expect(readSharedConfiguration(createConfigurationUrl('https://example.test', restored.session)).status).toBe('valid')
  session = updateSession(session, { type: 'wardrobe-action', action: { type: 'set-section-finish', id: 'section-1', slot: 'bodyFinish', finishId: 'board-white-matte' } }) as typeof session
  expect(session.wardrobe.sections[0].drawers!.placement).toBe('flush')
  expect(updateSession(session, { type: 'set-mode', mode: 'catalog' }).wardrobe).toEqual(session.wardrobe)
  expect(updateSession(session, { type: 'reset-model' }).wardrobe.sections.every(s => !s.drawers)).toBe(true)
})
