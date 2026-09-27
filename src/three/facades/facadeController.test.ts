import { readFile } from 'node:fs/promises'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { getFurnitureDefinition, getFurnitureDefinitions } from '../../configurator/furnitureRegistry'
import { createFurnitureController } from '../furniture/furnitureController'
import { createFurnitureMotion } from '../furniture/furnitureMotion'
import { createFurniturePresentation } from '../furniture/furniturePresentation'
import { disposeFurnitureModel } from '../furniture/model'
import { createFurnitureMaterialController } from '../materials/materialController'
import { createFacadeController } from './facadeController'
import * as facadeGeometry from './facadeGeometry'
import type { FacadeTarget } from './types'

const roots: THREE.Object3D[] = []
async function load(id: string) {
  class ImageStub extends EventTarget { width = 2; height = 2; set src(_v: string) { queueMicrotask(() => this.dispatchEvent(new Event('load'))) } }
  vi.stubGlobal('self', globalThis); vi.stubGlobal('document', { createElementNS: () => new ImageStub() })
  const definition = await getFurnitureDefinition(id).loadRuntime!()
  const root = (await new GLTFLoader().parseAsync(Uint8Array.from(await readFile(`public${definition.modelUrl}`)).buffer, '')).scene
  roots.push(root)
  const controller = createFurnitureController(root, definition), facades = createFacadeController(root, definition)!
  return { definition, root, controller, facades }
}
afterEach(() => { roots.splice(0).forEach(disposeFurnitureModel); vi.unstubAllGlobals(); vi.restoreAllMocks() })

it.each(getFurnitureDefinitions().filter(d => d.facades?.styles.includes('herringbone-wide')))(
  '$id aligns actual surfaces in the closed envelope and keeps that phase through motion and scene transforms', async ({ id }) => {
    const { root, definition, controller, facades } = await load(id), spec = definition.facades!, profile = spec.herringbone!
    const motion = createFurnitureMotion(root, definition, controller.getDimensions, () => {})
    const meshes = spec.targets.map(t => root.getObjectByName(`${t.panel}__Facade`) as THREE.Mesh)
    const material = new THREE.MeshBasicMaterial()
    const verifyPhase = () => {
      root.updateWorldMatrix(true, true)
      const inverse = root.matrixWorld.clone().invert()
      const boxes = meshes.map(mesh => mesh.geometry.boundingBox!.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse, mesh.matrixWorld)))
      for (const [i, mesh] of meshes.entries()) {
        const envelope = boxes.reduce((bounds, b, j) => spec.targets[j].compositionGroup === spec.targets[i].compositionGroup ? bounds.union(b) : bounds, new THREE.Box3())
        const origin = envelope.getCenter(new THREE.Vector3())
        const center = boxes[i].getCenter(new THREE.Vector3()).sub(origin), size = boxes[i].getSize(new THREE.Vector3())
        const local = new THREE.Mesh(mesh.geometry, material)
        let probes = 0
        // A short drawer can fall between the four probes used on tall doors.
        // Sweep more x positions so the test actually samples its grooves.
        const fractions = size.y < .3 ? Array.from({ length: 15 }, (_, n) => -.35 + n * .05) : [-.3, -.15, .15, .3]
        for (const f of fractions) {
          const x = size.x * f, worldX = x + center.x
          if (Math.abs(worldX) < profile.centerGap / 2 + .03 || Math.abs(x) < (spec.targets[i].flutedClearCenter ?? 0) / 2 + .015) continue
          for (let k = -40; k <= 40; k++) {
            const y = -Math.abs(worldX) - k * profile.pitch / Math.SQRT1_2 - center.y
            if (Math.abs(y) > size.y / 2 - profile.endMargin - .03) continue
            const [hit] = new THREE.Raycaster(new THREE.Vector3(x, y, .1), new THREE.Vector3(0, 0, -1)).intersectObject(local)
            expect(hit, `${id}/${spec.targets[i].panel}`).toBeDefined()
            expect(hit.point.z).toBeCloseTo(spec.targets[i].thickness / 2 - profile.depth, 7)
            probes++
            if (size.y < .3) break
          }
        }
        expect(probes, `${id}/${spec.targets[i].panel}`).toBeGreaterThan(0)
      }
    }
    try {
      for (const fraction of [0, .37, 1]) {
        const dimensions = Object.fromEntries(Object.entries(definition.dimensions).map(([k, r]) => [k, r.min + (r.max - r.min) * fraction]))
        motion.withClosedPose(() => { controller.setDimensions(dimensions); facades.update(dimensions, 'herringbone-wide'); verifyPhase() })
        const geometries = meshes.map(m => m.geometry)
        motion.setAll(true); motion.update(.24)
        const poses = definition.articulations!.map(s => { const n = root.getObjectByName(s.target)!; return [...n.position.toArray(), ...n.quaternion.toArray()] })
        root.position.set(2, .3, -4); root.rotation.set(.1, .4, -.2); root.scale.setScalar(1.3)
        motion.withClosedPose(() => { facades.update(dimensions, 'herringbone-wide'); verifyPhase() })
        expect(meshes.map(m => m.geometry)).toEqual(geometries)
        expect(definition.articulations!.map(s => { const n = root.getObjectByName(s.target)!; return [...n.position.toArray(), ...n.quaternion.toArray()] })).toEqual(poses)
        expect(motion.getStates().every(s => s.open)).toBe(true)
      }
      motion.setAll(false, true); verifyPhase()
    } finally { material.dispose(); motion.dispose() }
  },
)

