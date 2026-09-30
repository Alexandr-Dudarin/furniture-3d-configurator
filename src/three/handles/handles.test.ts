import { readFile } from 'node:fs/promises'
import { afterEach, expect, it, vi } from 'vitest'
import { Box3, DoubleSide, Mesh, MeshStandardMaterial, Raycaster, Vector3, type Object3D } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { CATALOG_HANDLES, HARDWARE_HANDLES } from '../../configurator/handles'
import { getFurnitureDefinitions } from '../../configurator/furnitureRegistry'
import { DRAWER_HANDLES, drawerInnerHeight } from '../../configurator/wardrobeAssembly/drawerHandles'
import { normalizeWardrobeAssembly, wardrobeClosedBounds } from '../../configurator/wardrobeAssembly/state'
import { createWardrobeAssembly } from '../wardrobeAssembly/wardrobeAssembly'
import { createFurnitureController } from '../furniture/furnitureController'
import { createFurnitureMotion, isVisible } from '../furniture/furnitureMotion'
import { createFurniturePresentation } from '../furniture/furniturePresentation'
import { createFurnitureMaterialController } from '../materials/materialController'
import { disposeFurnitureModel } from '../furniture/model'
import { createFacadeController } from '../facades/facadeController'
import { createCatalogHandleController } from './catalogHandleController'
import { createHandleGeometry } from './handleGeometry'

it.each(HARDWARE_HANDLES)('$value matches the stated projection and has finite closed geometry', spec => {
  const g = createHandleGeometry(spec.value), b = g.boundingBox!
  expect(b.min.z).toBeCloseTo(spec.value === 'profile' ? -.018 : 0, 7)
  expect(b.max.z).toBeCloseTo(spec.projection, 7)
  expect(b.max.x - b.min.x).toBeCloseTo(spec.length, 7)
  expect([...g.getAttribute('position').array].every(Number.isFinite)).toBe(true)
  expect(g.getAttribute('position').count).toBeLessThan(10000)
  g.dispose()
})

