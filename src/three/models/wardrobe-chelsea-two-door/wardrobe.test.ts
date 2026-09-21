/// <reference types="node" />
import { readFile } from 'node:fs/promises'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { createFurnitureController } from '../../furniture/furnitureController'
import { createFurnitureMaterialController } from '../../materials/materialController'
import { disposeMaterialFinishCache } from '../../materials/createMaterial'
import { getMaterialFinish } from '../../materials/materialRegistry'
import { WARDROBE_09_CONFIG as config, BOARD_MATERIAL_TARGETS, createMaterialReviewDefinition } from './config'

type Size = { width: number; height: number; depth: number }
type Axis = 'x' | 'y' | 'z'
const base: Size = { width: .802, height: 2.022, depth: .514 }
const EPS = 1e-6
afterEach(() => { disposeMaterialFinishCache(); vi.unstubAllGlobals() })

// Only image load events are stubbed; all geometry and controllers are real.
class ImageStub {
  width = 1; height = 1; complete = true
  listeners = new Map<string, Set<EventListenerOrEventListenerObject>>()
  addEventListener(t: string, l: EventListenerOrEventListenerObject) { const s = this.listeners.get(t) ?? new Set(); s.add(l); this.listeners.set(t, s) }
  removeEventListener(t: string, l: EventListenerOrEventListenerObject) { this.listeners.get(t)?.delete(l) }
  set src(_v: string) { queueMicrotask(() => this.listeners.get('load')?.forEach(l => { const e = new Event('load'); if (typeof l === 'function') l(e); else l.handleEvent(e) })) }
}
async function load() {
  vi.stubGlobal('self', globalThis)
  vi.stubGlobal('document', { createElementNS: () => new ImageStub() })
  const bytes = await readFile(`public${config.modelUrl}`)
  return (await new GLTFLoader().parseAsync(Uint8Array.from(bytes).buffer, '')).scene
}
function required(root: THREE.Object3D, name: string) { const n = root.getObjectByName(name); if (!n) throw new Error(`Missing ${name}`); return n }
function bounds(node: THREE.Object3D) { node.updateWorldMatrix(true, true); return new THREE.Box3().setFromObject(node, true) }
function box(root: THREE.Object3D, name: string) { return bounds(required(root, name)) }
function size(root: THREE.Object3D, name: string) { return box(root, name).getSize(new THREE.Vector3()) }
function close(a: number, b: number) { expect(Math.abs(a - b)).toBeLessThan(EPS) }
function closeSize(actual: THREE.Vector3, expected: number[]) { actual.toArray().forEach((v, i) => close(v, expected[i])) }
function nodes(root: THREE.Object3D, kind: string) { const out: THREE.Object3D[] = []; root.traverse(o => { if (o.userData.kind === kind) out.push(o) }); return out }
function snapshot(root: THREE.Object3D) { const out: Record<string, number[]> = {}; root.traverse(o => { out[o.name] = [...o.position.toArray(), ...o.quaternion.toArray(), ...o.scale.toArray()] }); return out }
function materials(root: THREE.Object3D) {
  const out = new Map<string, THREE.MeshStandardMaterial>()
  root.traverse(o => { if (o instanceof THREE.Mesh) for (const m of Array.isArray(o.material) ? o.material : [o.material]) if (m instanceof THREE.MeshStandardMaterial) out.set(m.name, m) })
  return out
}
function shape(root: THREE.Object3D, d: Size) {
  const all = bounds(root), left = box(root, 'Panel_Side_Left'), right = box(root, 'Panel_Side_Right')
  closeSize(all.getSize(new THREE.Vector3()), [d.width, d.height, d.depth])
  close(all.min.x, -d.width / 2); close(all.min.z, -d.depth / 2); close(all.min.y, 0)
  const top = box(root, 'Panel_Top'), bottom = box(root, 'Panel_Bottom')
  close(top.max.y, d.height); close(top.min.y, left.max.y)
  close(left.min.x - top.min.x, .001); close(top.max.x - right.max.x, .001)
  close(bottom.min.y, .070); close(bottom.min.x, left.max.x); close(bottom.max.x, right.min.x)
  close(box(root, 'Plinth_Front').max.y, bottom.min.y)
  close(box(root, 'Shelf_Lower').max.y, .386)
  close(top.max.y - box(root, 'Shelf_Upper').max.y, .350)
  close(top.max.y - box(root, 'ClothesRail_Oval').getCenter(new THREE.Vector3()).y, .440)
  for (const side of ['Left', 'Right']) {
    const door = box(root, `Door_${side}_Panel`)
    close(door.min.y, .071); close(top.min.y - door.max.y, .002)
    close(door.min.z - left.max.z, .003); close(top.max.z - door.max.z, .002)
    closeSize(size(root, `Panel_Side_${side}`), [.016, d.height - .016, d.depth - .024])
  }
  close(box(root, 'Door_Right_Panel').min.x - box(root, 'Door_Left_Panel').max.x, .004)
  const back = box(root, 'Panel_Back')
  close(back.min.x, left.min.x); close(back.max.x, right.max.x)
  close(back.max.z, left.min.z); close(back.max.y, top.min.y); close(back.min.y, .058)
  closeSize(back.getSize(new THREE.Vector3()), [d.width - .002, d.height - .074, .003])
  expect(nodes(root, 'board').filter(o => o.name.startsWith('Panel_Back')).map(o => o.name)).toEqual(['Panel_Back'])
  for (const removed of ['Panel_Back_Left', 'Panel_Back_Right', 'Back_Join_Profile']) expect(root.getObjectByName(removed)).toBeUndefined()
  for (const name of ['Shelf_Lower', 'Shelf_Upper']) {
    const shelf = box(root, name)
    close(shelf.min.x, left.max.x); close(shelf.max.x, right.min.x)
    close(shelf.min.z, left.min.z); close(shelf.max.z, left.max.z)
  }
  closeSize(size(root, 'ClothesRail_Oval'), [d.width - .037, .030, .015])
  const boards = nodes(root, 'board')
  for (const p of boards) close(bounds(p).getSize(new THREE.Vector3())[p.userData.thicknessAxis as Axis], p.userData.thickness as number)
  // Verify actual transformed panel volumes, allowing joints at their boundaries.
  for (let i = 0; i < boards.length; i++) for (let j = i + 1; j < boards.length; j++) {
    const a = bounds(boards[i]), b = bounds(boards[j])
    const overlap = (['x', 'y', 'z'] as const).every(axis => Math.min(a.max[axis], b.max[axis]) - Math.max(a.min[axis], b.min[axis]) > EPS)
    expect(overlap, `${boards[i].name} intersects ${boards[j].name}`).toBe(false)
  }
}