it('keeps the retained Nord herringbone centred at mixed dimensions, including resizing while open', async () => {
  const { root, definition, controller, facades } = await load('dresser-11-nord-door-four-drawer')
  const spec = definition.facades!, motion = createFurnitureMotion(root, definition, controller.getDimensions, () => {})
  expect(spec.styles).not.toContain('herringbone-wide')
  try {
    for (const [width, height] of [[1.2, .9], [1, 1.1], [1.6, .75], [1.303, .917]]) {
      motion.setAll(true, true)
      const dimensions = { width, height, depth: .45 }
      motion.withClosedPose(() => {
        controller.setDimensions(dimensions); facades.update(dimensions, 'herringbone')
        for (const target of spec.targets) {
          const mesh = root.getObjectByName(`${target.panel}__Facade`) as THREE.Mesh
          const p = mesh.geometry.getAttribute('position'), floor = target.thickness / 2 - spec.herringbone!.depth
          // Actual groove floors must mirror around EACH panel's own centre.
          // A whole-cabinet axis previously left most of each drawer on one side.
          const key = (x: number, y: number) => `${Math.round(x * 1e6)},${Math.round(y * 1e6)}`
          const points = new Map<string, [number, number]>()
          for (let i = 0; i < p.count; i++) if (Math.abs(p.getZ(i) - floor) < 1e-7) points.set(key(p.getX(i), p.getY(i)), [p.getX(i), p.getY(i)])
          expect(points.size, target.panel).toBeGreaterThan(3)
          for (const [x, y] of points.values()) expect(points.has(key(-x, y)), `${target.panel}/${width}/${height}/${x}/${y}`).toBe(true)
        }
      })
      expect(motion.getStates().every(s => s.open)).toBe(true)
    }
  } finally { motion.dispose() }
})

function fixture(targets?: FacadeTarget[]) {
  const source = getFurnitureDefinition('wardrobe-15-katania-four-door')
  const definition = { ...source, facades: { ...source.facades!, targets: targets ?? source.facades!.targets } }
  const root = new THREE.Group()
  for (const target of definition.facades.targets) {
    const panel = new THREE.Group(); panel.name = target.panel; root.add(panel)
  }
  roots.push(root)
  const facades = createFacadeController(root, definition)!
  const meshes = definition.facades.targets.map(t => root.getObjectByName(`${t.panel}__Facade`) as THREE.Mesh)
  const dimensions = Object.fromEntries(Object.entries(definition.dimensions).map(([k, v]) => [k, v.base]))
  return { root, facades, meshes, dimensions }
}

