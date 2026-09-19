/// <reference types="node" />

import { readFile } from 'node:fs/promises'
import { afterEach, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { createFurnitureController } from '../furniture/furnitureController'
import type { FurnitureDefinition } from '../furniture/types'
import { disposeMaterialFinishCache } from '../materials/createMaterial'
import { createFurnitureMaterialController } from '../materials/materialController'
import { U_FRAME_TABLE_CONFIG } from './u-frame-table/config'
import { SLAT_PEDESTAL_TABLE_CONFIG } from './slat-pedestal-table/config'

afterEach(() => {
  disposeMaterialFinishCache()
  vi.unstubAllGlobals()
})

const cases: { config: FurnitureDefinition; materials: string[] }[] = [
  {
    config: U_FRAME_TABLE_CONFIG,
    materials: ['Top_Primary', 'Top_Bottom', 'Top_Edge_Long', 'Top_Edge_Short'],
  },
  {
    config: SLAT_PEDESTAL_TABLE_CONFIG,
    materials: ['Wood_Top', 'Wood_Bottom', 'Wood_Edge_Long', 'Wood_Edge_Short'],
  },
]

it.each(cases)('$config.id keeps one texture tile per metre on all tabletop faces after resize and finish changes', async ({ config, materials }) => {
  stubImages()
  const bytes = await readFile(`public${config.modelUrl}`)
  const { scene } = await new GLTFLoader().parseAsync(Uint8Array.from(bytes).buffer, '')
  const furniture = createFurnitureController(scene, config)
  const finishes = createFurnitureMaterialController(scene, config, {
    maxAnisotropy: 8,
    onMaterialsChanged: furniture.refreshTextures,
  })
  const { length, width } = config.dimensions
  const sizes = [
    { length: length.base, width: width.base },
    { length: length.max, width: width.base },
    { length: length.base, width: width.max },
    { length: length.max, width: width.max },
    { length: (length.base + length.max) / 2, width: (width.base + width.max) / 2 },
    { length: length.base, width: width.base },
  ]

  // Реальные GLB и контроллер материалов: проверяем физический результат,
  // включая смену материала на уже растянутой модели и возврат в base.
  for (const [index, size] of sizes.entries()) {
    furniture.setDimensions(size)
    await finishes.setFinishes({ ...finishes.getSelections(), primaryTop: index % 2 ? 'oak-natural' : 'marble-duo-gold' })
    scene.updateMatrixWorld(true)
    for (const [surface, name] of materials.entries()) {
      expectPhysicalUvDensity(scene, name, surface)
    }
  }
  finishes.dispose()
})

function expectPhysicalUvDensity(scene: THREE.Object3D, name: string, surface: number): void {
  let found = false
  scene.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return
    const material = object.material
    if (!(material instanceof THREE.MeshStandardMaterial) || material.name !== name) return
    found = true
    const position = object.geometry.getAttribute('position')
    const normal = object.geometry.getAttribute('normal')
    const uv = object.geometry.getAttribute('uv')
    // Берём плоскую часть поверхности: плотность bevel оценивается отдельно
    // визуально, а этот тест ловит сжатие полной текстуры в 15/22 мм торца.
    const normalAxis = surface < 2 ? 'y' : surface === 2 ? 'z' : 'x'
    const horizontalAxis = surface === 3 ? 'z' : 'x'
    const verticalAxis = surface < 2 ? 'z' : 'y'
    const vertices: { position: THREE.Vector3; uv: THREE.Vector2 }[] = []
    for (let index = 0; index < position.count; index++) {
      const n = new THREE.Vector3().fromBufferAttribute(normal, index)
      if (Math.abs(n[normalAxis]) < 0.9999) continue
      vertices.push({
        position: new THREE.Vector3().fromBufferAttribute(position, index).applyMatrix4(object.matrixWorld),
        uv: new THREE.Vector2().fromBufferAttribute(uv, index),
      })
    }
    expect(vertices.length, `${name}: flat face vertices`).toBeGreaterThan(2)
    const physicalU = span(vertices.map(v => v.position[horizontalAxis]))
    const physicalV = span(vertices.map(v => v.position[verticalAxis]))
    for (const map of [material.map, material.normalMap, material.roughnessMap]) {
      expect(map, `${name}: PBR map`).not.toBeNull()
      map!.updateMatrix()
      const transformed = vertices.map(v => v.uv.clone().applyMatrix3(map!.matrix))
      const densityU = span(transformed.map(v => v.x)) / physicalU
      const densityV = span(transformed.map(v => v.y)) / physicalV
      expect(densityU, `${name}: U tiles/metre`).toBeCloseTo(1, 4)
      expect(densityV, `${name}: V tiles/metre`).toBeCloseTo(1, 4)
    }
  })
  expect(found, `Missing independent semantic surface ${name}`).toBe(true)
}

function span(values: number[]): number {
  return Math.max(...values) - Math.min(...values)
}

function stubImages(): void {
  class ImageStub extends EventTarget {
    width = 2
    height = 2
    complete = false
    private source = ''
    set src(value: string) {
      this.source = value
      this.complete = true
      queueMicrotask(() => this.dispatchEvent(new Event('load')))
    }
    get src(): string { return this.source }
  }
  vi.stubGlobal('self', globalThis)
  vi.stubGlobal('document', { createElementNS: () => new ImageStub() })
}
