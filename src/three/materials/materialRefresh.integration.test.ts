/// <reference types="node" />

import { readFile } from 'node:fs/promises'
import { afterEach, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { getFurnitureDefinitions } from '../../configurator/furnitureRegistry'
import { createFurnitureController } from '../furniture/furnitureController'
import { disposeFurnitureModel } from '../furniture/model'
import { disposeMaterialFinishCache } from './createMaterial'
import { createFurnitureMaterialController } from './materialController'

afterEach(() => {
  disposeMaterialFinishCache()
  vi.unstubAllGlobals()
})

it.each(getFurnitureDefinitions().filter(definition => definition.materialSlots?.primaryTop))('$id keeps tabletop texture transforms stable when only the base finish changes', async definition => {
  stubImages()
  const bytes = await readFile(`public${definition.modelUrl}`)
  const { scene } = await new GLTFLoader().parseAsync(Uint8Array.from(bytes).buffer, '')
  const furniture = createFurnitureController(scene, definition)
  const finishes = createFurnitureMaterialController(scene, definition, {
    onMaterialsChanged: furniture.refreshTextures,
  })
  await finishes.setFinishes(finishes.getSelections())
  const topTargets = definition.materialSlots!.primaryTop.targets
  const otherSlots = Object.entries(definition.materialSlots!).filter(([name]) => name !== 'primaryTop')
  const base = Object.fromEntries(Object.entries(definition.dimensions).map(([name, dimension]) => [name, dimension.base]))
  const max = Object.fromEntries(Object.entries(definition.dimensions).map(([name, dimension]) => [name, dimension.max]))
  const middle = Object.fromEntries(Object.entries(definition.dimensions).map(([name, dimension]) => [name, (dimension.base + dimension.max) / 2]))

  // Проверяем все зарегистрированные GLB, а не только новые круглые столы.
  // Смена основания не должна сдвигать или масштабировать прожилки столешницы.
  for (const topFinish of ['walnut-natural', 'marble-duo-gold']) {
    furniture.setDimensions(base)
    const otherTargets = otherSlots.flatMap(([, slot]) => [...slot.targets])
    const otherBefore = textureTransforms(scene, otherTargets)
    await finishes.setFinish('primaryTop', topFinish)
    expect(textureTransforms(scene, otherTargets)).toEqual(otherBefore)
    const atBase = textureTransforms(scene, topTargets)
    expect(Object.keys(atBase).length).toBeGreaterThanOrEqual(3)

    for (const dimensions of [max, middle, max]) {
      furniture.setDimensions(dimensions)
      const before = textureTransforms(scene, topTargets)
      for (const [slotName, slot] of otherSlots) {
        for (const finish of slot.allowedFinishes) {
          await finishes.setFinish(slotName, finish)
          expect(textureTransforms(scene, topTargets)).toEqual(before)
          expect(finishes.getSelections()[slotName]).toBe(finish)
        }
      }
      furniture.refreshTextures()
      furniture.refreshTextures()
      expect(textureTransforms(scene, topTargets)).toEqual(before)
    }
    furniture.setDimensions(base)
    expect(textureTransforms(scene, topTargets)).toEqual(atBase)
  }
  finishes.dispose()
  disposeFurnitureModel(scene)
})

function textureTransforms(scene: THREE.Object3D, names: readonly string[]): Record<string, number[]> {
  const result: Record<string, number[]> = {}
  scene.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return
    const materials = Array.isArray(object.material) ? object.material : [object.material]
    for (const material of materials) {
      if (!(material instanceof THREE.MeshStandardMaterial) || !names.includes(material.name)) continue
      for (const key of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'bumpMap'] as const) {
        const map = material[key]
        if (map) result[`${material.name}:${key}`] = [...map.repeat.toArray(), ...map.offset.toArray()]
      }
    }
  })
  return result
}

function stubImages(): void {
  class ImageStub extends EventTarget {
    width = 2
    height = 2
    complete = false
    set src(_value: string) {
      this.complete = true
      queueMicrotask(() => this.dispatchEvent(new Event('load')))
    }
  }
  vi.stubGlobal('self', globalThis)
  vi.stubGlobal('document', { createElementNS: () => new ImageStub() })
}
