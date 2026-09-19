/// <reference types="node" />
import { readFile } from 'node:fs/promises'
import { afterEach, expect, it, vi } from 'vitest'
import { Box3, Mesh, MeshStandardMaterial, Raycaster, Vector2, Vector3 } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { TABLE_BASES, TOP_SHAPES } from '../../configurator/tableAssembly/catalog'
import { normalizeTableAssembly } from '../../configurator/tableAssembly/state'
import { disposeMaterialFinishCache } from '../materials/createMaterial'
import { createFurnitureMaterialController } from '../materials/materialController'
import { createTableAssembly } from './tableAssembly'
import { createTabletopOutline } from './tabletopGeometry'

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

it.each(TABLE_BASES.filter((base) => !base.cornerLegs && !base.uFrames))('$id keeps its footprint and mounting plane while its top changes', async (base) => {
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

it.each(['/models/table-03-slat-pedestal.glb', '/modules/bases/slat-pedestal.glb'])('%s has a continuous core/plinth joint including the lower bevel', async (url) => {
  const model = await loadBase(url)
  model.updateMatrixWorld(true)
  const core = model.getObjectByName('Pedestal_Core')!
  const plinth = model.getObjectByName('Base_Plinth')!
  const coreBounds = new Box3().setFromObject(core)
  const plinthBounds = new Box3().setFromObject(plinth)
  expect(coreBounds.min.y).toBeCloseTo(0.028, 6)
  expect(coreBounds.max.y).toBeCloseTo(0.716, 6)
  expect(plinthBounds.min.y).toBeCloseTo(0, 6)
  expect(plinthBounds.max.y).toBeCloseTo(0.035, 6)
  // AABB-overlap alone would miss a visible gap along a rounded end.
  for (const y of [0.0349, 0.035, 0.0351, 0.038, 0.041]) {
    const ray = new Raycaster(new Vector3(0, y, 1), new Vector3(0, 0, -1))
    const hits = ray.intersectObject(core, true)
    expect(hits.length).toBeGreaterThan(0)
    expect(hits[0].point.z).toBeCloseTo(0.17, 5)
  }
})

it.each(['rectangle', 'rounded-rectangle', 'chamfered', 'wide-chamfered'] as const)('four legs stay inside %s and touch floor/top through size and height changes', async (shape) => {
  const base = TABLE_BASES.find((entry) => entry.id === 'four-legs')!
  const model = await loadBase(base.modelUrl)
  const initial = normalizeTableAssembly({ baseId: base.id, shape, baseHeight: base.height.base })
  const assembly = createTableAssembly(model, initial)
  const legs = base.cornerLegs!.targets.map((name) => model.getObjectByName(name) as Mesh)
  const originals = legs.map((leg) => leg.geometry.getAttribute('position').clone())
  for (const length of [1.2, 2, 1.2]) for (const width of [0.6, 1]) for (const baseHeight of [0.64, 0.84, 0.71]) for (const thickness of [0.02, 0.05]) {
    const config = normalizeTableAssembly({ ...initial, length, width, baseHeight, thickness })
    assembly.update(config)
    const outline = createTabletopOutline(config)
    for (const [index, leg] of legs.entries()) {
      const bounds = new Box3().setFromObject(leg)
      const size = bounds.getSize(new Vector3())
      expect(bounds.min.y).toBeCloseTo(0, 6)
      expect(bounds.max.y).toBeCloseTo(baseHeight, 6)
      expect(size.x).toBeCloseTo(0.04, 6)
      expect(size.z).toBeCloseTo(0.04, 6)
      expect(leg.scale.toArray()).toEqual([1, 1, 1])
      // All four outer corners of each leg must clear every actual contour edge.
      for (const x of [bounds.min.x, bounds.max.x]) for (const z of [bounds.min.z, bounds.max.z]) {
        const corner = new Vector2(x, z)
        outline.forEach((p, i) => {
          const edge = outline[(i + 1) % outline.length].clone().sub(p)
          expect(edge.cross(corner.clone().sub(p)) / edge.length()).toBeGreaterThan(0.02)
        })
      }
      const position = leg.geometry.getAttribute('position')
      for (let i = 0; i < position.count; i++) {
        const y = originals[index].getY(i)
        if (y < -0.345) expect(position.getY(i)).toBeCloseTo(y, 6)
        if (y > 0.345) expect(position.getY(i) - y).toBeCloseTo(baseHeight - 0.71, 6)
      }
    }
    expect(new Box3().setFromObject(assembly.top).min.y).toBeCloseTo(baseHeight, 6)
    expect(new Box3().setFromObject(assembly.top).max.y).toBeCloseTo(baseHeight + thickness, 6)
  }
  assembly.dispose()
})

it('insets four legs further for cut corners and restores them after changing shapes or materials', async () => {
  const model = await loadBase('/modules/bases/four-legs.glb')
  const initial = normalizeTableAssembly({ baseId: 'four-legs', shape: 'rectangle' })
  const assembly = createTableAssembly(model, initial)
  const leg = model.getObjectByName('Leg_01')!
  const first = leg.position.clone()
  for (const shape of ['chamfered', 'wide-chamfered'] as const) {
    assembly.update({ ...initial, shape })
    expect(Math.abs(leg.position.x)).toBeLessThan(Math.abs(first.x))
    expect(Math.abs(leg.position.z)).toBeLessThan(Math.abs(first.z))
    const beforeRefresh = leg.position.clone()
    assembly.refreshTextures()
    expect(leg.position).toEqual(beforeRefresh)
  }
  assembly.update(initial)
  expect(leg.position).toEqual(first)
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
    expect(box.max.y - box.min.y).toBeCloseTo(0.71 + baseHeight - base.sourceHeight, 6)
    expect(box.min.x).toBe(initialColumn.min.x)
    expect(box.max.z).toBe(initialColumn.max.z)
    expect(new Box3().setFromObject(disc)).toEqual(initialDisc)
    expect(new Box3().setFromObject(mount).getSize(new Vector3()).toArray()).toEqual(initialMountSize.toArray())
    const mountBounds = new Box3().setFromObject(mount)
    expect(box.max.y).toBeGreaterThan(mountBounds.min.y)
    expect(mountBounds.max.y).toBeCloseTo(baseHeight + 0.001, 6)
    expect(new Box3().setFromObject(assembly.top).min.y).toBeCloseTo(baseHeight, 6)
  }
  assembly.dispose()
})

it.each(TABLE_BASES)('$id keeps GLB reference height separate from its user default', async (base) => {
  const loaded = await loadBase(base.modelUrl)
  const attachment = loaded.getObjectByName(base.attachment)!
  expect(attachment.getWorldPosition(new Vector3()).y).toBeCloseTo(base.sourceHeight, 6)
  const config = normalizeTableAssembly({ baseId: base.id })
  const assembly = createTableAssembly(loaded, config)
  expect(attachment.getWorldPosition(new Vector3()).y).toBeCloseTo(config.baseHeight, 6)
  expect(new Box3().setFromObject(assembly.top).min.y).toBeCloseTo(config.baseHeight, 6)
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