it.each(DRAWER_HANDLES)('assembly $value keeps contacts, free grip space, volume reporting and open pose at size limits', spec => {
  for (const width of [.4, 1]) for (const depth of [.4, .8]) for (const height of [.2, .3]) for (const placement of ['flush', 'recessed'] as const) {
    const c = normalizeWardrobeAssembly({ sections: [{ id: 'section-1', width, height: 2.2, depth, shelves: 0, rod: false, drawers: { count: 2, height, placement, handle: spec.value } }] })
    const a = createWardrobeAssembly(c), id = 'section-1/Drawer_2'
    const mesh = (name: string) => a.group.getObjectByName(`${id}/${name}`) as Mesh
    const front = new Box3().setFromObject(mesh('Front'), true), side = new Box3().setFromObject(mesh('Side_1'), true), bottom = new Box3().setFromObject(mesh('Bottom'), true)
    expect(side.max.z).toBeCloseTo(front.min.z, 6)
    expect(side.max.y - bottom.max.y).toBeCloseTo(drawerInnerHeight(height, spec.value), 6)
    expect(new Box3().setFromObject(a.group, true).getSize(new Vector3()).z).toBeCloseTo(wardrobeClosedBounds(c).depth, 6)
    const top = .086 + height * 2
    if (spec.value === 'top-grip') {
      expect(top - front.max.y).toBeCloseTo(.04, 6)
      expect(side.max.y).toBeLessThan(front.max.y)
      const ray = new Raycaster(new Vector3(0, top - .02, front.max.z + .01), new Vector3(0, 0, -1), 0, .06)
      expect(ray.intersectObject(a.group, true)).toHaveLength(0)
    }
    if (spec.value === 'finger-notch') {
      // The cut is open through the entire thickness; no fake dark overlay.
      for (const y of [front.max.y - .001, front.max.y - .020]) {
        const ray = new Raycaster(new Vector3(0, y, front.max.z + .01), new Vector3(0, 0, -1), 0, .06)
        expect(ray.intersectObject(a.group, true)).toHaveLength(0)
      }
      expect(new Raycaster(new Vector3(.04, front.max.y - .01, 2), new Vector3(0, 0, -1)).intersectObject(mesh('Front'))).toHaveLength(0)
      expect(new Raycaster(new Vector3(.04, front.max.y - .02, 2), new Vector3(0, 0, -1)).intersectObject(mesh('Front'))).not.toHaveLength(0)
    }
    if (spec.value === 'profile') {
      const handle = new Box3().setFromObject(mesh('Handle'), true)
      expect(handle.max.y - front.max.y).toBeCloseTo(.0015, 6)
      // Topmost handle clears the block lid; its rear leg is behind the front.
      expect(handle.max.y).toBeLessThan(top)
      expect(handle.min.z).toBeCloseTo(front.min.z - .002, 6)
    }
    if (spec.value === 'semicircle') {
      expect(front.max.y - new Box3().setFromObject(mesh('Handle'), true).max.y).toBeCloseTo(.030, 6)
    }
    if (spec.value === 'edge-pull') {
      const handle = new Box3().setFromObject(mesh('Handle'), true)
      expect(front.max.y - handle.max.y).toBeCloseTo(.035, 6)
      expect(handle.min.z).toBeCloseTo(front.max.z, 6)
      expect(handle.max.z - front.max.z).toBeCloseTo(.036, 6)
    }
    a.motion.toggle(id); a.motion.update(.24)
    const z = mesh('Front').getWorldPosition(new Vector3()).z
    const oldGeometry = mesh('Front').geometry
    c.sections[0].drawers!.handle = spec.value === 'none' ? 'finger-notch' : 'none'
    a.update(c)
    expect(mesh('Front').getWorldPosition(new Vector3()).z).toBeCloseTo(z, 7)
    expect(a.motion.findPart(mesh('Front'))).toBe(id)
    if (spec.value === 'finger-notch' || spec.value === 'top-grip') expect(mesh('Front').geometry).not.toBe(oldGeometry)
    a.dispose()
  }
})

