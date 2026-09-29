import { expect, it } from 'vitest'
import { createConfigurationUrl, createDefaultSession, readSavedSession, readSharedConfiguration, updateSession } from '../savedConfiguration'
import { getConfigurationSummary } from '../configurationSummary'
import { DRAWER_HANDLES, type WardrobeDrawerHandle } from './drawerHandles'
import { MAX_SECTIONS, normalizeWardrobeAssembly, previewWardrobeSectionUpdate, updateWardrobeAssembly, wardrobeClosedBounds, wardrobeSectionNeedsConfirmation } from './state'

const config = (handle?: WardrobeDrawerHandle) => normalizeWardrobeAssembly({ sections: [{ id: 'section-1', width: .6, height: 2.2, depth: .55, rod: true, shelves: 1,
  layout: { shelves: [1.9], rod: 1.8 }, drawers: { count: 2, height: .25, placement: 'flush', ...(handle ? { handle } : {}) },
  bodyFinish: 'oak-natural', hardwareFinish: 'metal-brass-satin' }] })

it('roundtrips each handle and old omitted values in storage and shared links without corrections', () => {
  for (const handle of [undefined, ...DRAWER_HANDLES.map(h => h.value)]) {
    const session = { ...createDefaultSession(), mode: 'wardrobe' as const, wardrobe: config(handle) }
    expect(readSavedSession(JSON.stringify(session))).toEqual({ session, notice: null })
    expect(readSharedConfiguration(createConfigurationUrl('https://example.test', session))).toEqual({ status: 'valid', wardrobe: session.wardrobe })
    if (!handle) expect(session.wardrobe.sections[0].drawers).not.toHaveProperty('handle')
  }
})
it('changes handles independently without moving filling or requiring confirmation and retains the choice through edits', () => {
  let current = config().sections[0]
  for (const handle of ['knob', 'none', 'bar'] as const) {
    const next = previewWardrobeSectionUpdate(current, { drawers: { ...current.drawers!, handle } })
    expect(wardrobeSectionNeedsConfirmation(current, next)).toBe(false)
    expect(next).toEqual({ ...current, drawers: { ...current.drawers!, handle } })
    current = next
  }
  let wardrobe = config('knob')
  const second = { ...wardrobe.sections[0], id: 'section-2', drawers: { ...wardrobe.sections[0].drawers!, handle: 'none' as const } }
  wardrobe.sections.push(second)
  wardrobe = updateWardrobeAssembly(wardrobe, { type: 'update-section', id: 'section-1', patch: { depth: .8, drawers: { ...current.drawers!, handle: 'knob', count: 3, height: .2, placement: 'recessed' } } })
  expect(wardrobe.sections[1]).toBe(second)
  wardrobe = updateWardrobeAssembly(wardrobe, { type: 'move-section', id: 'section-1', direction: 1 })
  expect(wardrobe.sections[1].drawers).toEqual({ count: 3, height: .2, placement: 'recessed', handle: 'knob' })
  expect(wardrobe.sections[1].layout).toEqual(current.layout)
  const session = { ...createDefaultSession(), mode: 'wardrobe' as const, wardrobe }
  expect(updateSession(session, { type: 'set-mode', mode: 'catalog' }).wardrobe).toEqual(wardrobe)
  const reset = updateSession(session, { type: 'reset-model' })
  expect(reset.wardrobe.sections.every(s => !s.drawers)).toBe(true)
})
it('reports real depth and handle identity, including no handles and independently retained hardware finish', () => {
  for (const [handle, depth, label] of [['bar', .578, 'Скоба'], ['knob', .57, 'Круглая кнопка'], ['none', .55, 'Без ручек']] as const) {
    const wardrobe = config(handle)
    expect(wardrobeClosedBounds(wardrobe).depth).toBe(depth)
    const rows = getConfigurationSummary({ ...createDefaultSession(), mode: 'wardrobe', wardrobe }).rows
    const handles = rows.find(r => r.label === 'Секция 1: ручки')!.value
    expect(handles).toContain(label)
    if (handle === 'none') expect(handles).toBe('Без ручек')
    else expect(handles).toContain('Латунь')
    expect(rows.find(r => r.label === 'Секция 1: направляющие')!.value).toContain('Латунь')
    wardrobe.sections[0].drawers!.placement = 'recessed'
    expect(wardrobeClosedBounds(wardrobe).depth).toBe(.55)
  }
})
it('sanitizes invalid handle values with a correction notice and preserves all valid drawer settings', () => {
  const session = { ...createDefaultSession(), mode: 'wardrobe' as const, wardrobe: config('knob') }
  for (const handle of ['__proto__', 'unknown', {}, ['none'], null, false, 123]) {
    const invalid = { ...session, wardrobe: { ...session.wardrobe, sections: [{ ...session.wardrobe.sections[0], drawers: { ...session.wardrobe.sections[0].drawers, handle } }] } }
    const restored = readSavedSession(JSON.stringify(invalid))
    expect(restored.notice).toContain('Параметры ящиков')
    expect(restored.session.wardrobe).toEqual(config())
    const url = new URL('https://example.test')
    url.searchParams.set('config', JSON.stringify({ version: 4, kind: 'wardrobe-assembly', wardrobe: invalid.wardrobe }))
    const shared = readSharedConfiguration(url.href)
    expect(shared.status).toBe('adjusted'); expect(shared.notice).toBe(restored.notice)
  }
})
it('enforces the existing section cap on actions, saved state and imported URLs and explains discarded excess', () => {
  const raw = { ...config('none'), sections: Array.from({ length: 26 }, (_, i) => ({ ...config('none').sections[0], id: `section-${i + 1}` })) }
  const session = { ...createDefaultSession(), mode: 'wardrobe' as const, wardrobe: raw }
  const restored = readSavedSession(JSON.stringify(session))
  expect(MAX_SECTIONS).toBe(7)
  expect(restored.session.wardrobe.sections).toEqual(raw.sections.slice(0, 7))
  expect(restored.notice).toContain('оставлены первые 7')
  expect(updateWardrobeAssembly(restored.session.wardrobe, { type: 'add-section', preset: 'empty' })).toBe(restored.session.wardrobe)
  const url = new URL('https://example.test')
  url.searchParams.set('config', JSON.stringify({ version: 4, kind: 'wardrobe-assembly', wardrobe: raw }))
  const shared = readSharedConfiguration(url.href)
  expect(shared.status).toBe('adjusted'); expect(shared.wardrobe).toEqual(restored.session.wardrobe)
  expect(shared.notice).toBe(restored.notice)
  expect(readSavedSession(JSON.stringify(restored.session)).notice).toBeNull()
})
