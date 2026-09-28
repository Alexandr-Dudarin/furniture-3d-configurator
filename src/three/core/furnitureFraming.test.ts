import { expect, it } from 'vitest'
import { PerspectiveCamera, Vector3, MathUtils } from 'three'
import { combineFurnitureFrames, createFurnitureFraming, fitFurnitureFrame } from './furnitureFraming'
import { getFurnitureDefinition, getFurnitureDefinitions } from '../../configurator/furnitureRegistry'

const definitions = getFurnitureDefinitions().filter(model => model.category === 'wardrobes')
const sharedFrame = combineFurnitureFrames(definitions.map(model => model.framing))!

it('fits all maximum wardrobe corners in desktop and portrait viewports', () => {
  for (const aspect of [1.8, 1.1, .6]) {
    const fov = MathUtils.radToDeg(2 * Math.atan(Math.tan(MathUtils.degToRad(45) / 2) / Math.min(1, aspect)))
    const camera = new PerspectiveCamera(fov, aspect, .1, 100)
    const controls = { target: new Vector3(), maxDistance: 5, update: () => true }
    fitFurnitureFrame(camera, controls, sharedFrame)
    camera.updateMatrixWorld()
    for (const { framing: frame } of definitions) {
      for (const x of [-frame!.width / 2, frame!.width / 2]) for (const y of [0, frame!.height]) for (const z of [-frame!.depth / 2, frame!.depth / 2]) {
        const point = new Vector3(x, y, z).project(camera)
        expect(Math.abs(point.x)).toBeLessThan(.821)
        expect(Math.abs(point.y)).toBeLessThan(.821)
        expect(point.z).toBeGreaterThan(-1); expect(point.z).toBeLessThan(1)
      }
    }
  }
})

it('uses the same initial scale regardless of which wardrobe is selected first', () => {
  const views = definitions.map(model => {
    const camera = new PerspectiveCamera(45, 1.4, .1, 100)
    const controls = { target: new Vector3(), maxDistance: 5, update: () => true }
    createFurnitureFraming(camera, controls).select(model.id, sharedFrame)
    return [camera.position.toArray(), controls.target.toArray(), controls.maxDistance]
  })
  for (const view of views) expect(view).toEqual(views[0])
})

it('preserves an adjusted orbit, zoom and pan across wardrobes, and restores the table view', () => {
  const camera = new PerspectiveCamera(45, 1.4, .1, 100)
  camera.position.set(1.2, 1.6, 2.6)
  const controls = { target: new Vector3(0, .5, 0), maxDistance: 5, update: () => true }
  camera.lookAt(controls.target)
  const state = () => [camera.position.toArray(), camera.quaternion.toArray(), controls.target.toArray(), controls.maxDistance, camera.zoom]
  const tableView = state(), framing = createFurnitureFraming(camera, controls)
  framing.select('table')
  framing.select('wardrobe-15-katania-four-door', sharedFrame)
  // An orbit, dolly and pan chosen by the user, with a stable physical reference.
  camera.position.set(-2.2, 2.1, 4)
  controls.target.set(.18, 1.2, .06)
  controls.maxDistance = 12
  camera.lookAt(controls.target); camera.updateMatrixWorld()
  const adjusted = state(), reference = new Vector3(0, 2.022, 0).project(camera).toArray()
  for (const model of definitions) {
    framing.select(model.id, sharedFrame)
    expect(state()).toEqual(adjusted)
    camera.updateMatrixWorld()
    expect(new Vector3(0, 2.022, 0).project(camera).toArray()).toEqual(reference)
  }
  // A genuinely taller point remains higher when measured in the same plane.
  expect(new Vector3(0, 2.052, 0).project(camera).y).toBeGreaterThan(reference[1])
  framing.select('builder')
  expect(state()).toEqual(tableView)
})

