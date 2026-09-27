import { readFile } from 'node:fs/promises'
import { afterEach, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { definition } from '../models/wardrobe-katania-four-door/runtime'
import { createFurnitureController } from '../furniture/furnitureController'
import { createFurnitureMaterialController } from '../materials/materialController'
import { createFurnitureMotion } from '../furniture/furnitureMotion'
import { createFurniturePresentation } from '../furniture/furniturePresentation'
import { disposeFurnitureModel } from '../furniture/model'
import { disposeMaterialFinishCache } from '../materials/createMaterial'
import { createFacadeController } from './facadeController'
import { createSourceFacadeBatch } from './sourceFacadeBatch'

const roots: THREE.Object3D[] = []
const base = { width: 1.6, height: 1.9, depth: .45 }
async function load() {
  class ImageStub extends EventTarget { width = 2; height = 2; set src(_value: string) { queueMicrotask(() => this.dispatchEvent(new Event('load'))) } }
  vi.stubGlobal('self', globalThis); vi.stubGlobal('document', { createElementNS: () => new ImageStub() })
  const root = (await new GLTFLoader().parseAsync(Uint8Array.from(await readFile(`public${definition.modelUrl}`)).buffer, '')).scene
  roots.push(root)
  root.traverse(node => { if (node instanceof THREE.Mesh) { node.castShadow = true; node.receiveShadow = true } })
  const nodes = definition.facades!.targets.map(t => root.getObjectByName(t.panel)!)
  const sources = nodes.map(node => [...node.children] as THREE.Mesh[])
  const controller = createFurnitureController(root, definition), facades = createFacadeController(root, definition)!
  const batches = nodes.map(node => node.getObjectByName(`${node.name}__SourceBatch`) as THREE.Mesh)
  const materials = createFurnitureMaterialController(root, facades.materialDefinition, { onMaterialsChanged: () => {
    controller.refreshTextures(); facades.refreshMaterials()
  } })
  await materials.setFinish('fronts', 'board-graphite-matte')
  controller.setDimensions(base); facades.update(base, 'original')
  return { root, sources, batches, controller, facades, materials }
}
afterEach(() => { roots.splice(0).forEach(disposeFurnitureModel); disposeMaterialFinishCache(); vi.unstubAllGlobals(); vi.restoreAllMocks() })
const visibleMeshes = (root: THREE.Object3D) => { const all: THREE.Mesh[] = []; root.traverseVisible(node => { if (node instanceof THREE.Mesh) all.push(node) }); return all }

// Compare actual indexed triangles, not only bounding boxes. Sharp normals,
// winding and every groove wall must survive merging and parent articulation.
function compare(sources: THREE.Mesh[], batch: THREE.Mesh) {
  let cursor = 0, positionError = 0, normalError = 0, uvError = 0
  const bp = batch.geometry.getAttribute('position'), bn = batch.geometry.getAttribute('normal'), bu = batch.geometry.getAttribute('uv')
  const a = new THREE.Vector3(), b = new THREE.Vector3()
  batch.updateWorldMatrix(true, false)
  const normalB = new THREE.Matrix3().getNormalMatrix(batch.matrixWorld)
  for (const source of sources) {
    source.updateWorldMatrix(true, false)
    const normalA = new THREE.Matrix3().getNormalMatrix(source.matrixWorld)
    const p = source.geometry.getAttribute('position'), n = source.geometry.getAttribute('normal'), uv = source.geometry.getAttribute('uv')
    for (let j = 0; j < (source.geometry.index?.count ?? p.count); j++, cursor++) {
      const si = source.geometry.index?.getX(j) ?? j, bi = batch.geometry.index?.getX(cursor) ?? cursor
      a.fromBufferAttribute(p, si).applyMatrix4(source.matrixWorld); b.fromBufferAttribute(bp, bi).applyMatrix4(batch.matrixWorld)
      positionError = Math.max(positionError, a.distanceTo(b))
      a.fromBufferAttribute(n, si).applyNormalMatrix(normalA); b.fromBufferAttribute(bn, bi).applyNormalMatrix(normalB)
      normalError = Math.max(normalError, a.distanceTo(b))
      uvError = Math.max(uvError, Math.abs(uv.getX(si) - bu.getX(bi)), Math.abs(uv.getY(si) - bu.getY(bi)))
    }
  }
  expect(cursor).toBe(batch.geometry.index?.count ?? bp.count)
  expect(positionError).toBeLessThan(1e-6); expect(normalError).toBeLessThan(1e-6); expect(uvError).toBe(0)
}

it('batches all four actual Katania solid fronts without removing source resize/UV nodes', async () => {
  const { root, sources, batches } = await load()
  const sourceCount = sources.reduce((count, list) => count + list.length, 0)
  expect(sourceCount).toBe(1176)
  expect(batches).toHaveLength(4)
  for (const [i, batch] of batches.entries()) {
    expect(batch.visible).toBe(true); expect(batch.castShadow && batch.receiveShadow).toBe(true)
    expect(sources[i].every(s => !s.visible && !!s.parent)).toBe(true)
    compare(sources[i], batch)
  }
  expect(visibleMeshes(root).length).toBeLessThan(500)
})

it('preserves triangles, normals and click ownership at mixed sizes, partial opening and a transformed scene', async () => {
  const { root, sources, batches, controller, facades } = await load()
  const motion = createFurnitureMotion(root, definition, controller.getDimensions, () => {})
  root.position.set(1, .3, -2); root.rotation.set(.2, -.4, .1); root.scale.setScalar(1.3)
  try {
    for (const dimensions of [base, { width: 2.4, height: 2.7, depth: .6 }, { width: 1.937, height: 2.123, depth: .407 }, base]) {
      motion.setAll(true); motion.update(.19)
      const rotations = definition.articulations!.map(s => root.getObjectByName(s.target)!.quaternion.toArray())
      motion.withClosedPose(() => { controller.setDimensions(dimensions); facades.update(dimensions, 'original') })
      expect(definition.articulations!.map(s => root.getObjectByName(s.target)!.quaternion.toArray())).toEqual(rotations)
      for (const [i, batch] of batches.entries()) {
        compare(sources[i], batch)
        expect(motion.findPart(batch)).toBe(definition.articulations![i].id)
      }
    }
  } finally { motion.dispose() }
})

it('uses original textured meshes and UV bindings for oak, and batches again for a solid colour', async () => {
  const { root, sources, batches, materials, controller, facades } = await load()
  const old = batches[0].material as THREE.Material, disposed = vi.spyOn(old, 'dispose')
  await materials.setFinish('fronts', 'board-white-matte')
  expect(batches.every(b => b.visible)).toBe(true)
  expect(batches[0].material).toBe(sources[0][0].material); expect(disposed).toHaveBeenCalledOnce()
  await materials.setFinish('fronts', 'oak-natural')
  expect(batches.every(b => !b.visible && !b.geometry.getAttribute('position'))).toBe(true)
  expect(sources.flat().every(m => m.visible && (m.material as THREE.MeshStandardMaterial).map)).toBe(true)
  const material = sources[0][0].material as THREE.MeshStandardMaterial
  const repeat = material.map!.repeat.clone()
  controller.setDimensions({ width: 2.2, height: 2.6, depth: .5 }); facades.update(controller.getDimensions(), 'original')
  expect(material.map!.repeat.equals(repeat)).toBe(false)
  expect(visibleMeshes(root).length).toBeGreaterThan(1500)
  await materials.setFinish('fronts', 'board-graphite-matte')
  expect(batches.every(b => b.visible)).toBe(true)
  batches.forEach((b, i) => compare(sources[i], b))
})

it('reuses geometry for colour/depth changes and frees replaced batches once', async () => {
  const { root, batches, materials, controller, facades } = await load()
  const first = batches[0].geometry, disposed = vi.spyOn(first, 'dispose')
  facades.update(base, 'original'); await materials.setFinish('fronts', 'board-white-matte')
  controller.setDimensions({ ...base, depth: .55 }); facades.update(controller.getDimensions(), 'original')
  expect(batches[0].geometry).toBe(first); expect(disposed).not.toHaveBeenCalled()
  controller.setDimensions({ ...base, height: 2.1 }); facades.update(controller.getDimensions(), 'original')
  expect(disposed).toHaveBeenCalledOnce()
  const second = vi.spyOn(batches[0].geometry, 'dispose')
  disposeFurnitureModel(root); roots.splice(roots.indexOf(root), 1)
  expect(second).toHaveBeenCalledOnce(); expect(disposed).toHaveBeenCalledOnce()
})

it('switches facade style and interior view without duplicates or stale hidden bounds', async () => {
  const { root, batches, sources, controller, facades, materials } = await load()
  const presentation = createFurniturePresentation(root, definition)
  const disposed = vi.spyOn(batches[0].geometry, 'dispose')
  facades.update(base, 'frame')
  expect(batches.every(b => !b.visible && !b.geometry.getAttribute('position'))).toBe(true)
  expect(sources.flat().every(s => !s.visible)).toBe(true); expect(disposed).toHaveBeenCalledOnce()
  await materials.setFinish('fronts', 'board-white-matte')
  expect(sources.flat().every(s => !s.visible)).toBe(true)
  controller.setDimensions({ ...base, height: 2.3 }); facades.update(controller.getDimensions(), 'original')
  expect(batches.every(b => b.visible)).toBe(true)
  presentation.setView('interior')
  expect(visibleMeshes(root).some(m => batches.includes(m))).toBe(false)
  await materials.setFinish('fronts', 'board-graphite-matte')
  expect(visibleMeshes(root).some(m => batches.includes(m))).toBe(false)
  presentation.setView('exterior'); expect(visibleMeshes(root).filter(m => batches.includes(m))).toHaveLength(4)
})

it.each(['different-colour', 'normal-map', 'shader-hook', 'negative-scale'] as const)('keeps incompatible source meshes intact: %s', variant => {
  const node = new THREE.Group(); roots.push(node)
  const a = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial())
  const b = new THREE.Mesh(a.geometry, a.material.clone()); node.add(a, b)
  const batch = createSourceFacadeBatch(node, [a, b])!
  batch.refresh(true)
  if (variant === 'different-colour') b.material.color.set('red')
  if (variant === 'normal-map') b.material.normalMap = new THREE.Texture()
  if (variant === 'shader-hook') b.material.onBeforeCompile = () => {}
  if (variant === 'negative-scale') b.scale.x = -1
  batch.refresh(true)
  expect(a.visible && b.visible).toBe(true)
  const combined = node.children[2] as THREE.Mesh
  expect(combined.visible).toBe(false); expect(combined.geometry.getAttribute('position')).toBeUndefined()
})

