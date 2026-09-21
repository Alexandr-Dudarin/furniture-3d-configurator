import { readFile } from 'node:fs/promises'
import { afterEach, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { getFurnitureDefinitions } from '../../configurator/furnitureRegistry'
import { createFurnitureController } from '../furniture/furnitureController'
import { disposeFurnitureModel } from '../furniture/model'
import { createFurnitureMaterialController } from '../materials/materialController'
import { disposeMaterialFinishCache } from '../materials/createMaterial'

const wardrobes = getFurnitureDefinitions().filter(d => d.category === 'wardrobes')
afterEach(() => { disposeMaterialFinishCache(); vi.unstubAllGlobals() })
it.each(wardrobes)('$id preserves physical grain and seam phase across resize, finish replacement and return', async catalogue => {
  class ImageStub extends EventTarget {
    width = 2; height = 2
    set src(_value: string) { queueMicrotask(() => this.dispatchEvent(new Event('load'))) }
  }
  vi.stubGlobal('self', globalThis)
  vi.stubGlobal('document', { createElementNS: () => new ImageStub() })
  const definition = await catalogue.loadRuntime!()
  expect(definition.dimensions).toEqual(catalogue.dimensions)
  for (const [key, slot] of Object.entries(definition.materialSlots!)) {
    expect({ ...slot, targets: [] }).toEqual(catalogue.materialSlots![key])
  }
  const contract = JSON.parse(await readFile(`assets/source/${definition.id}/model-contract.json`, 'utf8'))
  const bytes = await readFile(`public${definition.modelUrl}`)
  const root = (await new GLTFLoader().parseAsync(Uint8Array.from(bytes).buffer, '')).scene
  const controller = createFurnitureController(root, definition)
  const materials = createFurnitureMaterialController(root, definition, { onMaterialsChanged: controller.refreshTextures })
  const base = Object.fromEntries(Object.entries(definition.dimensions).map(([key, value]) => [key, value.base]))
  const bounds = (position: 'min' | 'max') => Object.fromEntries(Object.entries(definition.dimensions).map(([key, value]) => [key, value[position]]))
  const middle = Object.fromEntries(Object.entries(definition.dimensions).map(([key, value]) => [key, Math.round((value.min + value.max) * 500) / 1000]))
  function physicalUV() {
    let maxError = 0, checked = 0
    root.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return
      const material = object.material as THREE.MeshStandardMaterial
      const info = contract.uvContract[material.name]
      if (!info) return
      const texture = material.map!
      expect(texture).toBeTruthy()
      for (const other of [material.normalMap!, material.roughnessMap!]) {
        expect(other.repeat.toArray()).toEqual(texture.repeat.toArray())
        expect(other.offset.toArray()).toEqual(texture.offset.toArray())
      }
      let panel: THREE.Object3D | null = object
      while (panel && panel.userData.kind !== 'board') panel = panel.parent
      expect(panel).toBeTruthy()
      const bevel = panel!.userData.bevelRadius as number
      const position = object.geometry.getAttribute('position')
      const normal = object.geometry.getAttribute('normal')
      const uv = object.geometry.getAttribute('uv')
      for (let i = 0; i < position.count; i++) {
        const local = panel!.worldToLocal(object.localToWorld(new THREE.Vector3().fromBufferAttribute(position, i)))
        const n = new THREE.Vector3().fromBufferAttribute(normal, i)
        for (const [key, component] of [['u', 'x'], ['v', 'y']] as const) {
          const axis = info.bindings[key].axis as 'x' | 'y' | 'z'
          const plane = info.surfacePlane as 'x' | 'y' | 'z'
          // Physical surface length, including the fixed bevel arc, is an independent oracle.
          const expected = 0.5 + local[axis] - bevel * n[axis] + bevel * Math.atan2(n[axis], Math.abs(n[plane]))
          const actual = (component === 'x' ? uv.getX(i) : uv.getY(i)) * texture.repeat[component] + texture.offset[component]
          maxError = Math.max(maxError, Math.abs(expected - actual)); checked++
        }
      }
    })
    expect(checked).toBeGreaterThan(1000)
    expect(maxError).toBeLessThan(1e-6)
  }
  const snapshot = () => {
    const result: Record<string, number[]> = {}
    root.traverse(o => {
      if (!(o instanceof THREE.Mesh)) return
      const m = o.material as THREE.MeshStandardMaterial
      if (contract.uvContract[m.name] && m.map) result[m.name] = [...m.map.repeat.toArray(), ...m.map.offset.toArray()]
    }); return result
  }
  try {
    await materials.setFinishes({ carcass: 'oak-natural', fronts: 'oak-grey', hardware: 'metal-black-matte' })
    const original = snapshot()
    for (const dimensions of [bounds('min'), middle, bounds('max')]) {
      controller.setDimensions(dimensions); physicalUV()
      const before = snapshot()
      await materials.setFinish('hardware', 'metal-white-matte')
      controller.refreshTextures(); controller.refreshTextures()
      expect(snapshot()).toEqual(before)
      await materials.setFinish('fronts', 'oak-silver'); physicalUV()
      await materials.setFinish('carcass', 'board-white-matte')
      await materials.setFinish('carcass', 'oak-natural'); physicalUV()
      expect(snapshot()).toEqual(before)
    }
    controller.setDimensions(base); physicalUV()
    expect(snapshot()).toEqual(original)
  } finally { materials.dispose(); disposeFurnitureModel(root) }
}, 30000)
