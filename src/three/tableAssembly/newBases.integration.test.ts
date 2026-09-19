/// <reference types="node" />
import { readFile } from 'node:fs/promises'
import { afterEach, expect, it, vi } from 'vitest'
import { Box3, Mesh, MeshStandardMaterial, Raycaster, Vector2, Vector3, type BufferAttribute, type InterleavedBufferAttribute } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { getTableBase } from '../../configurator/tableAssembly/catalog'
import { normalizeTableAssembly } from '../../configurator/tableAssembly/state'
import { createTableAssembly } from './tableAssembly'
import { createTabletopOutline } from './tabletopGeometry'
import { createFurnitureMaterialController } from '../materials/materialController'
import { disposeMaterialFinishCache } from '../materials/createMaterial'

afterEach(() => { disposeMaterialFinishCache(); vi.unstubAllGlobals() })

async function load(url: string) {
  class ImageStub extends EventTarget {
    width = 2; height = 2; complete = false
    set src(_value: string) { this.complete = true; queueMicrotask(() => this.dispatchEvent(new Event('load'))) }
  }
  vi.stubGlobal('self', globalThis)
  vi.stubGlobal('document', { createElementNS: () => new ImageStub() })
  const bytes = await readFile(`public${url}`)
  return (await new GLTFLoader().parseAsync(Uint8Array.from(bytes).buffer, '')).scene
}

function expectInside(bounds: Box3, outline: Vector2[], margin: number) {
  for (const x of [bounds.min.x, bounds.max.x]) for (const z of [bounds.min.z, bounds.max.z]) {
    const corner = new Vector2(x, z)
    outline.forEach((point, i) => {
      const edge = outline[(i + 1) % outline.length].clone().sub(point)
      expect(edge.cross(corner.clone().sub(point)) / edge.length()).toBeGreaterThan(margin)
    })
  }
}

function attributeValues(attribute: BufferAttribute | InterleavedBufferAttribute) {
  return Array.from({ length: attribute.count * attribute.itemSize }, (_, i) => attribute.getComponent(Math.floor(i / attribute.itemSize), i % attribute.itemSize))
}

it.each(getTableBase('u-frame').compatibleShapes)('U-frame supports stay inside %s at all size extremes, preserving joints and section', async (shape) => {
  const base = getTableBase('u-frame')
  const model = await load(base.modelUrl)
  const initial = normalizeTableAssembly({ baseId: base.id, shape })
  const assembly = createTableAssembly(model, initial)
  for (const length of [0.95, 1.65, 0.95]) for (const width of [0.55, 0.8]) for (const baseHeight of [0.64, 0.84, 0.74]) for (const thickness of [0.02, 0.05]) {
    const config = normalizeTableAssembly({ ...initial, length, width, baseHeight, thickness })
    assembly.update(config)
    const outline = createTabletopOutline(config)
    for (const { frame, posts, rail } of base.uFrames!.targets) {
      expect(model.getObjectByName(frame)!.scale.toArray()).toEqual([1, 1, 1])
      const railMesh = model.getObjectByName(rail)!
      const railBox = new Box3().setFromObject(railMesh)
      expect(railBox.min.y).toBeCloseTo(0, 6)
      expect(railBox.max.y).toBeCloseTo(0.025, 6)
      expect(railBox.max.x - railBox.min.x).toBeCloseTo(0.025, 6)
      for (const name of posts) {
        const post = model.getObjectByName(name)!
        const box = new Box3().setFromObject(post)
        const size = box.getSize(new Vector3())
        expect(post.scale.toArray()).toEqual([1, 1, 1])
        expect(box.min.y).toBeCloseTo(railBox.max.y, 6)
        expect(box.max.y).toBeCloseTo(baseHeight, 6)
        expect(size.x).toBeCloseTo(0.025, 6)
        expect(size.z).toBeCloseTo(0.025, 6)
        expectInside(box, outline, 0.02)
        const center = box.getCenter(new Vector3())
        const contact = new Raycaster(new Vector3(center.x, baseHeight + 0.1, center.z), new Vector3(0, -1, 0)).intersectObject(post, true)
        expect(contact[0].point.y).toBeCloseTo(baseHeight, 6)
        // Перекладина до внешнего края стойки, включая предельную ширину.
        if (center.z > 0) expect(railBox.max.z).toBeCloseTo(box.max.z, 6)
        else expect(railBox.min.z).toBeCloseTo(box.min.z, 6)
      }
    }
    const top = new Box3().setFromObject(assembly.top)
    expect(top.min.y).toBeCloseTo(baseHeight, 6)
    expect(top.max.y).toBeCloseTo(baseHeight + thickness, 6)
  }
  assembly.dispose()
})

