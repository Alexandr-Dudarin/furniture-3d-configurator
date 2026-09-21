import { readFile } from 'node:fs/promises'
import { afterEach, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { getFurnitureDefinitions } from '../../configurator/furnitureRegistry'
import { createFurnitureController } from './furnitureController'
import { createFurniturePresentation } from './furniturePresentation'
import { disposeFurnitureModel } from './model'
import { createFurnitureMaterialController } from '../materials/materialController'
import { disposeMaterialFinishCache } from '../materials/createMaterial'

const wardrobes = getFurnitureDefinitions().filter(d => d.category === 'wardrobes')
afterEach(() => { disposeMaterialFinishCache(); vi.unstubAllGlobals() })

function transforms(root: THREE.Object3D) {
  const result: Record<string, number[]> = {}
  root.traverse(o => { result[o.name] = [...o.position.toArray(), ...o.quaternion.toArray(), ...o.scale.toArray()] })
  return result
}

it.each(wardrobes)('$id hides complete doors while retaining the interior, resizing and finishes', async catalogue => {
  class ImageStub extends EventTarget {
    width = 2; height = 2
    set src(_value: string) { queueMicrotask(() => this.dispatchEvent(new Event('load'))) }
  }
  vi.stubGlobal('self', globalThis)
  vi.stubGlobal('document', { createElementNS: () => new ImageStub() })
  const definition = await catalogue.loadRuntime!()
  const bytes = await readFile(`public${definition.modelUrl}`)
  const root = (await new GLTFLoader().parseAsync(Uint8Array.from(bytes).buffer, '')).scene
  const resize = createFurnitureController(root, definition)
  const finishes = createFurnitureMaterialController(root, definition, { onMaterialsChanged: resize.refreshTextures })
  const presentation = createFurniturePresentation(root, definition)
  const doors: THREE.Object3D[] = [], contents: THREE.Object3D[] = []
  root.traverse(o => {
    if (o.userData.kind === 'door-pivot') doors.push(o)
    if (o.userData.kind === 'board' && !o.name.startsWith('Door_')) contents.push(o)
    if (o.name.startsWith('ClothesRail')) contents.push(o)
  })
  expect(definition.interiorView?.hiddenNodes).toEqual(doors.map(o => o.name))
  expect(doors.length).toBeGreaterThan(0)
  expect(contents.some(o => o.name.startsWith('Shelf_'))).toBe(true)
  expect(contents.some(o => o.name.startsWith('ClothesRail'))).toBe(true)
  const initial = transforms(root)
  try {
    for (const bound of ['min', 'max', 'base'] as const) {
      const dimensions = Object.fromEntries(Object.entries(definition.dimensions).map(([name, d]) => [name, d[bound]]))
      presentation.setView('interior')
      resize.setDimensions(dimensions)
      const resized = transforms(root)
      await finishes.setFinishes({ ...finishes.getSelections(), fronts: 'oak-natural', carcass: 'board-white-matte' })
      for (const door of doors) {
        expect(door.visible).toBe(false)
        door.traverse(o => {
          if (o instanceof THREE.Mesh) {
            const materials = Array.isArray(o.material) ? o.material : [o.material]
            for (const m of materials) if (m.userData.materialSlot === 'fronts') expect(m.userData.finishId).toBe('oak-natural')
          }
        })
      }
      for (const part of contents) {
        for (let o: THREE.Object3D | null = part; o; o = o.parent) expect(o.visible).toBe(true)
      }
      presentation.setView('exterior')
      for (const door of doors) expect(door.visible).toBe(true)
      expect(transforms(root)).toEqual(resized)
    }
    expect(transforms(root)).toEqual(initial)
    presentation.setView('interior')
    presentation.dispose()
    for (const door of doors) expect(door.visible).toBe(true)
  } finally {
    finishes.dispose(); disposeFurnitureModel(root)
  }
}, 30000)

it('restores original visibility and leaves unrelated hidden nodes unchanged', () => {
  const root = new THREE.Group(), door = new THREE.Group(), hidden = new THREE.Group()
  door.name = 'Door'; door.visible = false; hidden.visible = false; root.add(door, hidden)
  const definition = { ...wardrobes[0], interiorView: { hiddenNodes: ['Door'] } }
  const presentation = createFurniturePresentation(root, definition)
  presentation.setView('interior'); presentation.setView('exterior'); presentation.dispose()
  expect(door.visible).toBe(false); expect(hidden.visible).toBe(false)
  expect(() => createFurniturePresentation(root, { ...definition, interiorView: { hiddenNodes: ['Missing'] } })).toThrow('Missing')
})

it('does not affect models without an interior view', () => {
  const root = new THREE.Group(), part = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial())
  root.add(part)
  const presentation = createFurniturePresentation(root, { ...wardrobes[0], interiorView: undefined })
  presentation.setView('interior')
  expect(part.visible).toBe(true)
  presentation.dispose(); part.geometry.dispose(); part.material.dispose()
})