it.each(getFurnitureDefinitions().filter(d => d.category === 'dressers' && d.facades?.styles.includes('herringbone-wide')))(
  '$id keeps shared-pattern panels watertight at wide/low and narrow/tall dimensions', async ({ id }) => {
    const { root, definition, controller, facades } = await load(id)
    for (const fraction of [0, .37, 1]) {
      const dimensions = Object.fromEntries(Object.entries(definition.dimensions).map(([k, r]) =>
        [k, r.min + (r.max - r.min) * (k === 'height' ? 1 - fraction : fraction)]))
      controller.setDimensions(dimensions); facades.update(dimensions, 'herringbone-wide')
      for (const target of definition.facades!.targets) {
        const mesh = root.getObjectByName(`${target.panel}__Facade`) as THREE.Mesh
        const geometry = mesh.geometry, p = geometry.getAttribute('position'), index = geometry.index!
        const edges = new Map<string, number[]>()
        const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), ab = new THREE.Vector3(), ac = new THREE.Vector3()
        const key = (v: THREE.Vector3) => v.toArray().map(n => Math.round(n * 1e7)).join(',')
        let badArea = 0, volume = 0
        for (let i = 0; i < index.count; i += 3) {
          a.fromBufferAttribute(p, index.getX(i)); b.fromBufferAttribute(p, index.getX(i + 1)); c.fromBufferAttribute(p, index.getX(i + 2))
          if (ab.subVectors(b, a).cross(ac.subVectors(c, a)).lengthSq() < 1e-20) badArea++
          volume += a.dot(ab.crossVectors(b, c)) / 6
          for (const [v, w] of [[a, b], [b, c], [c, a]]) {
            const k1 = key(v), k2 = key(w), edge = [k1, k2].sort().join('|'), signs = edges.get(edge) ?? []
            signs.push(k1 < k2 ? 1 : -1); edges.set(edge, signs)
          }
        }
        const label = `${id}/${target.panel}/${fraction}`
        expect(badArea, label).toBe(0)
        expect([...edges.values()].filter(s => s.length !== 2 || s[0] + s[1] !== 0), label).toEqual([])
        expect(volume, label).toBeGreaterThan(0)
        expect(index.count / 3, label).toBeLessThan(10000)
      }
    }
  },
)

