import { describe, expect, it } from 'vitest'
import type { FurnitureDefinition } from '../three/furniture/types'
import { getFurnitureDefinitions } from './furnitureRegistry'
import {
  CONFIGURATION_QUERY_KEY,
  applySharedConfiguration,
  createConfigurationUrl,
  createDefaultSession,
  createModelConfiguration,
  normalizeModelConfiguration,
  readSavedSession,
  readSharedConfiguration,
  updateSession,
} from './savedConfiguration'

const definitions = getFurnitureDefinitions()
const roundId = 'table-05-round-fluted-pedestal'
const rootUrl = 'https://furniture.example/catalog/?campaign=demo#viewer'

function sharedUrl(input: unknown) {
  const url = new URL(rootUrl)
  url.searchParams.set(CONFIGURATION_QUERY_KEY, JSON.stringify(input))
  return url.href
}

describe('configuration portability', () => {
  it('uses the new Katania depth for fresh/reset configurations while preserving saved and shared 400 mm', () => {
    const id = 'wardrobe-15-katania-four-door'
    let session = updateSession(createDefaultSession(), { type: 'select-model', modelId: id })
    expect(session.models[id].dimensions.depth).toBe(.45)
    session = updateSession(session, { type: 'set-dimension', name: 'depth', value: .4 })
    expect(readSavedSession(JSON.stringify(session)).session.models[id].dimensions.depth).toBe(.4)
    const shared = readSharedConfiguration(createConfigurationUrl(rootUrl, session))
    expect(shared.status).toBe('valid')
    expect(applySharedConfiguration(createDefaultSession(), shared.configuration!).models[id].dimensions.depth).toBe(.4)
    expect(updateSession(session, { type: 'reset-model' }).models[id].dimensions.depth).toBe(.45)
  })

  it.each(definitions)('$id survives model switching, serialization and a shared link', (definition) => {
    let session = updateSession(createDefaultSession(), { type: 'select-model', modelId: definition.id })
    for (const name of definition.dimensionOrder) {
      session = updateSession(session, { type: 'set-dimension', name, value: definition.dimensions[name].max })
    }
    for (const [slot, config] of Object.entries(definition.materialSlots ?? {})) {
      session = updateSession(session, { type: 'set-material', slot, finishId: config.allowedFinishes.at(-1)! })
    }
    const selected = session.models[definition.id]
    const anotherId = definitions.find((other) => other.id !== definition.id)!.id
    session = updateSession(session, { type: 'select-model', modelId: anotherId })
    session = updateSession(session, { type: 'select-model', modelId: definition.id })
    expect(session.models[definition.id]).toEqual(selected)
    expect(readSavedSession(JSON.stringify(session)).session).toEqual(session)

    const url = createConfigurationUrl(rootUrl, session)
    const parsed = readSharedConfiguration(url)
    expect(parsed.status).toBe('valid')
    const recipient = applySharedConfiguration(createDefaultSession(), parsed.configuration!)
    expect(recipient.selectedModelId).toBe(definition.id)
    expect(recipient.models[definition.id]).toEqual(selected)
    expect(new URL(url).pathname).toBe('/catalog/')
    expect(new URL(url).searchParams.get('campaign')).toBe('demo')
    expect(new URL(url).hash).toBe('#viewer')
  })

  it('normalizes arbitrary model dimensions and slots without table-specific assumptions', () => {
    const fixture: FurnitureDefinition = {
      id: 'storage-unit-fixture', label: 'Storage unit', modelUrl: '/fixture.glb',
      dimensions: {
        height: { label: 'Высота', base: 2, min: 1.8, max: 2.4, step: 0.05 },
        depth: { label: 'Глубина', base: 0.5, min: 0.4, max: 0.7, step: 0.01 },
      },
      dimensionOrder: ['height', 'depth'], resizeRules: [], textureAxes: {},
      materialSlots: { doors: { label: 'Фасады', targets: [], defaultFinish: 'oak', allowedFinishes: ['oak', 'white'] } },
    }
    expect(normalizeModelConfiguration(fixture, {
      dimensions: { height: 2.234, depth: 999, length: 7 }, materials: { doors: 'white', primaryTop: 'unknown' },
    })).toEqual({ dimensions: { height: 2.25, depth: 0.7 }, materials: { doors: 'white' } })
  })

  it('resets only the active model and rejects unknown actions without changing state', () => {
    let session = updateSession(createDefaultSession(), { type: 'set-dimension', name: 'length', value: 1.8 })
    const first = session.models[session.selectedModelId]
    session = updateSession(session, { type: 'select-model', modelId: roundId })
    session = updateSession(session, { type: 'set-dimension', name: 'diameter', value: 1.3 })
    session = updateSession(session, { type: 'set-material', slot: 'frameMetal', finishId: 'metal-white-matte' })
    session = updateSession(session, { type: 'reset-model' })
    expect(session.models[roundId]).toEqual(createModelConfiguration(definitions.find((d) => d.id === roundId)!))
    expect(session.models[definitions[0].id]).toBe(first)
    expect(updateSession(session, { type: 'select-model', modelId: 'deleted-model' })).toBe(session)
    expect(updateSession(session, { type: 'set-dimension', name: 'height', value: 20 })).toBe(session)
    expect(updateSession(session, { type: 'set-dimension', name: 'diameter', value: NaN })).toBe(session)
    expect(updateSession(session, { type: 'set-material', slot: 'frameMetal', finishId: 'marble-duo-gold' })).toBe(session)
    expect(updateSession(session, { type: 'set-material', slot: '__proto__', finishId: 'unknown' })).toBe(session)
  })
})