it('U-frame returns to the same geometry after repeated width, height, shape and material changes', async () => {
  const base = getTableBase('u-frame')
  const model = await load(base.modelUrl)
  const originals = new Map<string, { position: number[]; normals: number[] }>()
  model.traverse((node) => {
    if (node instanceof Mesh) originals.set(node.name, {
      position: attributeValues(node.geometry.getAttribute('position')),
      normals: attributeValues(node.geometry.getAttribute('normal')),
    })
  })
  const initial = normalizeTableAssembly({ baseId: base.id, shape: 'rectangle' })
  const assembly = createTableAssembly(model, initial)
  const capture = () => {
    const result: unknown[] = []
    model.traverse((node) => {
      if (node instanceof Mesh) result.push([node.name, node.position.toArray(), Array.from(node.geometry.getAttribute('position').array)])
    })
    return result
  }
  const before = capture()
  for (let i = 0; i < 4; i++) {
    assembly.update({ ...initial, shape: 'wide-chamfered', width: 0.8, length: 1.65, baseHeight: 0.84 })
    assembly.refreshTextures()
    assembly.update({ ...initial, width: 0.55, baseHeight: 0.64 })
    assembly.update(initial)
  }
  expect(capture()).toEqual(before)
  model.traverse((node) => {
    if (!(node instanceof Mesh)) return
    const original = originals.get(node.name)!
    expect(attributeValues(node.geometry.getAttribute('normal'))).toEqual(original.normals)
    const positions = node.geometry.getAttribute('position')
    // Высота меняет только Y стоек, а ширина — только Z перекладин.
    const rail = node.name.endsWith('BottomRail')
    for (let i = 0; i < positions.count; i++) {
      expect(positions.getX(i)).toBe(original.position[3 * i])
      if (rail) expect(positions.getY(i)).toBe(original.position[3 * i + 1])
      else expect(positions.getZ(i)).toBe(original.position[3 * i + 2])
    }
  })
  assembly.dispose()
})

it.each(getTableBase('v-pedestal').compatibleShapes)('V-pedestal mount fits under %s with a margin and without changing support angles', async (shape) => {
  const base = getTableBase('v-pedestal')
  const model = await load(base.modelUrl)
  const initial = normalizeTableAssembly({ baseId: base.id, shape })
  const assembly = createTableAssembly(model, initial)
  const mount = model.getObjectByName('UnderTop_Mount')!
  const before = new Box3().setFromObject(model)
  const original = model.toJSON()
  const sizes = shape === 'circle' ? base.diameter! : base.length
  for (const length of [sizes.min, sizes.max]) for (const width of [base.width.min, base.width.max]) for (const thickness of [0.02, 0.05]) {
    const config = normalizeTableAssembly({ ...initial, length, width, thickness, baseHeight: 0.84 })
    assembly.update(config)
    expect(config.baseId).toBe(base.id)
    expect(config.baseHeight).toBe(0.743)
    expect(new Box3().setFromObject(model)).toEqual(before)
    expect(model.toJSON()).toEqual(original)
    const box = new Box3().setFromObject(mount)
    expectInside(box, createTabletopOutline(config), 0.02)
    expect(box.max.y).toBeCloseTo(new Box3().setFromObject(assembly.top).min.y, 6)
    expect(before.min.y).toBeCloseTo(0, 6)
  }
  assembly.dispose()
})

it.each([
  ['u-frame', '/models/table-02-u-frame.glb'],
  ['v-pedestal', '/models/table-04-v-pedestal.glb'],
])('%s extraction retains source geometry/transforms and removes every original top surface', async (baseId, sourceUrl) => {
  const base = getTableBase(baseId)
  const model = await load(base.modelUrl)
  const source = await load(sourceUrl)
  let meshes = 0
  model.traverse((node) => {
    expect(node.name === 'TableTop' || node.name.startsWith('Top_')).toBe(false)
    if (!(node instanceof Mesh)) return
    meshes++
    const original = source.getObjectByName(node.name) as Mesh
    expect(original).toBeInstanceOf(Mesh)
    expect(node.matrix.toArray()).toEqual(original.matrix.toArray())
    expect(node.getWorldPosition(new Vector3())).toEqual(original.getWorldPosition(new Vector3()))
    for (const key of Object.keys(original.geometry.attributes)) {
      expect(Array.from(node.geometry.getAttribute(key).array)).toEqual(Array.from(original.geometry.getAttribute(key).array))
    }
    expect(node.geometry.index ? attributeValues(node.geometry.index) : null).toEqual(original.geometry.index ? attributeValues(original.geometry.index) : null)
    expect((node.material as MeshStandardMaterial).name).toBe((original.material as MeshStandardMaterial).name)
  })
  expect(meshes).toBe(6)
})

it.each(['u-frame', 'v-pedestal'])('%s changes every metal part independently of the top', async (baseId) => {
  const base = getTableBase(baseId)
  const model = await load(base.modelUrl)
  const config = normalizeTableAssembly({ baseId })
  const assembly = createTableAssembly(model, config)
  const controller = createFurnitureMaterialController(assembly.group, assembly.materialDefinition, { onMaterialsChanged: assembly.refreshTextures })
  const topMaterials = assembly.top.material
  await controller.setFinish('baseFinish', 'metal-white-matte')
  const whites: number[] = []
  model.traverse((node) => {
    if (node instanceof Mesh) whites.push((node.material as MeshStandardMaterial).color.getHex())
  })
  expect(whites).toHaveLength(6)
  expect(new Set(whites).size).toBe(1)
  await controller.setFinish('baseFinish', 'metal-black-matte')
  model.traverse((node) => {
    if (node instanceof Mesh) expect((node.material as MeshStandardMaterial).color.getHex()).not.toBe(whites[0])
  })
  expect(assembly.top.material).toBe(topMaterials)
  controller.dispose()
  assembly.dispose()
})
