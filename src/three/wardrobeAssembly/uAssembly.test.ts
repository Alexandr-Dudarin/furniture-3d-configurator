import { expect, it, vi } from 'vitest'
import { Box3, Mesh, MeshStandardMaterial, PerspectiveCamera, Vector3 } from 'three'
import { normalizeWardrobeAssembly, updateWardrobeAssembly, wardrobeClosedBounds, wardrobeAisleWidth } from '../../configurator/wardrobeAssembly/state'
import { wardrobePlacement } from '../../configurator/wardrobeAssembly/arrangement'
import { createWardrobeAssembly } from './wardrobeAssembly'
import { createFurnitureFraming } from '../core/furnitureFraming'

const makeConfig = (small = false) => normalizeWardrobeAssembly({ arrangement: { kind: 'u', split: 1, secondSplit: 2,
  corner: { height: small ? .8 : 2.8, shelves: small ? 2 : 6 }, secondCorner: { height: small ? 1.1 : 2.2, shelves: small ? 3 : 4 } }, sections: [
  { id: 'section-1', width: small ? .4 : 1, depth: small ? .4 : .8, height: small ? .8 : 2.8, shelves: 0, drawers: { count: 2, height: .2 }, doors: { count: 2, handle: 'edge-pull' } },
  { id: 'section-2', width: .6, depth: small ? .4 : .65, height: small ? 1 : 2.5, shelves: 0, drawers: { count: 2, height: .2, placement: 'flush', facadeStyle: 'fluted-wide', handle: 'knob' } },
  { id: 'section-3', width: .8, depth: small ? .45 : .8, height: small ? .9 : 2.2, shelves: 0, drawers: { count: 2, height: .2, facadeStyle: 'frame', handle: 'finger-notch' } },
] })
const box = (n: Parameters<Box3['setFromObject']>[0]) => new Box3().setFromObject(n, true)