describe('untrusted and outdated data', () => {
  it.each(['{', 'null', '[]', '{"version":99,"models":{}}'])('recovers from unreadable storage: %s', (raw) => {
    const result = readSavedSession(raw)
    expect(result.session).toEqual(createDefaultSession())
    expect(result.notice).toBeTruthy()
  })

  it('keeps valid fields while restoring defaults for removed finishes and invalid dimensions', () => {
    const result = readSavedSession(JSON.stringify({ version: 1, selectedModelId: 'deleted-model', models: {
      [roundId]: { dimensions: { diameter: '1.3', height: 20 }, materials: { primaryTop: 'deleted-finish', frameMetal: 'metal-white-matte' } },
      unknown: { dimensions: {} },
    } })).session
    expect(result.selectedModelId).toBe(definitions[0].id)
    expect(result.models[roundId]).toEqual({ dimensions: { diameter: 1.1 }, materials: { primaryTop: 'marble-black-gold', frameMetal: 'metal-white-matte' } })
    expect(result.models.unknown).toBeUndefined()
  })

  it.each([-100, 999, 1.237])('clamps/snaps a diameter from a link: %s', (diameter) => {
    const parsed = readSharedConfiguration(sharedUrl({ version: 1, modelId: roundId, dimensions: { diameter }, materials: {} }))
    expect(parsed.status).toBe('adjusted')
    expect(parsed.configuration!.dimensions.diameter).toBe(diameter < 1.1 ? 1.1 : diameter > 1.4 ? 1.4 : 1.24)
  })

  it.each([
    { version: 99, modelId: roundId },
    { version: 1, modelId: 'removed-model' },
    { version: 1, modelId: '__proto__' },
    null,
  ])('rejects an incompatible shared payload: %j', (payload) => {
    expect(readSharedConfiguration(sharedUrl(payload)).status).toBe('invalid')
  })

  it('handles missing, malformed, duplicate and oversized URL parameters', () => {
    expect(readSharedConfiguration(rootUrl).status).toBe('absent')
    expect(readSharedConfiguration('https://example.test/?config=%7B').status).toBe('invalid')
    const valid = createConfigurationUrl(rootUrl, createDefaultSession())
    expect(readSharedConfiguration(`${valid.split('#')[0]}&config=null`).status).toBe('invalid')
    expect(readSharedConfiguration(`https://example.test/?config=${'x'.repeat(16001)}`).status).toBe('invalid')
  })

  it('ignores extra keys and nonfinite numeric values from storage', () => {
    const input = JSON.parse('{"dimensions":{"diameter":1e999,"__proto__":{"polluted":true}},"materials":{"frameMetal":"metal-white-matte"}}')
    const definition = definitions.find((d) => d.id === roundId)!
    const normalized = normalizeModelConfiguration(definition, input)
    expect(normalized.dimensions).toEqual({ diameter: 1.1 })
    expect(Object.keys(normalized.materials)).toEqual(['primaryTop', 'frameMetal'])
    expect(Object.hasOwn(Object.prototype, 'polluted')).toBe(false)
  })
})


