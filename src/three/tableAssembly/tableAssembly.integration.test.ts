/// <reference types="node" />
import { readFile } from 'node:fs/promises'
import { afterEach, expect, it, vi } from 'vitest'
import { Box3, Mesh, MeshStandardMaterial, Vector3 } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { TABLE_BASES, TOP_SHAPES } from '../../configurator/tableAssembly/catalog'
import { normalizeTableAssembly } from '../../configurator/tableAssembly/state'
import { disposeMaterialFinishCache } from '../materials/createMaterial'
import { createFurnitureMaterialController } from '../materials/materialController'
import { createTableAssembly } from './tableAssembly'

afterEach(() => { disposeMaterialFinishCache(); vi.unstubAllGlobals() })

async function loadBase(url: string) {
  class ImageStub extends EventTarget {
    width = 2; height = 2; complete = false
    set src(_value: string) { this.complete = true; queueMicrotask(() => this.dispatchEvent(new Event('load'))) }
  }
  vi.stubGlobal('self', globalThis)
  vi.stubGlobal('document', { createElementNS: () => new ImageStub() })
  const bytes = await readFile(`public${url}`)
  return (await new GLTFLoader().parseAsync(Uint8Array.from(bytes).buffer, '')).scene
}

it.each(TABLE_BASES)('$id keeps its footprint and mounting plane while its top changes', async (base) => {
  const loaded = await loadBase(base.modelUrl)
  expect(loaded.getObjectByName('TableTop')).toBeUndefined()
  const initial = normalizeTableAssembly({ baseId: base.id, baseHeight: base.height.base })
  const assembly = createTableAssembly(loaded, initial)
  const before = new Box3().setFromObject(loaded)
  for (const shape of TOP_SHAPES.filter((entry) => base.compatibleShapes.includes(entry.id))) {
    for (const [length, width, thickness] of [[base.length.min, base.width.min, 0.02], [base.length.max, base.width.max, 0.05]]) {
      const config = normalizeTableAssembly({ ...initial, shape: shape.id, length, width, thickness })
      const oldGeometry = assembly.top.geometry
      const disposed = vi.spyOn(oldGeometry, 'dispose')
      assembly.update(config)
      expect(disposed).toHaveBeenCalledTimes(1)
      const bounds = new Box3().setFromObject(assembly.top)
      expect(bounds.min.y).toBeCloseTo(config.baseHeight, 6)
      expect(bounds.max.y).toBeCloseTo(config.baseHeight + config.thickness, 6)
      const after = new Box3().setFromObject(loaded)
      expect(after.min.toArray()).toEqual(before.min.toArray())
      expect(after.max.toArray()).toEqual(before.max.toArray())
      expect(loaded.scale.toArray()).toEqual([1, 1, 1])
    }
  }
  assembly.dispose()
})

it('changes only the column length and upper mount, retaining floor contact and section', async () => {
  const base = TABLE_BASES.find((entry) => entry.id === 'round-fluted')!
  const loaded = await loadBase(base.modelUrl)
  const initial = normalizeTableAssembly({ baseId: base.id, shape: 'circle' })
  const assembly = createTableAssembly(loaded, initial)
  const disc = loaded.getObjectByName('Base_Disc')!
  const column = loaded.getObjectByName('Fluted_Column')!
  const mount = loaded.getObjectByName('Top_Mount')!
  const initialColumn = new Box3().setFromObject(column)
  const initialDisc = new Box3().setFromObject(disc)
  const initialMountSize = new Box3().setFromObject(mount).getSize(new Vector3())
  for (const baseHeight of [base.height.min, base.height.max, base.height.base, base.height.max, base.height.min]) {
    assembly.update({ ...initial, baseHeight })
    const box = new Box3().setFromObject(column)
    expect(box.min.y).toBeCloseTo(initialColumn.min.y, 6)
    expect(box.max.y - box.min.y).toBeCloseTo(0.71 + baseHeight - base.height.base, 6)
    expect(box.min.x).toBe(initialColumn.min.x)
    expect(box.max.z).toBe(initialColumn.max.z)
    expect(new Box3().setFromObject(disc)).toEqual(initialDisc)
    expect(new Box3().setFromObject(mount).getSize(new Vector3()).toArray()).toEqual(initialMountSize.toArray())
    expect(new Box3().setFromObject(assembly.top).min.y).toBeCloseTo(baseHeight, 6)
  }
  assembly.dispose()
})

it.each(TABLE_BASES)('$id maintains top UVs when resizing and changing the independent base finish', async (base) => {
  const loaded = await loadBase(base.modelUrl)
  let config = normalizeTableAssembly({ baseId: base.id })
  const assembly = createTableAssembly(loaded, config)
  const materials = createFurnitureMaterialController(assembly.group, assembly.materialDefinition, { onMaterialsChanged: assembly.refreshTextures })
  await materials.setFinishes({ primaryTop: 'marble-duo-gold', baseFinish: base.defaultFinish })
  config = normalizeTableAssembly({ ...config, length: base.length.max, thickness: 0.05, baseHeight: base.height.max })
  assembly.update(config)
  const topMaterials = assembly.top.material as MeshStandardMaterial[]
  const uv = Array.from(assembly.top.geometry.getAttribute('uv').array)
  const repeats = topMaterials.map((material) => [...material.map!.repeat.toArray(), ...material.map!.offset.toArray()])
  await materials.setFinish('baseFinish', base.allowedFinishes.at(-1)!)
  expect(Array.from(assembly.top.geometry.getAttribute('uv').array)).toEqual(uv)
  expect(topMaterials.map((material) => [...material.map!.repeat.toArray(), ...material.map!.offset.toArray()])).toEqual(repeats)
  expect(repeats.every((values) => JSON.stringify(values) === '[1,1,0,0]')).toBe(true)
  expect(assembly.top).toBeInstanceOf(Mesh)
  materials.dispose()
  assembly.dispose()
})