it.each([false, true])('matches physical bounds, floor and 16 mm panels of both corners, size minimum=%s', small => {
  const c = makeConfig(small), a = createWardrobeAssembly(c), expected = wardrobeClosedBounds(c), size = box(a.group).getSize(new Vector3())
  expect(size.x).toBeCloseTo(expected.width, 6); expect(size.y).toBeCloseTo(expected.height, 6); expect(size.z).toBeCloseTo(expected.depth, 6)
  expect(box(a.group).min.y).toBeCloseTo(0, 6)
  for (const corner of wardrobePlacement(c).corners) {
    const panels: Mesh[] = []
    a.group.traverse(n => { if (n instanceof Mesh && n.name.startsWith(corner.id) && /\/(Bottom|Shelf_\d+|Top)$/.test(n.name)) panels.push(n) })
    expect(panels).toHaveLength(corner.shelves + 2)
    panels.sort((a, b) => a.position.y - b.position.y)
    panels.forEach((p, i) => {
      expect(box(p).getSize(new Vector3()).y).toBeCloseTo(.016, 6)
      if (i) expect(box(p).min.y - box(panels[i - 1]).max.y).toBeGreaterThanOrEqual(.2 - 1e-6)
      for (const attr of ['position', 'normal', 'uv']) expect([...p.geometry.getAttribute(attr).array].every(Number.isFinite)).toBe(true)
    })
    const inside = new Vector3(corner.origin[0] + corner.sign * .15, .5, corner.origin[1] + .15)
    expect(a.getCameraObstacles().some(b => b.containsPoint(inside))).toBe(true)
  }
  // A ray through the centre of the aisle must not hit a fake corner AABB.
  const aisle = new Vector3(0, .5, expected.depth / 2 - .1)
  expect(a.getCameraObstacles().some(b => b.containsPoint(aisle))).toBe(false)
  a.dispose()
})
it('opens opposing drawers into the aisle in opposite directions with correct raycast IDs and moving camera obstacles', () => {
  const a = createWardrobeAssembly(makeConfig())
  for (const [id, sign] of [['section-2', 1], ['section-3', -1]] as const) {
    const front = a.group.getObjectByName(`${id}/Drawer_1/Front`)!, before = front.getWorldPosition(new Vector3())
    expect(a.motion.findPart(front)).toBe(`${id}/Drawer_1`)
    a.motion.toggle(`${id}/Drawer_1`)
    for (let i = 0; i < 5; i++) a.motion.update(.5)
    const after = front.getWorldPosition(new Vector3())
    expect((after.x - before.x) * sign).toBeGreaterThan(.2); expect(after.z).toBeCloseTo(before.z, 7)
    expect(a.getCameraObstacles().some(b => b.containsPoint(after))).toBe(true)
  }
  expect(a.motion.update(.1)).toBe(false)
  a.dispose()
})
it('keeps two independently coloured corners and per-section fronts stable, and disposes only removed resources on U/L/straight switches', async () => {
  const material = vi.fn(async (id: string) => { const m = new MeshStandardMaterial(); m.name = id; return m })
  let c = makeConfig()
  const a = createWardrobeAssembly(c, { createMaterial: material })
  c = updateWardrobeAssembly(c, { type: 'update-corner', patch: { bodyFinish: 'oak-natural' } })
  c = updateWardrobeAssembly(c, { type: 'update-corner', cornerId: 'corner-2', patch: { bodyFinish: 'oak-black' } })
  c = updateWardrobeAssembly(c, { type: 'set-section-finish', id: 'section-3', slot: 'facadeFinish', finishId: 'board-white-matte' })
  await a.setFinishes(c)
  const left = a.group.getObjectByName('corner-1/Top') as Mesh, right = a.group.getObjectByName('corner-2/Top') as Mesh
  const geometry = right.geometry, uv = geometry.getAttribute('uv')
  a.update(c)
  expect(right.geometry).toBe(geometry); expect(right.geometry.getAttribute('uv')).toBe(uv)
  expect((left.material as MeshStandardMaterial).name).toBe('oak-natural'); expect((right.material as MeshStandardMaterial).name).toBe('oak-black')
  expect(((a.group.getObjectByName('section-3/Drawer_1/Front') as Mesh).material as MeshStandardMaterial).name).toBe('board-white-matte')
  const disposed = vi.spyOn(right.material as MeshStandardMaterial, 'dispose')
  c = updateWardrobeAssembly(c, { type: 'set-arrangement', kind: 'l' }); a.update(c); await a.setFinishes(c)
  expect(a.group.getObjectByName('corner-2/Top')).toBeUndefined(); expect(disposed).toHaveBeenCalledTimes(1)
  expect(a.group.getObjectByName('corner-1/Top')).toBe(left)
  c = updateWardrobeAssembly(c, { type: 'set-arrangement', kind: 'straight' }); a.update(c); await a.setFinishes(c)
  expect(a.group.getObjectByName('corner-1/Top')).toBeUndefined()
  expect(a.group.getObjectByName('section-3/Drawer_1/Front')!.parent!.parent).toBe(a.group)
  a.dispose(); a.dispose()
})
it('fits the largest legal U layouts through the entrance on desktop and portrait, keeping independent cached views', () => {
  for (const [split, secondSplit] of [[7, 13], [17, 18], [1, 18], [1, 2]]) {
    const c = normalizeWardrobeAssembly({ arrangement: { kind: 'u', split, secondSplit }, sections: Array(19).fill({ width: 1, height: 2.8, depth: .8 }) }), frame = wardrobeClosedBounds(c)
    expect(wardrobeAisleWidth(c)).toBeGreaterThan(1)
    for (const aspect of [1.6, .45]) {
      const camera = new PerspectiveCamera(40, aspect, .1, 100)
      const controls = { target: new Vector3(), minDistance: 1, maxDistance: 5, zoomToCursor: false, screenSpacePanning: false, update: () => false }
      const framing = createFurnitureFraming(camera, controls)
      framing.select('wardrobe-assembly', frame, 'wardrobe-assembly-left', 1.4, 1)
      const lPosition = camera.position.clone()
      framing.select('wardrobe-assembly', frame, 'wardrobe-assembly-u', 1.4, 0)
      expect(camera.position.x).toBe(0); expect(camera.position.z).toBeGreaterThan(frame.depth / 2)
      expect(controls.minDistance).toBe(.65); expect(controls.zoomToCursor).toBe(true)
      camera.updateMatrixWorld(true)
      for (const x of [-frame.width / 2, frame.width / 2]) for (const y of [0, frame.height]) for (const z of [-frame.depth / 2, frame.depth / 2]) {
        const p = new Vector3(x, y, z).project(camera)
        expect(Math.abs(p.x)).toBeLessThan(1); expect(Math.abs(p.y)).toBeLessThan(1); expect(p.z).toBeLessThan(1); expect(p.z).toBeGreaterThan(-1)
      }
      framing.select('wardrobe-assembly', frame, 'wardrobe-assembly-left', 1.4, 1)
      expect(camera.position).toEqual(lPosition)
    }
  }
})
it('reuses geometry for 21 modules through repeated redistribution, with no stale objects or active idle rendering', () => {
  const c = normalizeWardrobeAssembly({ arrangement: { kind: 'u', split: 7, secondSplit: 13 }, sections: Array.from({ length: 19 }, (_, i) => ({ id: `section-${i + 1}`, width: 1, height: 2.8, depth: .8, shelves: 2, drawers: { count: 4, height: .2, facadeStyle: 'fluted-wide', handle: 'edge-pull' }, doors: { count: 2, facadeStyle: 'fluted-wide', handle: 'profile' } })) })
  const a = createWardrobeAssembly(c)
  const counts = () => { const geometries = new Set(), meshes = new Set(); a.group.traverse(n => { if (n instanceof Mesh) { geometries.add(n.geometry); meshes.add(n) } }); return { geometries: geometries.size, meshes: meshes.size } }
  const initial = counts()
  expect(initial.geometries).toBeLessThan(40); expect(initial.meshes).toBeGreaterThan(1000)
  for (const split of [1, 12, 17, 7]) {
    a.update(normalizeWardrobeAssembly({ ...c, arrangement: { ...c.arrangement, split, secondSplit: split + 1 } }))
    expect(counts()).toEqual(initial)
  }
  expect(a.motion.update(.1)).toBe(false)
  a.dispose(); expect(a.group.children).toHaveLength(0)
})