describe('facade configuration compatibility', () => {
  const pilots = definitions.filter(d => d.facades).map(d => d.id)
  it.each(pilots)('%s preserves styles, dimensions and finishes independently through links and resets', id => {
    let session = updateSession(createDefaultSession(), { type: 'select-model', modelId: id })
    const defaults = session.models[id]
    for (const style of ['frame', 'fluted', 'fluted-sides', 'diagonal', 'herringbone', 'diamonds']) {
      session = updateSession(session, { type: 'set-facade-style', style })
      session = updateSession(session, { type: 'set-dimension', name: 'width', value: 1 })
      session = updateSession(session, { type: 'set-material', slot: 'fronts', finishId: 'board-muted-green' })
      const selected = session.models[id]
      expect(selected.facadeStyle).toBe(style)
      expect(readSavedSession(JSON.stringify(session)).session.models[id]).toEqual(selected)
      const url = createConfigurationUrl(rootUrl, session)
      expect(JSON.parse(new URL(url).searchParams.get('config')!).version).toBe(3)
      const parsed = readSharedConfiguration(url)
      expect(parsed.status).toBe('valid')
      expect(applySharedConfiguration(createDefaultSession(), parsed.configuration!).models[id]).toEqual(selected)
      session = updateSession(session, { type: 'select-model', modelId: roundId })
      session = updateSession(session, { type: 'select-model', modelId: id })
      expect(session.models[id]).toEqual(selected)
    }
    expect(updateSession(session, { type: 'set-facade-style', style: 'unknown' })).toBe(session)
    expect(updateSession(session, { type: 'reset-model' }).models[id]).toEqual(defaults)
  })

  it('opens an old link as smooth even when the recipient saved a fluted facade', () => {
    const id = 'wardrobe-09-chelsea-two-door'
    let recipient = updateSession(createDefaultSession(), { type: 'select-model', modelId: id })
    const { dimensions, materials } = recipient.models[id]
    recipient = updateSession(recipient, { type: 'set-facade-style', style: 'fluted' })
    for (const version of [1, 2]) {
      const parsed = readSharedConfiguration(sharedUrl({ version, modelId: id, dimensions, materials }))
      expect(parsed.status).toBe('valid')
      expect(applySharedConfiguration(recipient, parsed.configuration!).models[id].facadeStyle).toBe('smooth')
    }
    const adjusted = readSharedConfiguration(sharedUrl({ version: 3, modelId: id, dimensions, materials, facadeStyle: 'deleted' }))
    expect(adjusted.status).toBe('adjusted')
    expect(adjusted.configuration!.facadeStyle).toBe('smooth')
    const plain = updateSession(recipient, { type: 'select-model', modelId: roundId })
    expect(updateSession(plain, { type: 'set-facade-style', style: 'frame' })).toBe(plain)
    expect(JSON.parse(new URL(createConfigurationUrl(rootUrl, plain)).searchParams.get('config')!).version).toBe(1)
  })
})


it.each(definitions.filter(d => d.facades))('$id restores the original appearance from old v1/v2/v3 links and storage', definition => {
  const { id } = definition, defaults = createDefaultSession().models[id]
  const legacy = { ...defaults }; delete legacy.facadeStyle
  for (const version of [1, 2, 3]) {
    const parsed = readSharedConfiguration(sharedUrl({ version, modelId: id, ...legacy }))
    expect(parsed.status).toBe('valid')
    expect(parsed.configuration!.facadeStyle).toBe(definition.facades!.defaultStyle)
  }
  expect(normalizeModelConfiguration(definition, legacy)).toEqual(defaults)
})