it('prepares metric relief on real Katania source, batch and wood paths across resize/opening', async () => {
  const { root, batches, materials, facades, controller, sources } = await load()
  for (const b of batches) {
    const data = b.geometry.getAttribute('facadeRelief')
    expect(data).toBeDefined(); expect(data.getZ(0)).toBeCloseTo(.003, 8)
    expect(b.customDepthMaterial).toBeDefined()
  }
  await materials.setFinish('fronts', 'oak-natural')
  expect(sources.flat().every(m => m.geometry.hasAttribute('facadeRelief') && m.customDepthMaterial)).toBe(true)
  controller.setDimensions({ width: 2.4, height: 2.7, depth: .6 }); facades.update(controller.getDimensions(), 'original')
  for (const source of sources.flat()) {
    const data = source.geometry.getAttribute('facadeRelief')
    // Land width and panel height resize; the metric sampling width does not.
    expect(data.getZ(0) * source.scale.x).toBeCloseTo(.003, 7)
    expect(data.getW(0) * source.scale.y).toBeCloseTo(.003, 7)
  }
  await materials.setFinish('fronts', 'board-white-matte')
  expect(batches.every(b => b.visible && b.geometry.hasAttribute('facadeRelief'))).toBe(true)
  const geometry = batches[0].geometry
  const motion = createFurnitureMotion(root, definition, controller.getDimensions, () => {})
  motion.setAll(true); motion.update(.1)
  expect(batches[0].geometry).toBe(geometry)
  expect(motion.findPart(batches[0])).toBe(definition.articulations![0].id)
  motion.dispose()
})