it('centres each dresser and keeps its bottom visible during a useful zoom', () => {
  for (const model of getFurnitureDefinitions().filter(d => d.category === 'dressers')) {
    for (const aspect of [1.5, .65]) {
      const camera = new PerspectiveCamera(45, aspect, .1, 100)
      const controls = { target: new Vector3(), maxDistance: 5, update: () => true }
      const framing = createFurnitureFraming(camera, controls)
      const height = model.dimensions.height.base, width = model.dimensions.width.base, depth = model.dimensions.depth.base
      framing.select('wardrobe', sharedFrame, 'wardrobes')
      framing.select(model.id, model.framing, model.id, height / 2)
      expect(controls.target.toArray()).toEqual([0, height / 2, 0])
      // Dolly towards the body, not the wardrobe's high orbit target.
      camera.position.sub(controls.target).multiplyScalar(.82).add(controls.target)
      camera.updateMatrixWorld()
      const center = new Vector3(0, height / 2, 0).project(camera)
      expect(center.x).toBeCloseTo(0, 8); expect(center.y).toBeCloseTo(0, 8)
      for (const x of [-width / 2, width / 2]) for (const y of [0, height]) for (const z of [-depth / 2, depth / 2]) {
        const p = new Vector3(x, y, z).project(camera)
        expect(Math.abs(p.y)).toBeLessThan(.99)
      }
    }
  }
})

it('remembers wardrobe and individual dresser views; height follows the body without changing zoom or pan', () => {
  const camera = new PerspectiveCamera(45, 1.5, .1, 100)
  const controls = { target: new Vector3(), maxDistance: 5, update: () => true }
  const framing = createFurnitureFraming(camera, controls)
  const dresser = getFurnitureDefinition('dresser-12-brooklyn-six-drawer')
  framing.select('chelsea', sharedFrame, 'wardrobes')
  camera.position.set(-2, 2, 4); controls.target.set(.1, 1.25, .2)
  camera.lookAt(controls.target)
  const wardPosition = camera.position.clone(), wardTarget = controls.target.clone()
  framing.select(dresser.id, dresser.framing, dresser.id, .34)
  camera.position.set(1.5, .9, 2.8); controls.target.set(.08, .32, -.04)
  const offset = camera.position.clone().sub(controls.target), dresserTarget = controls.target.clone()
  framing.select(dresser.id, dresser.framing, dresser.id, .45)
  expect(camera.position.clone().sub(controls.target).distanceTo(offset)).toBeLessThan(1e-9)
  expect(controls.target.distanceTo(dresserTarget.clone().add(new Vector3(0, .11, 0)))).toBeLessThan(1e-9)
  const dresserPosition = camera.position.clone(), target = controls.target.clone()
  framing.select('katania', sharedFrame, 'wardrobes')
  expect(camera.position).toEqual(wardPosition); expect(controls.target).toEqual(wardTarget)
  framing.select(dresser.id, dresser.framing, dresser.id, .45)
  expect(camera.position).toEqual(dresserPosition); expect(controls.target).toEqual(target)
  framing.select('baikal', { width: .6, height: 1.2, depth: .5 }, 'baikal', .515)
  expect(controls.target.y).toBe(.515)
  framing.select(dresser.id, dresser.framing, dresser.id, .45)
  expect(camera.position).toEqual(dresserPosition)
})

it('fits a six-metre wardrobe row and resets a user orbit without affecting the catalogue view', () => {
  for (const aspect of [2, .6]) {
    const camera = new PerspectiveCamera(45, aspect, .1, 100)
    const controls = { target: new Vector3(), maxDistance: 5, update: () => true }
    const framing = createFurnitureFraming(camera, controls)
    framing.select('catalogue', sharedFrame, 'wardrobes')
    const catalogue = camera.position.clone()
    framing.select('row', { width: 6, height: 2.6, depth: .65 }, 'wardrobe-assembly', 1.3)
    const initial = camera.position.clone()
    camera.position.set(0, 1.3, 1)
    framing.reset()
    expect(camera.position).toEqual(initial)
    camera.updateMatrixWorld()
    for (const x of [-3, 3]) for (const y of [0, 2.6]) for (const z of [-.325, .325]) {
      const point = new Vector3(x, y, z).project(camera)
      expect(Math.abs(point.x)).toBeLessThan(.821); expect(Math.abs(point.y)).toBeLessThan(.821)
      expect(point.z).toBeLessThan(1)
    }
    framing.select('catalogue', sharedFrame, 'wardrobes')
    expect(camera.position).toEqual(catalogue)
  }
})
