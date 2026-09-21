import { readFile } from 'node:fs/promises'
import { afterEach, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { getFurnitureDefinitions } from '../../configurator/furnitureRegistry'
import { createFurnitureController } from './furnitureController'
import { createFurnitureMotion } from './furnitureMotion'
import { createFurniturePresentation } from './furniturePresentation'
import { createFurnitureMaterialController } from '../materials/materialController'
import { disposeMaterialFinishCache } from '../materials/createMaterial'
import { disposeFurnitureModel } from './model'

const models = getFurnitureDefinitions().filter(d => d.articulations?.length)
afterEach(() => { disposeMaterialFinishCache(); vi.unstubAllGlobals() })
function stubImages() {
  class ImageStub extends EventTarget {
    width = 2; height = 2
    set src(_value: string) { queueMicrotask(() => this.dispatchEvent(new Event('load'))) }
  }
  vi.stubGlobal('self', globalThis)
  vi.stubGlobal('document', { createElementNS: () => new ImageStub() })
}

it.each(models)('$id moves complete assemblies and retains closed geometry/UV at min, max and base', async catalogue => {
  stubImages()
  const definition = await catalogue.loadRuntime!()
  const bytes = await readFile(`public${definition.modelUrl}`)
  const root = (await new GLTFLoader().parseAsync(Uint8Array.from(bytes).buffer, '')).scene
  const resize = createFurnitureController(root, definition)
  const motion = createFurnitureMotion(root, definition, resize.getDimensions, () => {})
  const presentation = createFurniturePresentation(root, definition)
  const finishes = createFurnitureMaterialController(root, definition, {
    onMaterialsChanged: () => motion.withClosedPose(resize.refreshTextures),
  })
  const pose = () => definition.articulations!.map(p => {
    const n = root.getObjectByName(p.target)!
    return { position: n.position.toArray(), quaternion: n.quaternion.toArray() }
  })
  try {
    for (const bound of ['min', 'max', 'base'] as const) {
      const dimensions = Object.fromEntries(Object.entries(definition.dimensions).map(([key, d]) => [key, d[bound]]))
      motion.withClosedPose(() => resize.setDimensions(dimensions))
      motion.setAll(false, true)
      const closed = pose()
      motion.setAll(true); motion.update(.24)
      for (const [index, spec] of definition.articulations!.entries()) {
        const node = root.getObjectByName(spec.target)!
        expect(node.children.length).toBeGreaterThan(0)
        if (spec.kind === 'door') expect(node.rotation.y).toBeCloseTo(THREE.MathUtils.degToRad(spec.angle) / 2, 6)
        else expect(node.position.z).toBeGreaterThan(closed[index].position[2])
        // Every handle, front, drawer side and decorative element belongs to the same articulation.
        node.traverse(child => expect(motion.findPart(child)).toBe(spec.id))
      }
      // A material refresh during animation must not capture an already opened pose.
      await finishes.setFinishes({ ...finishes.getSelections(), fronts: bound === 'max' ? 'oak-natural' : 'board-white-matte' })
      motion.update(.24)
      for (const [index, spec] of definition.articulations!.entries()) {
        const node = root.getObjectByName(spec.target)!
        if (spec.kind === 'door') expect(node.quaternion.angleTo(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), THREE.MathUtils.degToRad(spec.angle)))).toBeCloseTo(0, 6)
        else {
          const t = spec.travel
          const expected = Math.min(t.max, (t.baseLength + (dimensions.depth - definition.dimensions.depth.base) * t.factor) * t.ratio)
          expect(node.position.z - closed[index].position[2]).toBeCloseTo(expected, 7)
        }
      }
      // Resize while fully open, return to this bound: no accumulated offset.
      const other = { ...dimensions, width: definition.dimensions.width.max, depth: definition.dimensions.depth.min }
      motion.withClosedPose(() => resize.setDimensions(other))
      motion.withClosedPose(() => resize.setDimensions(dimensions))
      for (let i = 0; i < 4; i++) motion.withClosedPose(resize.refreshTextures)
      motion.setAll(false); motion.update(1)
      expect(pose()).toEqual(closed)
      const bounds = new THREE.Box3().setFromObject(root, true)
      const size = bounds.getSize(new THREE.Vector3())
      expect(size.x).toBeCloseTo(dimensions.width, 5)
      expect(size.y).toBeCloseTo(dimensions.height, 5)
      expect(size.z).toBeCloseTo(dimensions.depth, 5)
      expect(bounds.min.y).toBeCloseTo(0, 5)
    }
    motion.setAll(true, true)
    presentation.setView('interior'); motion.syncVisibility()
    for (const s of motion.getStates()) {
      const spec = definition.articulations!.find(p => p.id === s.id)!
      if (definition.interiorView && spec.kind === 'door') expect(s).toMatchObject({ open: false, enabled: false })
    }
    motion.setAll(true, true)
    for (const s of motion.getStates().filter(s => !s.enabled)) expect(s.open).toBe(false)
    presentation.setView('exterior'); motion.syncVisibility()
    expect(motion.getStates().every(s => s.enabled)).toBe(true)
  } finally { motion.dispose(); presentation.dispose(); finishes.dispose(); disposeFurnitureModel(root) }
}, 30000)

it('reverses from its current pose and honours reduced motion without a jump on repeated commands', () => {
  const root = new THREE.Group(), door = new THREE.Group()
  door.name = 'door'; root.add(door)
  const definition = { ...models[0], articulations: [{ id: 'door', target: 'door', label: 'Door', kind: 'door' as const, angle: -105 }] }
  const motion = createFurnitureMotion(root, definition, () => ({}), () => {})
  motion.toggle('door'); motion.update(.2)
  const partial = door.rotation.y
  expect(partial).toBeLessThan(0)
  motion.toggle('door'); expect(door.rotation.y).toBeCloseTo(partial)
  motion.update(.1); expect(door.rotation.y).toBeGreaterThan(partial)
  motion.toggle('door'); motion.setReducedMotion(true)
  expect(door.quaternion.angleTo(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), THREE.MathUtils.degToRad(-105)))).toBeCloseTo(0, 6)
  motion.toggle('door'); expect(door.rotation.y).toBe(0)
  motion.dispose(); motion.toggle('door'); motion.update(1); expect(door.rotation.y).toBe(0)
})
