import { readFile } from 'node:fs/promises'
import { afterEach, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OBB } from 'three/addons/math/OBB.js'
import { getFurnitureDefinitions } from '../../configurator/furnitureRegistry'
import { createFurnitureController } from './furnitureController'
import { createFurnitureMotion } from './furnitureMotion'
import { disposeFurnitureModel } from './model'

const models = getFurnitureDefinitions().filter(d => d.articulations?.length)
afterEach(() => vi.unstubAllGlobals())
const bounds = (node: THREE.Object3D) => new THREE.Box3().setFromObject(node, true)

// Test actual exported triangles, including bevels, rather than only touching boxes.
function checkContact(front: THREE.Object3D, part: THREE.Object3D) {
  const box = bounds(part), size = box.getSize(new THREE.Vector3())
  for (const [u, v] of [[.25, .5], [.5, .5], [.75, .5], [.5, .25], [.5, .75]]) {
    const x = box.min.x + size.x * u, y = box.min.y + size.y * v
    const backRay = new THREE.Raycaster(new THREE.Vector3(x, y, box.max.z + .005), new THREE.Vector3(0, 0, -1))
    const frontRay = new THREE.Raycaster(new THREE.Vector3(x, y, box.max.z - .005), new THREE.Vector3(0, 0, 1))
    const boxFace = backRay.intersectObject(part, true)[0]
    const facadeBack = frontRay.intersectObject(front, true)[0]
    expect(boxFace, `${part.name}: missing contact surface`).toBeDefined()
    expect(facadeBack, `${front.name}: missing rear surface`).toBeDefined()
    expect(Math.abs(facadeBack.point.z - boxFace.point.z), `${part.name}: facade must meet box within 0.1 mm`).toBeLessThan(.0001)
  }
}

it.each(models)('$id keeps drawer contacts and door clearance throughout opening and resize', async catalogue => {
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
  const motion = createFurnitureMotion(root, definition, resize.getDimensions, () => {})
  const dimensions = (bound: 'min' | 'max' | 'base') => Object.fromEntries(Object.entries(definition.dimensions).map(([key, d]) => [key, d[bound]]))
  const min = dimensions('min'), max = dimensions('max'), base = dimensions('base')
  const cases = [base, min, max, { ...max, depth: min.depth }, { ...min, depth: max.depth }, base]
  const find = (name: string) => {
    const node = root.getObjectByName(name)
    expect(node, name).toBeDefined()
    return node!
  }
  try {
    for (const values of cases) {
      // Resize while open, then inspect the exact closed pose and repeat opening.
      motion.withClosedPose(() => resize.setDimensions(values))
      motion.setAll(false, true)
      root.updateMatrixWorld(true)
      const carcass: OBB[] = []
      find('Carcass_Assembly').traverse(node => {
        if (node.userData.kind === 'board') carcass.push(new OBB().fromBox3(bounds(node)))
      })
      expect(carcass.length).toBeGreaterThan(0)
      for (const spec of definition.articulations!) {
        const assembly = find(spec.target)
        if (spec.kind !== 'door') continue
        const facade = assembly.children.find(n => /_(Front|Panel)$/.test(n.name))!
        const panel = facade.getObjectByName(facade.name + '_Core') ?? facade
        const closedBox = bounds(panel), pivot = assembly.getWorldPosition(new THREE.Vector3())
        expect(Math.abs(pivot.z - closedBox.min.z), `${spec.target}: axis must lie at rear face`).toBeLessThan(.0001)
        const inverseClosed = assembly.matrixWorld.clone().invert()
        for (let degrees = 0; degrees <= Math.abs(spec.angle); degrees += 5) {
          assembly.rotation.y = THREE.MathUtils.degToRad(degrees * Math.sign(spec.angle))
          root.updateMatrixWorld(true)
          const transform = assembly.matrixWorld.clone().multiply(inverseClosed)
          const door = new OBB().fromBox3(closedBox).applyMatrix4(transform)
          // 0.1 mm inset excludes numerical/bevel-only contact, but catches penetration.
          door.halfSize.addScalar(-.0001)
          for (const fixed of carcass) expect(door.intersectsOBB(fixed), `${spec.target}: carcass collision at ${degrees}°`).toBe(false)
        }
        assembly.rotation.y = 0
      }
      // Paused animation at 0%, 50%, 100%: all four box parts meet the rear of the facade.
      for (const step of [0, .24, .24]) {
        if (step) { motion.setAll(true); motion.update(step) }
        root.updateMatrixWorld(true)
        for (const spec of definition.articulations!) {
          if (spec.kind !== 'drawer') continue
          const prefix = spec.target.replace(/_Assembly$/, '')
          const front = find(prefix + '_Front')
          for (const suffix of ['Bottom', 'Side_Left', 'Side_Right', 'Inner_Front']) checkContact(front, find(prefix + '_' + suffix))
        }
      }
    }
  } finally { motion.dispose(); disposeFurnitureModel(root) }
}, 30000)
