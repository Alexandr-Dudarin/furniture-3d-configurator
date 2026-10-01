import { existsSync } from 'node:fs'
import { expect, it } from 'vitest'
import { DEFAULT_FURNITURE_ID, getFurnitureDefinitions } from './furnitureRegistry'
import { createDefaultSession, readSavedSession, readSharedConfiguration } from './savedConfiguration'
import { createConfiguratorStore } from './configuratorStore'

it('starts with an available lightweight model and all public catalogue URLs exist', () => {
  expect(DEFAULT_FURNITURE_ID).toBe('table-03-slat-pedestal')
  expect(getFurnitureDefinitions().map(d => d.id)).not.toContain('table-01')
  for (const definition of getFurnitureDefinitions()) expect(existsSync(`public${definition.modelUrl}`), definition.id).toBe(true)
})

it('recovers an archived model selection without losing other furniture or wardrobe settings', () => {
  const old = createDefaultSession()
  old.selectedModelId = 'table-01'
  old.models['table-01'] = { dimensions: { length: 1.8, width: .9 }, materials: {} }
  old.models[DEFAULT_FURNITURE_ID].dimensions.length = 1.5
  old.wardrobe.sections[0].width = .8
  const result = readSavedSession(JSON.stringify(old))
  expect(result.session.selectedModelId).toBe(DEFAULT_FURNITURE_ID)
  expect(result.session.models[DEFAULT_FURNITURE_ID].dimensions.length).toBe(1.5)
  expect(result.session.wardrobe).toEqual(old.wardrobe)
  expect(result.notice).toContain('больше не доступна')
  expect(readSavedSession(JSON.stringify({ ...old, mode: 'wardrobe' })).notice).toBeNull()
})

it('handles a shared archived table link without attempting to load a missing GLB', () => {
  const url = new URL('https://example.test/feedback/demo')
  url.searchParams.set('config', JSON.stringify({ version: 1, modelId: 'table-01', dimensions: {} }))
  expect(readSharedConfiguration(url.href).status).toBe('invalid')
  const store = createConfiguratorStore({ getStorage: () => ({ getItem: () => null, setItem: () => {} }), getHref: () => url.href, replaceUrl: () => {}, onPageHide: () => () => {} })
  expect(store.getSnapshot().session.selectedModelId).toBe(DEFAULT_FURNITURE_ID)
  expect(store.getSnapshot().notice).toContain('недоступна')
})