const roots: Object3D[] = []
afterEach(() => { roots.splice(0).forEach(disposeFurnitureModel); vi.unstubAllGlobals() })
it.each(getFurnitureDefinitions().filter(d => d.handles))('$id attaches handles to real GLBs, preserves finishes, poses, interior view and restores original parts', async catalog => {
  class ImageStub extends EventTarget { width = 2; height = 2; set src(_v: string) { queueMicrotask(() => this.dispatchEvent(new Event('load'))) } }
  vi.stubGlobal('self', globalThis); vi.stubGlobal('document', { createElementNS: () => new ImageStub() })
  const definition = await catalog.loadRuntime!()
  expect(definition.handles).toEqual(catalog.handles)
  const root = (await new GLTFLoader().parseAsync(Uint8Array.from(await readFile(`public${definition.modelUrl}`)).buffer, '')).scene
  roots.push(root)
  const body = createFurnitureController(root, definition), facades = createFacadeController(root, definition)!
  const handles = createCatalogHandleController(root, facades.materialDefinition)!
  const motion = createFurnitureMotion(root, definition, body.getDimensions, () => {})
  const presentation = createFurniturePresentation(root, definition)
  const materials = createFurnitureMaterialController(root, handles.materialDefinition, { createMaterial: async () => new MeshStandardMaterial() })
  await materials.setFinish('hardware', 'metal-brass-satin')
  for (const fraction of [0, 1]) {
    const dimensions = Object.fromEntries(Object.entries(definition.dimensions).map(([k, r]) => [k, r.min + fraction * (r.max - r.min)]))
    motion.withClosedPose(() => { body.setDimensions(dimensions); facades.update(dimensions, 'frame') })
    motion.setAll(true); motion.update(.24)
    const poses = definition.articulations!.map(t => root.getObjectByName(t.target)!.matrix.clone())
    for (const { value } of CATALOG_HANDLES) {
      motion.withClosedPose(() => handles.update(dimensions, { doors: value, drawers: value }))
      if (value === 'profile' || value === 'edge-pull') motion.withClosedPose(() => {
        const boxes = definition.handles!.targets.filter(t => t.kind === 'door').map(t => new Box3().setFromObject(root.getObjectByName(`${t.panel}__Handle`)!, true))
        for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
          const intersection = boxes[i].clone().intersect(boxes[j])
          expect(intersection.isEmpty()).toBe(true)
        }
      })
      expect(definition.articulations!.map(t => root.getObjectByName(t.target)!.matrix)).toEqual(poses)
      for (const target of definition.handles!.targets) {
        const m = root.getObjectByName(`${target.panel}__Handle`) as Mesh
        expect(m.visible).toBe(value !== 'original' && value !== 'none')
        if (target.original) expect(root.getObjectByName(target.original)!.visible).toBe(value === 'original')
        if (!m.visible) continue
        expect(m.material).toMatchObject({ name: 'Configurator_Handle' })
        expect(motion.findPart(m)).not.toBeNull()
        expect(m.scale.toArray()).toEqual([1, 1, 1])
        const local = m.geometry.boundingBox!.clone().applyMatrix4(m.matrix)
        const spec = definition.facades!.targets.find(p => p.panel === target.panel)!
        const w = spec.width.base + (dimensions.width - definition.dimensions.width.base) * spec.width.factor
        const h = spec.height.base + (dimensions.height - definition.dimensions.height.base) * spec.height.factor
        const wrap = value === 'profile'
        const allowance = wrap ? .001501 : 0
        expect(local.min.x).toBeGreaterThan(-w / 2 - allowance); expect(local.max.x).toBeLessThan(w / 2 + allowance)
        expect(local.min.y).toBeGreaterThan(-h / 2 - allowance); expect(local.max.y).toBeLessThan(h / 2 + allowance)
        expect(local.min.z).toBeCloseTo((target.kind === 'door' && value === 'knob') || (target.kind === 'drawer' && value === 'semicircle') || value === 'edge-pull' ? m.position.z : wrap ? -spec.thickness / 2 - .002 : spec.thickness / 2, 6)
        const size = m.geometry.boundingBox!.getSize(new Vector3())
        const door = target.kind === 'door'
        if (value === 'profile') expect(size.x).toBeCloseTo(door ? .330 : .220, 6)
        if (value === 'edge-pull') {
          expect(size.x).toBeCloseTo(door ? .170 : .110, 6)
          if (door) expect(w / 2 - Math.abs(m.position.x)).toBeCloseTo(.020, 6)
          else {
            expect(h / 2 - local.max.y).toBeCloseTo(.035, 6)
            // The 35 mm root is inside the frame's recessed centre field.
            expect(m.position.z).toBeLessThan(spec.thickness / 2)
          }
          // Sample the face at the mounting root, excluding the hardware itself.
          const mount = new Vector3(0, -.006, 0).applyMatrix4(m.matrixWorld)
          const z = new Vector3(0, 0, 1).transformDirection(m.parent!.matrixWorld)
          const surfaces: Object3D[] = []
          for (const child of m.parent!.children) if (child !== m) child.traverseVisible(part => { if (part instanceof Mesh) surfaces.push(part) })
          const hit = new Raycaster(mount.clone().addScaledVector(z, .01), z.clone().negate(), 0, .015).intersectObjects(surfaces, false)[0]
          expect(hit, `${catalog.id}/${target.panel} mounting contact`).toBeDefined()
          expect(hit.distance).toBeCloseTo(.01, 5)
        }
        if (value === 'semicircle' && !door) expect(h / 2 - local.max.y).toBeCloseTo(.030, 6)
        if (value === 'knob' || value === 'semicircle') {
          expect(size.x).toBeCloseTo((value === 'knob' ? .028 : .078) * (door ? 1.75 : 1), 6)
          if (door) expect(w / 2 - Math.abs(m.position.x)).toBeCloseTo(value === 'knob' ? .050 : .020, 6)
        }
      }
    }
    motion.withClosedPose(() => handles.update(dimensions, { doors: 'flat-bar', drawers: 'classic' }))
    presentation.setView('interior')
    for (const target of definition.handles!.targets) expect(isVisible(root.getObjectByName(`${target.panel}__Handle`)!)).toBe(target.kind === 'drawer')
    presentation.setView('exterior')
  }
  const m = root.getObjectByName(`${definition.handles!.targets[0].panel}__Handle`) as Mesh
  const retired = vi.fn(); m.geometry.addEventListener('dispose', retired)
  motion.withClosedPose(() => handles.update(body.getDimensions(), { doors: 'none', drawers: 'none' }))
  expect(retired).toHaveBeenCalledTimes(1)
  presentation.dispose(); motion.dispose(); materials.dispose()
})