describe('geometry reuse during resizing', () => {
  it('builds equal doors once per size and releases shared geometry once when replaced or unloaded', () => {
    const build = vi.spyOn(facadeGeometry, 'createFacadeGeometry')
    const { facades, meshes, dimensions, root } = fixture()
    facades.update(dimensions, 'diamonds')
    expect(build).toHaveBeenCalledTimes(1)
    expect(new Set(meshes.map(m => m.geometry)).size).toBe(1)
    const first = meshes[0].geometry, disposed = vi.spyOn(first, 'dispose')
    facades.update({ ...dimensions }, 'diamonds')
    facades.update({ ...dimensions, depth: dimensions.depth + .01 }, 'diamonds')
    expect(build).toHaveBeenCalledTimes(1); expect(disposed).not.toHaveBeenCalled()
    facades.update({ ...dimensions, height: dimensions.height + .001 }, 'diamonds')
    expect(build).toHaveBeenCalledTimes(2); expect(disposed).toHaveBeenCalledOnce()
    expect(meshes[0].geometry).not.toBe(first)
    const second = vi.spyOn(meshes[0].geometry, 'dispose')
    facades.update(dimensions, 'herringbone')
    expect(second).toHaveBeenCalledOnce(); expect(build).toHaveBeenCalledTimes(3)
    const last = vi.spyOn(meshes[0].geometry, 'dispose')
    disposeFurnitureModel(root); roots.splice(roots.indexOf(root), 1)
    expect(last).toHaveBeenCalledOnce()
  })

  it('separates thickness, mounting strips and frame options even for equal width and height', () => {
    const target = getFurnitureDefinition('wardrobe-15-katania-four-door').facades!.targets[0]
    const targets = [{}, { thickness: .019 }, { flutedClearCenter: .012 }, { frameField: 'flush' as const }, { frameWidth: .063 }, {}]
      .map((options, i) => ({ ...target, ...options, panel: `Panel_${i}` }))
    const { facades, meshes, dimensions } = fixture(targets)
    for (const style of ['diamonds', 'frame'] as const) {
      facades.update(dimensions, style)
      expect(new Set(meshes.map(m => m.geometry)).size).toBe(5)
      expect(meshes[0].geometry).toBe(meshes[5].geometry)
    }
  })

  it('keeps the displayed set intact and frees new geometry if a rebuild fails partway', () => {
    const target = getFurnitureDefinition('wardrobe-15-katania-four-door').facades!.targets[0]
    const { facades, meshes, dimensions } = fixture([
      { ...target, panel: 'Panel_A' }, { ...target, panel: 'Panel_B', width: { ...target.width, base: target.width.base + .001 } },
    ])
    facades.update(dimensions, 'diamonds')
    const old = meshes.map(m => m.geometry), oldDispose = old.map(g => vi.spyOn(g, 'dispose'))
    const original = facadeGeometry.createFacadeGeometry
    let created: THREE.BufferGeometry | undefined
    let released = false
    const build = vi.spyOn(facadeGeometry, 'createFacadeGeometry')
      .mockImplementationOnce((...args) => {
        created = original(...args); created.addEventListener('dispose', () => { released = true }); return created
      }).mockImplementationOnce(() => { throw new Error('test rebuild failure') })
    expect(() => facades.update({ ...dimensions, height: dimensions.height + .001 }, 'diamonds')).toThrow('test rebuild failure')
    expect(created).toBeDefined(); expect(released).toBe(true)
    expect(meshes.map(m => m.geometry)).toEqual(old)
    oldDispose.forEach(dispose => expect(dispose).not.toHaveBeenCalled())
    build.mockRestore()
    facades.update({ ...dimensions, height: dimensions.height + .001 }, 'diamonds')
    oldDispose.forEach(dispose => expect(dispose).toHaveBeenCalledOnce())
  })
})

