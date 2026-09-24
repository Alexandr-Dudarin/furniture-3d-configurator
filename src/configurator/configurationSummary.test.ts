import { describe, expect, it } from 'vitest'
import { configurationSummaryText, getConfigurationSummary } from './configurationSummary'
import { createDefaultSession, updateSession, createConfigurationUrl, readSharedConfiguration, readSavedSession } from './savedConfiguration'
import { getFurnitureDefinitions } from './furnitureRegistry'
import { getMaterialFinish } from '../three/materials/materialRegistry'

describe('configuration summary', () => {
  it('uses cabinet millimeters and actual selected finishes, including saved choices', () => {
    let session = updateSession(createDefaultSession(), { type: 'select-model', modelId: 'dresser-12-brooklyn-six-drawer' })
    session = updateSession(session, { type: 'set-dimension', name: 'width', value: 1.457 })
    session = updateSession(session, { type: 'set-material', slot: 'hardware', finishId: 'metal-white-matte' })
    const summary = getConfigurationSummary(session)
    expect(summary.rows).toContainEqual({ label: 'Ширина', value: '1 457 мм' })
    expect(summary.rows).toContainEqual({ label: 'Ручки', value: 'Белый окрашенный металл' })
    const text = configurationSummaryText(summary, 'https://example.com/?config=demo')
    expect(text).toContain('Бруклин')
    expect(text).toContain('Ссылка на вариант: https://example.com/?config=demo')
    expect(text).not.toContain('Латунь')
  })
  it('describes round and oval assemblies without confusing diameter or total height', () => {
    let session = updateSession(createDefaultSession(), { type: 'set-mode', mode: 'builder' })
    session = updateSession(session, { type: 'update-assembly', patch: { baseId: 'round-fluted', shape: 'circle', length: 1.2, baseHeight: 0.74, thickness: 0.035, edgeProfile: 'bullnose' } })
    expect(getConfigurationSummary(session).rows).toEqual(expect.arrayContaining([
      { label: 'Диаметр', value: '120 см' }, { label: 'Высота стола', value: '77,5 см' },
      { label: 'Толщина столешницы', value: '35 мм' }, { label: 'Кромка', value: 'Мягкая кромка' },
    ]))
    expect(getConfigurationSummary(session).rows.find(row => row.label === 'Ширина')).toBeUndefined()
    session = updateSession(session, { type: 'update-assembly', patch: { shape: 'ellipse' } })
    expect(getConfigurationSummary(session).rows.find(row => row.label === 'Ширина')).toBeDefined()
    expect(getConfigurationSummary(session).rows.find(row => row.label === 'Диаметр')).toBeUndefined()
  })
  it.each(getFurnitureDefinitions())('$id has a complete readable summary', definition => {
    const session = updateSession(createDefaultSession(), { type: 'select-model', modelId: definition.id })
    const summary = getConfigurationSummary(session)
    expect(summary.title).toBe(definition.label)
    expect(summary.rows).toHaveLength(definition.dimensionOrder.length + Object.keys(definition.materialSlots ?? {}).length + (definition.facades ? 1 : 0))
    expect(configurationSummaryText(summary, 'https://example.com')).not.toMatch(/undefined|NaN/)
  })
})

const cabinets = getFurnitureDefinitions().filter(d => d.category === 'wardrobes' || d.category === 'dressers')
describe('reference coatings', () => {
  it.each(cabinets)('$id supports both coatings on production panels and in saved/shared configurations', async definition => {
    const runtime = await definition.loadRuntime!()
    for (const finishId of ['board-muted-green', 'board-powder-beige']) {
      const finish = getMaterialFinish(finishId)
      expect(finish.metalness).toBe(0)
      let session = updateSession(createDefaultSession(), { type: 'select-model', modelId: definition.id })
      for (const slot of ['carcass', 'fronts']) {
        expect(runtime.materialSlots![slot].targets.length).toBeGreaterThan(0)
        expect(runtime.materialSlots![slot].allowedFinishes).toContain(finishId)
        session = updateSession(session, { type: 'set-material', slot, finishId })
      }
      expect(readSavedSession(JSON.stringify(session)).session).toEqual(session)
      const parsed = readSharedConfiguration(createConfigurationUrl('https://example.com/', session))
      expect(parsed.status).toBe('valid')
      expect(parsed.configuration?.materials).toMatchObject({ carcass: finishId, fronts: finishId })
    }
  })
})
