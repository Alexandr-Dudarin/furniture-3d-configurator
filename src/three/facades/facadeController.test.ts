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
      for (const mesh of getMeshes()) expect(mesh.parent!.children.filter(c => c !== mesh).every(c => c.visible)).toBe(true)
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
    for (const style of ['smooth', 'frame', 'fluted', 'fluted-sides', 'diagonal', 'herringbone', 'diamonds'] as const) {
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