for (const { id } of getFurnitureDefinitions().filter(model => model.facades)) describe(id, () => {
  it('resizes every supported style, keeps mounting planes/assemblies and replaces owned geometry without drift', async () => {
    const { root, definition, controller, facades } = await load(id), spec = definition.facades!
    const motion = createFurnitureMotion(root, definition, controller.getDimensions, () => {})
    const getMeshes = () => spec.targets.map(target => root.getObjectByName(`${target.panel}__Facade`) as THREE.Mesh)
    const before = Object.fromEntries(root.children.map(c => [c.name, c.position.toArray()]))
    try {
      for (const value of ['min', 'base', 'max'] as const) {
        const dimensions = Object.fromEntries(Object.entries(definition.dimensions).map(([k, c]) => [k, c[value]]))
        for (const style of spec.styles) {
          motion.withClosedPose(() => { controller.setDimensions(dimensions); facades.update(dimensions, style) })
          for (const [i, mesh] of getMeshes().entries()) {
            const target = spec.targets[i], panel = root.getObjectByName(target.panel)!
            expect(mesh.parent).toBe(panel); expect(mesh.visible).toBe(style !== (spec.sourceStyle ?? 'smooth'))
            expect(motion.findPart(mesh) !== null).toBe(style !== (spec.sourceStyle ?? 'smooth'))
            if (style === (spec.sourceStyle ?? 'smooth')) continue
            const actual = mesh.geometry.boundingBox!.getSize(new THREE.Vector3())
            expect(actual.z).toBeCloseTo(target.thickness, 6)
            for (const [key, axis] of [['width', 'x'], ['height', 'y']] as const) {
              const b = target[key]
              expect(actual[axis]).toBeCloseTo(b.base + (dimensions[b.dimension] - definition.dimensions[b.dimension].base) * b.factor, 6)
            }
            // The unchanged rear plane keeps contact with the drawer box/hinge.
            expect(mesh.geometry.boundingBox!.min.z).toBeCloseTo(-target.thickness / 2, 7)
          }
          motion.setAll(true); motion.update(.24)
          const poses = definition.articulations!.map(s => { const node = root.getObjectByName(s.target)!; return [...node.position.toArray(), ...node.quaternion.toArray()] })
          motion.withClosedPose(() => facades.update(dimensions, style === 'frame' ? 'fluted' : 'frame'))
          expect(definition.articulations!.map(s => { const node = root.getObjectByName(s.target)!; return [...node.position.toArray(), ...node.quaternion.toArray()] })).toEqual(poses)
          motion.update(.24); motion.setAll(false, true)
        }
      }
      const base = Object.fromEntries(Object.entries(definition.dimensions).map(([k, c]) => [k, c.base]))
      controller.setDimensions(base); facades.update(base, 'frame')
      const disposed = vi.spyOn(getMeshes()[0].geometry, 'dispose')
      facades.update(base, 'fluted'); expect(disposed).toHaveBeenCalledOnce()
      facades.update(base, spec.sourceStyle ?? 'smooth')
      expect(Object.fromEntries(root.children.map(c => [c.name, c.position.toArray()]))).toEqual(before)
      for (const mesh of getMeshes()) {
        const batch = mesh.parent!.children.find(c => c.name.endsWith('__SourceBatch'))
        const original = mesh.parent!.children.filter(c => c !== mesh && c !== batch)
        expect(original.length).toBeGreaterThan(0)
        expect(original.every(c => c.visible === !batch?.visible)).toBe(true)
      }
    } finally { motion.dispose() }
  })

  it('keeps finishes independent and textures unscaled; hidden doors include generated facades', async () => {
    const { root, definition, controller, facades } = await load(id)
    const motion = createFurnitureMotion(root, definition, controller.getDimensions, () => {})
    const materials = createFurnitureMaterialController(root, facades.materialDefinition, {
      createMaterial: async () => new THREE.MeshStandardMaterial({ map: new THREE.Texture(), normalMap: new THREE.Texture(), roughnessMap: new THREE.Texture() }),
      onMaterialsChanged: () => motion.withClosedPose(controller.refreshTextures),
    })
    try {
      await materials.setFinishes(materials.getSelections())
      const dimensions = Object.fromEntries(Object.entries(definition.dimensions).map(([k, c]) => [k, c.max]))
      controller.setDimensions(dimensions); facades.update(dimensions, 'fluted'); motion.setAll(true, true)
      await materials.setFinish('fronts', 'oak-natural')
      for (const target of definition.facades!.targets) {
        const mesh = root.getObjectByName(`${target.panel}__Facade`) as THREE.Mesh, m = mesh.material as THREE.MeshStandardMaterial
        expect(m.userData.finishId).toBe('oak-natural')
        for (const texture of [m.map!, m.normalMap!, m.roughnessMap!]) { expect(texture.repeat.toArray()).toEqual([1, 1]); expect(texture.offset.toArray()).toEqual([0, 0]) }
      }
      expect(materials.getSelections().carcass).toBe(definition.materialSlots!.carcass.defaultFinish)
      expect(materials.getSelections().hardware).toBe(definition.materialSlots!.hardware?.defaultFinish)
      expect(motion.getStates().every(s => s.open)).toBe(true)
      if (definition.interiorView) {
        createFurniturePresentation(root, definition).setView('interior'); motion.syncVisibility()
        for (const target of definition.facades!.targets) {
          const part = motion.findPart(root.getObjectByName(`${target.panel}__Facade`)!)
          if (target.panel.startsWith('Door')) expect(part).toBeNull()
          else expect(part).not.toBeNull()
        }
      }
    } finally { materials.dispose(); motion.dispose() }
  })
})

