import { expect, it } from 'vitest'
import { Box3, PerspectiveCamera, Vector3 } from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { normalizeWardrobeAssembly } from '../../configurator/wardrobeAssembly/state'
import { createWardrobeAssembly } from '../wardrobeAssembly/wardrobeAssembly'
import { CAMERA_CLEARANCE, createCameraClearance } from './cameraClearance'
import { createFurnitureFraming } from './furnitureFraming'

const body = () => new Box3(new Vector3(-.5, 0, -.4), new Vector3(.5, 2.2, .4))
function setup(position = new Vector3(0, 1, 2), aspect = 1.5) {
  const camera = new PerspectiveCamera(45, aspect, .1, 100)
  camera.position.copy(position)
  const controls = new OrbitControls(camera)
  controls.target.set(0, 1, 0); controls.update()
  return { camera, controls, guard: createCameraClearance(camera, controls) }
}

it('stops a fast zoom before the facade, preserves aim and settles without idle corrections', () => {
  const { camera, controls, guard } = setup(), box = body()
  guard.attach(() => [box])
  camera.position.z = -.8 // One wheel burst would cross the entire carcass.
  const direction = camera.position.clone().sub(controls.target)
  expect(guard.update()).toBe(true)
  expect(camera.position.z).toBeGreaterThan(box.max.z + CAMERA_CLEARANCE)
  expect(camera.position.clone().sub(controls.target).distanceTo(direction)).toBeLessThan(1e-10)
  for (let i = 0; i < 20; i++) { controls.update(); expect(guard.update()).toBe(false) }
})

it('blocks entry from the side, back and top, including zoom-to-cursor targets inside a drawer', () => {
  const box = body(), centre = box.getCenter(new Vector3())
  for (const axis of [new Vector3(1, 0, 0), new Vector3(-1, 0, 0), new Vector3(0, 0, -1), new Vector3(0, 1, 0)]) {
    const { camera, controls, guard } = setup(centre.clone().addScaledVector(axis, 4))
    controls.target.copy(centre); camera.lookAt(centre)
    guard.attach(() => [box])
    camera.position.copy(centre)
    expect(guard.update()).toBe(true)
    expect(box.distanceToPoint(camera.position)).toBeGreaterThanOrEqual(CAMERA_CLEARANCE)
  }
})

it('permits close handle inspection and sideways pan along the front of the assembly', () => {
  const { camera, controls, guard } = setup(), box = body()
  guard.attach(() => [box])
  camera.position.set(0, 1, .65)
  expect(guard.update()).toBe(false)
  camera.position.x += .2; controls.target.x += .2
  expect(guard.update()).toBe(false)
  expect(camera.position.z - box.max.z).toBeCloseTo(.25, 8)
})

it('protects all near-plane corners at oblique angles and extreme viewport shapes', () => {
  for (const aspect of [.5, 1.5, 4]) {
    const { camera, controls, guard } = setup(new Vector3(2, 2, 2), aspect), box = body()
    camera.near = .2; camera.updateProjectionMatrix()
    guard.attach(() => [box])
    camera.position.set(0, 1, .3)
    camera.lookAt(controls.target); guard.update(); camera.updateMatrixWorld()
    for (const x of [-1, 0, 1]) for (const y of [-1, 0, 1]) {
      expect(box.containsPoint(new Vector3(x, y, -1).unproject(camera))).toBe(false)
    }
  }
})

it('moves the camera outward if a drawer opens into it, without repeated pushes after stopping', () => {
  const { camera, controls, guard } = setup(new Vector3(0, 1, .9)), drawer = body()
  guard.attach(() => [drawer]); expect(guard.update()).toBe(false)
  drawer.max.z = 1.1
  expect(guard.update()).toBe(true)
  expect(camera.position.z).toBeGreaterThan(1.3)
  for (let i = 0; i < 20; i++) { controls.update(); expect(guard.update()).toBe(false) }
})

it('resolves overlapping section/drawer volumes and leaves space between separated sections usable', () => {
  const { camera, controls, guard } = setup(new Vector3(0, 1, .7))
  const boxes = [body(), body().translate(new Vector3(0, 0, .6))]
  guard.attach(() => boxes)
  expect(guard.update()).toBe(true)
  for (const box of boxes) expect(box.distanceToPoint(camera.position)).toBeGreaterThan(CAMERA_CLEARANCE)
  boxes[0].translate(new Vector3(-2, 0, 0)); boxes[1].translate(new Vector3(2, 0, 0))
  camera.position.set(0, 1, .1); controls.target.set(0, 1, -.5)
  expect(guard.update()).toBe(false)
})

it('detaches the assembly guard without restricting catalogue cameras or removing a newer provider', () => {
  const { camera, guard } = setup()
  const stopOld = guard.attach(() => [body()]), stopNew = guard.attach(() => [body()])
  stopOld(); camera.position.z = 0
  expect(guard.update()).toBe(true)
  stopNew(); camera.position.z = 0
  expect(guard.update()).toBe(false)
  expect(camera.position.z).toBe(0)
})

it('lets fit-all deliberately reset a view without treating it as a drag through the furniture', () => {
  const { camera, controls, guard } = setup()
  const framing = createFurnitureFraming(camera, controls, guard.reset)
  const box = body()
  guard.attach(() => [box])
  framing.select('row', { width: 1, height: 2.2, depth: .8 }, 'wardrobe-assembly')
  camera.position.set(0, 1, -2); guard.reset()
  framing.reset()
  const fitted = camera.position.clone()
  expect(guard.update()).toBe(false)
  expect(camera.position).toEqual(fitted)
})

it('uses filled real section/drawer bounds, follows opening and resizing, and releases removed drawers', () => {
  const config = normalizeWardrobeAssembly({ sections: [
    { id: 'section-1', width: .6, height: 2.2, depth: .8, rod: true, shelves: 1,
      drawers: { count: 2, height: .25, placement: 'flush', handle: 'edge-pull' } },
  ] })
  const assembly = createWardrobeAssembly(config)
  const closed = assembly.getCameraObstacles().map(box => box.clone())
  expect(closed).toHaveLength(3)
  const group = assembly.group.getObjectByName('section-1/Drawer_1')!
  const closedDrawer = new Box3().setFromObject(group, true)
  expect(closed.some(box => box.min.distanceTo(closedDrawer.min) < 1e-7 && box.max.distanceTo(closedDrawer.max) < 1e-7)).toBe(true)
  assembly.motion.setAll(true, true)
  const openDrawer = new Box3().setFromObject(group, true)
  const open = assembly.getCameraObstacles()
  expect(openDrawer.max.z).toBeGreaterThan(closedDrawer.max.z + .4)
  expect(open.some(box => box.min.distanceTo(openDrawer.min) < 1e-7 && box.max.distanceTo(openDrawer.max) < 1e-7)).toBe(true)
  const { camera, controls, guard } = setup(new Vector3(0, .2, 2))
  controls.target.copy(openDrawer.getCenter(new Vector3()))
  guard.attach(assembly.getCameraObstacles)
  camera.position.copy(controls.target)
  expect(guard.update()).toBe(true)
  for (const box of open) expect(box.distanceToPoint(camera.position)).toBeGreaterThanOrEqual(CAMERA_CLEARANCE)
  config.sections[0].drawers = undefined
  config.sections[0].depth = .4
  assembly.update(config)
  expect(assembly.getCameraObstacles()).toHaveLength(1)
  expect(assembly.getCameraObstacles()[0].getSize(new Vector3()).z).toBeCloseTo(.4, 6)
  assembly.dispose(); expect(assembly.getCameraObstacles()).toHaveLength(0)
})
