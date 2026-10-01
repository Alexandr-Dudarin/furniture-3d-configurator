import { expect, it, vi } from 'vitest'
import { Box3, Mesh, MeshStandardMaterial, Vector3 } from 'three'
import { normalizeWardrobeAssembly, wardrobeClosedBounds } from '../../configurator/wardrobeAssembly/state'
import { CORNER_ID, wardrobePlacement } from '../../configurator/wardrobeAssembly/arrangement'
import { createWardrobeAssembly } from './wardrobeAssembly'
const config = (side: 'left' | 'right' = 'left', small = false) => normalizeWardrobeAssembly({
  arrangement: { kind: 'l', side, split: 1, corner: { height: small ? .8 : 2.8, shelves: small ? 2 : 6 } },
  sections: [{ id: 'section-1', width: .6, depth: small ? .4 : .8, height: small ? .8 : 2.8, shelves: 0, drawers: { count: 2, height: .2, placement: 'flush', handle: 'edge-pull' }, doors: { count: 1, hinge: 'right', handle: 'edge-pull' } },
    { id: 'section-2', width: 1, depth: small ? .45 : .8, height: small ? .8 : 2.2, shelves: 0, drawers: { count: 2, height: .2, facadeStyle: 'frame', handle: 'finger-notch' }, doors: { count: 2, facadeStyle: 'frame', handle: 'semicircle' } }],
})
const box = (n: Parameters<Box3['setFromObject']>[0]) => new Box3().setFromObject(n, true)
it.each(['left', 'right'] as const)('matches declared dimensions, joins and real panel thickness for %s turns and size extremes', side => {
  for (const small of [false, true]) {
    const c = config(side, small), a = createWardrobeAssembly(c), expected = wardrobeClosedBounds(c)
    const size = box(a.group).getSize(new Vector3())
    expect(size.x).toBeCloseTo(expected.width, 6); expect(size.y).toBeCloseTo(expected.height, 6); expect(size.z).toBeCloseTo(expected.depth, 6)
    expect(box(a.group).min.y).toBeCloseTo(0, 6)
    const layout = wardrobePlacement(c)
    for (const p of layout.sections) {
      const s = box(a.group.getObjectByName(`${p.id}/Side_Left`)!), t = box(a.group.getObjectByName(`${p.id}/Side_Right`)!)
      const envelope = s.clone().union(t)
      expect(envelope.getCenter(new Vector3()).x).toBeCloseTo(p.x, 6)
      expect(envelope.getCenter(new Vector3()).z).toBeCloseTo(p.z, 6)
      expect(Math.min(...s.getSize(new Vector3()).toArray())).toBeCloseTo(.016, 6)
    }
    const panels: Mesh[] = []
    a.group.traverse(n => { if (n instanceof Mesh && n.name.startsWith(CORNER_ID) && /\/(Bottom|Shelf_\d+|Top)$/.test(n.name)) panels.push(n) })
    panels.sort((a, b) => a.position.y - b.position.y)
    expect(panels).toHaveLength(c.arrangement!.corner.shelves + 2)
    panels.forEach((p, i) => {
      expect(box(p).getSize(new Vector3()).y).toBeCloseTo(.016, 6)
      if (i) expect(box(p).min.y - box(panels[i - 1]).max.y).toBeGreaterThanOrEqual(.2 - 1e-6)
      for (const attribute of ['position', 'normal', 'uv']) expect([...p.geometry.getAttribute(attribute).array].every(Number.isFinite)).toBe(true)
    })
    a.dispose()
  }
})
it('moves side-run drawers perpendicular to the main run and keeps raycast IDs and obstacles attached', () => {
  const c = config(), a = createWardrobeAssembly(c)
  const front = a.group.getObjectByName('section-2/Drawer_1/Front')!
  expect(a.motion.findPart(front)).toBe('section-2/Drawer_1')
  const before = front.getWorldPosition(new Vector3())
  a.motion.toggle('section-2/Drawer_1')
  for (let i = 0; i < 5; i++) a.motion.update(.5)
  expect(a.motion.getStates().find(p => p.id === 'section-2/Drawer_1')!.open).toBe(true)
  const after = front.getWorldPosition(new Vector3())
  expect(after.x - before.x).toBeGreaterThan(.2); expect(after.z).toBeCloseTo(before.z, 7)
  expect(a.getCameraObstacles().some(b => b.containsPoint(after))).toBe(true)
  expect(a.motion.update(.1)).toBe(false)
  a.dispose()
})
it('keeps materials/UVs during turns, applies the corner override and releases removed geometry and materials', async () => {
  const make = vi.fn(async (id: string) => { const m = new MeshStandardMaterial(); m.name = id; return m })
  const c = config(), a = createWardrobeAssembly(c, { createMaterial: make })
  await a.setFinishes(c)
  const corner = a.group.getObjectByName('corner-1/Top') as Mesh, dispose = vi.spyOn(corner.geometry, 'dispose')
  const drawer = a.group.getObjectByName('section-2/Drawer_1/Front') as Mesh, geometry = drawer.geometry, uv = geometry.getAttribute('uv')
  const next = normalizeWardrobeAssembly({ ...c, arrangement: { ...c.arrangement, side: 'right', corner: { ...c.arrangement!.corner, bodyFinish: 'oak-natural' } }, sections: c.sections.map((s, i) => ({ ...s, facadeFinish: i ? 'oak-black' : 'board-white-matte' })) })
  a.update(next); await a.setFinishes(next)
  expect(drawer.geometry).toBe(geometry); expect(drawer.geometry.getAttribute('uv')).toBe(uv)
  expect((drawer.material as MeshStandardMaterial).name).toBe('oak-black')
  expect((corner.material as MeshStandardMaterial).name).toBe('oak-natural')
  expect(dispose).toHaveBeenCalledTimes(1)
  const oakDispose = vi.spyOn(corner.material as MeshStandardMaterial, 'dispose')
  const straight = { ...next, arrangement: undefined }
  a.update(straight); await a.setFinishes(straight)
  expect(a.group.getObjectByName('corner-1/Top')).toBeUndefined()
  expect(oakDispose).toHaveBeenCalledTimes(1)
  expect(drawer.parent!.parent).toBe(a.group)
  a.dispose(); a.dispose()
})
it('builds the full 21-section layout with geometry reuse and no accumulating scene objects on edits', () => {
  const c = normalizeWardrobeAssembly({ ...config(), arrangement: { ...config().arrangement, split: 10 }, sections: Array.from({ length: 20 }, (_, i) => ({ id: `section-${i + 1}`, width: 1, height: 2.8, depth: .8, shelves: 6 })) })
  const a = createWardrobeAssembly(c)
  const counts = () => { const geometry = new Set(), meshes = new Set(); a.group.traverse(n => { if (n instanceof Mesh) { meshes.add(n); geometry.add(n.geometry) } }); return { geometry: geometry.size, meshes: meshes.size } }
  const original = counts()
  expect(original.meshes).toBeGreaterThan(200); expect(original.geometry).toBeLessThan(20)
  for (let i = 0; i < 5; i++) a.update(normalizeWardrobeAssembly({ ...c, arrangement: { ...c.arrangement, side: i % 2 ? 'right' : 'left', split: i + 5 } }))
  expect(counts()).toEqual(original)
  a.dispose(); expect(a.group.children).toHaveLength(0)
})