it('U profiles wrap the edge and retain their thin walls and free finger space', () => {
  const material = new MeshStandardMaterial({ side: DoubleSide })
  for (const thickness of [.016, .018]) {
    const style = 'profile'
    const geometry = createHandleGeometry(style, undefined, thickness)
    const mesh = new Mesh(geometry, material); mesh.updateMatrixWorld()
    const hits = (origin: Vector3, direction: Vector3, far: number) => new Raycaster(origin, direction, 0, far).intersectObject(mesh)
    for (const y of [-.001, -.01, -.025]) {
      expect(hits(new Vector3(0, y, -thickness + .0001), new Vector3(0, 0, 1), thickness - .0002)).toHaveLength(0)
      const outside = hits(new Vector3(0, y, .0001), new Vector3(0, 0, 1), .04)
      expect(outside[0].point.z).toBeCloseTo(.025, 7)
    }
    const inside = hits(new Vector3(0, -.01, -thickness - .01), new Vector3(0, 0, 1), .0099)
    expect(inside.length).toBeGreaterThan(0)
    // Bridge underside rests exactly on the edge, instead of cutting into it.
    const bridge = hits(new Vector3(0, -.01, -thickness / 2), new Vector3(0, 1, 0), .02)
    expect(bridge[0].point.y).toBeCloseTo(0, 7)
    geometry.dispose()
  }
  material.dispose()
})


it('Gamma planks mount on the face with 12 mm walls and an open 24 mm finger recess', () => {
  const material = new MeshStandardMaterial({ side: DoubleSide })
  for (const length of [.110, .170]) for (const thickness of [.016, .018]) {
    const geometry = createHandleGeometry('edge-pull', length, thickness)
    const mesh = new Mesh(geometry, material); mesh.updateMatrixWorld()
    const ray = (x: number, y: number, z: number, dz: number, far: number) => new Raycaster(new Vector3(x, y, z), new Vector3(0, 0, dz), 0, far).intersectObject(mesh)
    const b = geometry.boundingBox!
    expect(b.min.z).toBeCloseTo(0, 7)
    expect(b.max.y - b.min.y).toBeCloseTo(.032, 7)
    for (const x of [-length * .4, 0, length * .4]) {
      // The whole horizontal root is bonded to the facade at Z=0.
      expect(ray(x, -.006, -.01, 1, .05)[0].point.z).toBeCloseTo(0, 7)
      // Fingers reach under the 12 mm root and behind the 12 mm outer wall.
      const inside = ray(x, -.020, .0001, 1, .05)[0]
      expect(inside.point.z).toBeCloseTo(.024, 7)
      expect(b.max.z - inside.point.z).toBeCloseTo(4 * .003, 7)
      // No rear leg embedded into the panel or draped over its edge.
      expect(ray(x, -.006, -thickness, 1, thickness - .0001)).toHaveLength(0)
    }
    geometry.dispose()
  }
  material.dispose()
})