describe(config.id, () => {
  it('loads the production GLB with complete targets, unique names and valid triangle normals', async () => {
    const root = await load(), names: string[] = []
    root.traverse(o => names.push(o.name))
    expect(new Set(names).size).toBe(names.length)
    for (const r of config.resizeRules) for (const name of 'target' in r ? [r.target] : r.targets.map(t => t.target)) required(root, name)
    const targets = [...BOARD_MATERIAL_TARGETS.carcass, ...BOARD_MATERIAL_TARGETS.fronts, ...config.materialSlots.hardware.targets]
    expect(new Set(targets).size).toBe(targets.length)
    expect([...materials(root).keys()].sort()).toEqual([...targets].sort())
    expect(Object.keys(config.materialSlots)).toEqual(['hardware'])
    for (const id of config.materialSlots.hardware.allowedFinishes) expect(getMaterialFinish(id).id).toBe(id)
    root.traverse(o => {
      if (!(o instanceof THREE.Mesh)) return
      const p = o.geometry.getAttribute('position'), n = o.geometry.getAttribute('normal'), index = o.geometry.index!
      const mat = o.material as THREE.MeshStandardMaterial
      if (!mat.name.startsWith('Hardware_')) {
        expect(mat.metalness).toBe(0); expect(o.geometry.getAttribute('uv')).toBeDefined(); expect(o.geometry.getAttribute('tangent')).toBeDefined()
      }
      for (let i = 0; i < index.count; i += 3) {
        const ids = [index.getX(i), index.getX(i + 1), index.getX(i + 2)]
        const [a, b, c] = ids.map(j => new THREE.Vector3().fromBufferAttribute(p, j))
        const cross = b.sub(a).cross(c.sub(a)), normal = ids.map(j => new THREE.Vector3().fromBufferAttribute(n, j)).reduce((s, v) => s.add(v), new THREE.Vector3())
        expect(cross.length()).toBeGreaterThan(1e-13); expect(cross.dot(normal)).toBeGreaterThan(0)
      }
    })
    expect(nodes(root, 'board')).toHaveLength(11)
    expect(nodes(root, 'door-pivot')).toHaveLength(2)
    expect(nodes(root, 'push-latch')).toHaveLength(2)
    expect(nodes(root, 'hardware').filter(o => o.userData.fitting === 'hinge-cup')).toHaveLength(8)
    shape(root, base)
  }, 30000)

  it('matches the manufacturer parts except the approved single-piece rear panel', async () => {
    const root = await load()
    closeSize(size(root, 'Panel_Top'), [.802, .016, .514])
    for (const side of ['Left', 'Right']) {
      closeSize(size(root, `Panel_Side_${side}`), [.016, 2.006, .490])
      closeSize(size(root, `Door_${side}_Panel`), [.397, 1.933, .016])
    }
    for (const name of ['Panel_Bottom', 'Shelf_Lower', 'Shelf_Upper']) closeSize(size(root, name), [.768, .016, .490])
    closeSize(size(root, 'Rear_Brace'), [.768, .120, .016])
    closeSize(size(root, 'Plinth_Front'), [.768, .070, .016])
    close(size(root, 'ClothesRail_Oval').x, .765)
    closeSize(size(root, 'Panel_Back'), [.800, 1.948, .003])
  })

  it('preserves dimensions, joints, fixed thicknesses and gaps through 34 boundary cases, 1 mm steps and return', async () => {
    const root = await load(), controller = createFurnitureController(root, config), initial = snapshot(root), cases: Size[] = [base]
    for (const width of [.6, .8, 1]) for (const height of [1.9, 2.15, 2.4]) for (const depth of [.4, .525, .65]) cases.push({ width, height, depth })
    for (const key of ['width', 'height', 'depth'] as const) for (const value of [config.dimensions[key].min, config.dimensions[key].max]) cases.push({ ...base, [key]: value })
    expect(cases).toHaveLength(34)
    for (const d of cases) { controller.setDimensions(d); shape(root, d) }
    for (const key of ['width', 'height', 'depth'] as const) {
      const d = { ...base, [key]: base[key] + .001 }; controller.setDimensions(d); shape(root, d)
    }
    controller.setDimensions(base)
    expect(controller.getDimensions()).toEqual(base); expect(snapshot(root)).toEqual(initial)
  }, 30000)

  it('has no centre seam or opening in the back at base and both size limits', async () => {
    const root = await load(), controller = createFurnitureController(root, config)
    const back = required(root, 'Panel_Back')
    const ray = new THREE.Raycaster()
    for (const d of [base, { width: .6, height: 1.9, depth: .4 }, { width: 1, height: 2.4, depth: .65 }, base]) {
      controller.setDimensions(d)
      for (const fraction of [.01, .25, .5, .75, .99]) for (const x of [-.002, 0, .002]) {
        const y = .058 + (d.height - .074) * fraction
        ray.set(new THREE.Vector3(x, y, -d.depth / 2 - .1), new THREE.Vector3(0, 0, 1))
        const hits = ray.intersectObject(back, true)
        expect(hits.length).toBeGreaterThan(0)
        close(hits[0].point.z, -d.depth / 2)
      }
    }
  })

  it('preserves bevel regions, oval cross section and all fixed fitting sizes', async () => {
    const root = await load(), controller = createFurnitureController(root, config)
    const hardware = new Map(nodes(root, 'hardware').map(o => [o.name, bounds(o).getSize(new THREE.Vector3())]))
    for (const d of [{ width: 1, height: 2.4, depth: .65 }, { width: .6, height: 1.9, depth: .4 }, base]) {
      controller.setDimensions(d)
      for (const tile of nodes(root, 'board-segment')) {
        close(tile.scale[tile.parent!.userData.thicknessAxis as Axis], 1)
        for (const [a, zone] of (tile.userData.zones as number[]).entries()) if (zone !== 0) close(tile.scale[(['x', 'y', 'z'] as const)[a]], 1)
      }
      for (const fitting of nodes(root, 'hardware')) {
        const s = bounds(fitting).getSize(new THREE.Vector3()), b = hardware.get(fitting.name)!
        for (const axis of ['x', 'y', 'z'] as const) {
          if (fitting.userData.fitting === 'clothes-rail' && axis === 'x') continue
          close(s[axis], b[axis])
        }
      }
      for (const side of ['Left', 'Right']) expect(required(root, `Door_${side}_Hinge`).scale.toArray()).toEqual([1, 1, 1])
    }
  })

  it('provides usable door axes at base and both limits without changing the application interaction', async () => {
    const root = await load(), controller = createFurnitureController(root, config), initial = snapshot(root)
    for (const d of [base, { width: .6, height: 1.9, depth: .4 }, { width: 1, height: 2.4, depth: .65 }]) {
      controller.setDimensions(d)
      for (const [side, sign] of [['Left', -1], ['Right', 1]] as const) {
        const hinge = required(root, `Door_${side}_Hinge`), origin = hinge.getWorldPosition(new THREE.Vector3())
        expect(hinge.userData.interactiveAnimation).toBe(false)
        for (const degrees of [0, 15, 45, 90, 105]) {
          hinge.rotation.y = THREE.MathUtils.degToRad(sign * degrees); root.updateMatrixWorld(true)
          expect(hinge.getWorldPosition(new THREE.Vector3()).distanceTo(origin)).toBeLessThan(EPS)
          const door = box(root, `Door_${side}_Panel`)
          expect(door.min.z + EPS).toBeGreaterThanOrEqual(box(root, 'Panel_Side_Left').max.z + .003)
          close(door.max.y, d.height - .018); close(door.min.y, .071)
        }
        hinge.rotation.y = 0
      }
    }
    controller.setDimensions(base); expect(snapshot(root)).toEqual(initial)
  })

  it('replaces carcass, fronts and hardware independently with real catalogue finishes in review mode', async () => {
    const root = await load(), review = createMaterialReviewDefinition('oak-natural', 'walnut-natural', ['oak-natural', 'walnut-natural', 'oak-grey'])
    const controller = createFurnitureController(root, review), mc = createFurnitureMaterialController(root, review, { onMaterialsChanged: controller.refreshTextures })
    await mc.setFinishes(mc.getSelections()); controller.setDimensions({ width: 1, height: 2.4, depth: .65 })
    const before = materials(root)
    await mc.setFinish('fronts', 'oak-grey')
    for (const name of BOARD_MATERIAL_TARGETS.carcass) expect(materials(root).get(name)).toBe(before.get(name))
    for (const name of BOARD_MATERIAL_TARGETS.fronts) expect(materials(root).get(name)!.userData.finishId).toBe('oak-grey')
    const boardsBefore = materials(root)
    await mc.setFinish('hardware', 'metal-white-matte')
    for (const name of [...BOARD_MATERIAL_TARGETS.carcass, ...BOARD_MATERIAL_TARGETS.fronts]) expect(materials(root).get(name)).toBe(boardsBefore.get(name))
    for (const name of config.materialSlots.hardware.targets) expect(materials(root).get(name)!.userData.finishId).toBe('metal-white-matte')
    await mc.setFinish('carcass', 'walnut-natural')
    for (const name of BOARD_MATERIAL_TARGETS.fronts) expect(materials(root).get(name)).toBe(boardsBefore.get(name))
    controller.setDimensions(base); shape(root, base); mc.dispose()
  }, 30000)

  it('has metre-based flat-face UVs at base and explicitly leaves affine resize UV integration pending', async () => {
    const root = await load(); let checked = 0
    root.traverse(o => {
      if (!(o instanceof THREE.Mesh)) return
      const tile = o.userData.kind === 'board-segment' ? o : o.parent
      if (tile?.userData.kind !== 'board-segment' || tile.userData.zones.some((z: number) => z !== 0)) return
      const thin = tile.parent!.userData.thicknessAxis as Axis, axes = { x: [2, 1], y: [2, 0], z: [0, 1] }[thin]
      const material = o.material as THREE.MeshStandardMaterial
      if (!material.name.endsWith('_' + thin.toUpperCase())) return
      const p = o.geometry.getAttribute('position'), n = o.geometry.getAttribute('normal'), uv = o.geometry.getAttribute('uv'), ni = ['x', 'y', 'z'].indexOf(thin)
      let start = -1
      for (let i = 0; i < p.count; i++) if (Math.abs(n.getComponent(i, ni)) > .99999) {
        if (start < 0) { start = i; continue }
        close(uv.getX(i) - uv.getX(start), p.getComponent(i, axes[0]) - p.getComponent(start, axes[0]))
        close(uv.getY(i) - uv.getY(start), p.getComponent(i, axes[1]) - p.getComponent(start, axes[1])); checked++
      }
    })
    expect(checked).toBeGreaterThan(50)
    expect(config.textureAxes).toEqual({})
    expect(required(root, 'Wardrobe_09_Root').userData.runtimeCompatibility).toContain('material-and-UV-integration-pending')
  })
})
