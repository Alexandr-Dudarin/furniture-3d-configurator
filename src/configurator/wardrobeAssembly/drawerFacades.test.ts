import { expect, it } from 'vitest'
import { createConfigurationUrl, createDefaultSession, readSavedSession, readSharedConfiguration, updateSession } from '../savedConfiguration'
import { getConfigurationSummary } from '../configurationSummary'
import { DRAWER_FACADE_STYLES, getWardrobeDrawerFacade } from './drawerFacades'
import { DRAWER_HANDLES } from './drawerHandles'
import { normalizeWardrobeAssembly, previewWardrobeSectionUpdate, updateWardrobeAssembly, wardrobeSectionNeedsConfirmation } from './state'

const base = () => normalizeWardrobeAssembly({ sections: [
  { id: 'section-1', width: .6, height: 2.2, depth: .55, shelves: 1, rod: true,
    layout: { shelves: [1.9], rod: 1.8 }, drawers: { count: 2, height: .25, placement: 'flush' }, bodyFinish: 'oak-natural' },
  { id: 'section-2', width: .4, height: 1.2, depth: .4, shelves: 1, rod: false, drawers: { count: 2, height: .2 } },
] })

it('roundtrips every facade/handle combination and legacy omissions without correction notices', () => {
  for (const facadeStyle of [undefined, ...DRAWER_FACADE_STYLES]) for (const { value: handle } of DRAWER_HANDLES) {
    const wardrobe = base()
    Object.assign(wardrobe.sections[0].drawers!, { handle, ...(facadeStyle ? { facadeStyle } : {}) })
    const session = { ...createDefaultSession(), mode: 'wardrobe' as const, wardrobe }
    expect(readSavedSession(JSON.stringify(session))).toEqual({ session, notice: null })
    expect(readSharedConfiguration(createConfigurationUrl('https://example.test', session))).toEqual({ status: 'valid', wardrobe })
    if (!facadeStyle) expect(wardrobe.sections[0].drawers).not.toHaveProperty('facadeStyle')
    const rows = getConfigurationSummary(session).rows
    expect(rows.find(row => row.label === 'Секция 1: рисунок фасадов ящиков')?.value).toBe(getWardrobeDrawerFacade(facadeStyle).label)
    expect(rows.find(row => row.label === 'Секция 2: рисунок фасадов ящиков')?.value).toBe('Гладкий')
  }
})

it('applies styles only to the chosen section, without moving shelves or triggering confirmations', () => {
  let wardrobe = base()
  const other = wardrobe.sections[1], before = wardrobe.sections[0]
  for (const facadeStyle of DRAWER_FACADE_STYLES) {
    const current = wardrobe.sections[0]
    const patch = { drawers: { ...current.drawers!, facadeStyle } }
    const next = previewWardrobeSectionUpdate(current, patch)
    expect(wardrobeSectionNeedsConfirmation(current, next)).toBe(false)
    wardrobe = updateWardrobeAssembly(wardrobe, { type: 'update-section', id: current.id, patch })
    expect(wardrobe.sections[0]).toEqual({ ...before, drawers: { ...before.drawers!, facadeStyle } })
    expect(wardrobe.sections[1]).toBe(other)
  }
  wardrobe = updateWardrobeAssembly(wardrobe, { type: 'move-section', id: before.id, direction: 1 })
  expect(wardrobe.sections[1].drawers?.facadeStyle).toBe('fluted-wide')
  wardrobe = updateWardrobeAssembly(wardrobe, { type: 'update-section', id: before.id, patch: { width: 1, depth: .8 } })
  expect(wardrobe.sections[1].drawers?.facadeStyle).toBe('fluted-wide')
  const session = { ...createDefaultSession(), mode: 'wardrobe' as const, wardrobe }
  expect(updateSession(session, { type: 'set-mode', mode: 'catalog' }).wardrobe).toEqual(wardrobe)
  expect(updateSession(session, { type: 'reset-model' }).wardrobe.sections.every(s => !s.drawers)).toBe(true)
})

it('rejects unsupported/invalid styles from storage and links while retaining valid filling and handles', () => {
  for (const facadeStyle of ['original', 'herringbone-wide', 'diamonds', '__proto__', 'nope', {}, ['fluted'], null, false, 12]) {
    const wardrobe = base()
    Object.assign(wardrobe.sections[0].drawers!, { facadeStyle })
    const session = { ...createDefaultSession(), mode: 'wardrobe' as const, wardrobe }
    const restored = readSavedSession(JSON.stringify(session))
    expect(restored.notice).toContain('Параметры ящиков')
    expect(restored.session.wardrobe).toEqual(base())
    const url = new URL('https://example.test')
    url.searchParams.set('config', JSON.stringify({ version: 4, kind: 'wardrobe-assembly', wardrobe }))
    const shared = readSharedConfiguration(url.href)
    expect(shared.status).toBe('adjusted'); expect(shared.wardrobe).toEqual(base())
    expect(readSavedSession(JSON.stringify(restored.session)).notice).toBeNull()
  }
})