it.each([
  ['wardrobe-08-four-door', 'Door_Outer_Left_Panel', 'Handle_Outer_Left_Post_Lower'],
  ['wardrobe-15-katania-four-door', 'Door_01_Panel', 'Handle_01_Lower_Post'],
  ['dresser-11-nord-door-four-drawer', 'Door_Left_Front', 'Handle_Door_Left_Post_Lower'],
  ['dresser-12-brooklyn-six-drawer', 'Drawer_01_Front_Core', 'Drawer_01_Handle'],
  ['dresser-13-marvel-fluted', 'Door_Left_Front', 'Handle_Door_Left'],
  ['dresser-14-baikal-five-drawer', 'Drawer_01_Front', 'Drawer_01_Handle'],
  ['dresser-14-baikal-five-drawer', 'Drawer_05_Front', 'Drawer_05_Handle'],
])('%s: %s keeps the surface under its existing handle feet', async (id, panelName, handleName) => {
  const { root, definition, controller, facades } = await load(id)
  const handle = root.getObjectByName(handleName)!, panel = root.getObjectByName(panelName)!
  for (const size of ['min', 'base', 'max'] as const) {
    const dimensions = Object.fromEntries(Object.entries(definition.dimensions).map(([k, c]) => [k, c[size]]))
    controller.setDimensions(dimensions); root.updateMatrixWorld(true)
    const points: THREE.Vector3[] = []
    handle.traverse(o => {
      if (!(o instanceof THREE.Mesh)) return
      const position = o.geometry.getAttribute('position')
      for (let i = 0; i < position.count; i++) points.push(new THREE.Vector3().fromBufferAttribute(position, i).applyMatrix4(o.matrixWorld))
    })
    const rear = Math.min(...points.map(p => p.z))
    const feet = points.filter(p => p.z < rear + .00005)
    expect(feet.length).toBeGreaterThan(0)
    facades.update(dimensions, definition.facades!.sourceStyle ?? 'smooth')
    root.updateMatrixWorld(true)
    const sourceMeshes: THREE.Mesh[] = []
    panel.traverseVisible(o => { if (o instanceof THREE.Mesh) sourceMeshes.push(o) })
    const sourceHeights = feet.map(foot => new THREE.Raycaster(new THREE.Vector3(foot.x, foot.y, rear + .02), new THREE.Vector3(0, 0, -1)).intersectObjects(sourceMeshes, false)[0].point.z)
    // Read the actual source mounting footprint, including the curved Baikal
    // pull, rather than hard-coding a nominal handle centre.
    for (const style of definition.facades!.styles.filter(s => s !== 'original')) {
      facades.update(dimensions, style); root.updateMatrixWorld(true)
      const visible: THREE.Mesh[] = []
      panel.traverseVisible(o => { if (o instanceof THREE.Mesh) visible.push(o) })
      for (const [index, foot] of feet.entries()) {
        const ray = new THREE.Raycaster(new THREE.Vector3(foot.x, foot.y, rear + .02), new THREE.Vector3(0, 0, -1))
        const contact = ray.intersectObjects(visible, false)[0]
        expect(contact, `${id}/${style}/${size}`).toBeDefined()
        // Curved pull ends already enter the source panel slightly. Keep
        // at least that supporting surface; do not create an air gap.
        expect(contact.point.z, `${id}/${style}/${size} handle gap`).toBeGreaterThanOrEqual(sourceHeights[index] - .00015)
      }
    }
  }
})
