import { expect, it, vi } from 'vitest'
import { Box3, Mesh, MeshStandardMaterial, Vector3 } from 'three'
import { normalizeWardrobeAssembly, wardrobeClosedBounds } from '../../configurator/wardrobeAssembly/state'
import { WARDROBE_DOOR_HANDLES, wardrobeDoorWidth } from '../../configurator/wardrobeAssembly/doors'
import { createWardrobeAssembly } from './wardrobeAssembly'
import { DRAWER_FACADE_STYLES } from '../../configurator/wardrobeAssembly/drawerFacades'
import { RELIEF_ATTRIBUTE } from '../facades/reliefFilter'
const config = (patch: object = {}) => normalizeWardrobeAssembly({ sections: [{ id: 'section-1', width: .6, height: 2.2, depth: .55, shelves: 0, rod: false, doors: { count: 1 }, ...patch }] })
const box = (node: Parameters<Box3['setFromObject']>[0]) => new Box3().setFromObject(node, true)

it.each(DRAWER_FACADE_STYLES)('%s keeps real leaf sizes, 16 mm thickness and closed bounds for all handles at size limits', style => {
  for (const { value: handle } of WARDROBE_DOOR_HANDLES) for (const large of [false, true]) {
    const c = config({ width: large ? 1 : .4, height: large ? 2.8 : .8, depth: large ? .8 : .4, doors: { count: large ? 2 : 1, handle, facadeStyle: style } })
    const a = createWardrobeAssembly(c)
    const fronts: Mesh[] = []
    a.group.traverse(node => { if (node instanceof Mesh && /Door_.*\/Front$/.test(node.name)) fronts.push(node) })
    expect(fronts).toHaveLength(c.sections[0].doors!.count)
    const bounds = box(a.group).getSize(new Vector3()), expected = wardrobeClosedBounds(c)
    expect(bounds.x).toBeCloseTo(expected.width, 6); expect(bounds.y).toBeCloseTo(expected.height, 6); expect(bounds.z).toBeCloseTo(expected.depth, 6)
    for (const f of fronts) {
      const b = box(f).getSize(new Vector3())
      expect(b.x).toBeCloseTo(wardrobeDoorWidth(c.sections[0].width, c.sections[0].doors!.count), 6)
      expect(b.x).toBeLessThanOrEqual(.6); expect(b.z).toBeCloseTo(.016, 6)
      expect(a.motion.findPart(f)).toBe(f.parent!.name)
      if (style.startsWith('fluted')) expect(f.geometry.hasAttribute(RELIEF_ATTRIBUTE)).toBe(true)
    }
    a.dispose()
  }
})
it('keeps closed drawer grips behind doors and gives every box a connected front', () => {
  for (const handle of ['bar', 'edge-pull', 'profile', 'semicircle', 'top-grip', 'finger-notch', 'none']) {
    const c = config({ width: 1, drawers: { count: 4, height: .3, handle, placement: 'flush' }, doors: { count: 2 } })
    const a = createWardrobeAssembly(c)
    const leaf = box(a.group.getObjectByName('section-1/Door_Left/Front')!)
    for (let i = 1; i <= 4; i++) {
      const prefix = `section-1/Drawer_${i}`
      const drawer = box(a.group.getObjectByName(prefix)!)
      expect(leaf.min.z - drawer.max.z).toBeGreaterThan(.0039)
      const front = box(a.group.getObjectByName(`${prefix}/Front`)!)
      const side = box(a.group.getObjectByName(`${prefix}/Side_1`)!)
      expect(side.max.z).toBeCloseTo(front.min.z, 7)
    }
    a.motion.setAll(true, true)
    const left = box(a.group.getObjectByName('section-1/Door_Left/Front')!), right = box(a.group.getObjectByName('section-1/Door_Right/Front')!)
    const drawer = box(a.group.getObjectByName('section-1/Drawer_1/Front')!)
    expect(drawer.min.x - left.max.x).toBeGreaterThan(.0039)
    expect(right.min.x - drawer.max.x).toBeGreaterThan(.0039)
    a.dispose()
  }
})
it('opens doors before extending a drawer, then retracts drawers before closing a leaf', () => {
  const a = createWardrobeAssembly(config({ width: 1, doors: { count: 2 }, drawers: { count: 2, height: .2 } }))
  const drawer = a.group.getObjectByName('section-1/Drawer_1')!, left = a.group.getObjectByName('section-1/Door_Left')!, right = a.group.getObjectByName('section-1/Door_Right')!
  a.motion.toggle(drawer.name)
  a.motion.update(.48)
  expect(drawer.position.z).toBe(0); expect(left.rotation.y).toBeCloseTo(-Math.PI / 2); expect(right.rotation.y).toBeCloseTo(Math.PI / 2)
  a.motion.update(.24); expect(drawer.position.z).toBeGreaterThan(0)
  a.motion.toggle(left.name)
  a.motion.update(.48); expect(drawer.position.z).toBe(0); expect(left.rotation.y).toBeCloseTo(-Math.PI / 2)
  a.motion.update(.48); expect(left.rotation.y).toBeCloseTo(0); expect(right.rotation.y).toBeCloseTo(Math.PI / 2)
  expect(a.motion.update(.1)).toBe(false)
  a.dispose()
})
it('preserves open poses on resizing and adds new leaves open when a drawer is already out', () => {
  const c = config({ doors: undefined, drawers: { count: 2, height: .2 } }), a = createWardrobeAssembly(c)
  a.motion.setAll(true, true)
  const next = config({ width: 1, doors: { count: 2 }, drawers: { count: 2, height: .2 } })
  a.update(next)
  expect(a.motion.getStates().every(p => p.open)).toBe(true)
  expect(a.group.getObjectByName('section-1/Door_Left')!.rotation.y).toBeCloseTo(-Math.PI / 2)
  const changed = config({ width: .6, doors: { count: 1, hinge: 'right', facadeStyle: 'frame' }, drawers: { count: 1, height: .25 } })
  a.update(changed)
  expect(a.group.getObjectByName('section-1/Door_Left')).toBeUndefined()
  expect(a.motion.getStates()).toHaveLength(2)
  expect(a.motion.getStates().every(p => p.open)).toBe(true)
  a.dispose()
})
it('supports instant reduced motion and repeated opposite requests without a deadlock', () => {
  const a = createWardrobeAssembly(config({ drawers: { count: 1, height: .2 } }))
  a.motion.toggle('section-1/Drawer_1'); a.motion.update(.2)
  a.motion.toggle('section-1/Door_Left'); a.motion.update(.2)
  a.motion.toggle('section-1/Drawer_1')
  for (let i = 0; i < 100; i++) a.motion.update(.02)
  expect(a.motion.getStates().every(p => p.open)).toBe(true)
  expect(a.motion.update(.1)).toBe(false)
  a.motion.setReducedMotion(true); a.motion.setAll(false)
  expect(a.motion.getStates().every(p => !p.open)).toBe(true)
  expect(a.motion.update(.1)).toBe(false)
  a.dispose()
})
it('limits a door blocked by a deeper neighbour and disables its drawers with a reason', () => {
  const c = normalizeWardrobeAssembly({ sections: [
    { id: 'section-1', width: .4, depth: .4, doors: { count: 1, hinge: 'right' }, drawers: { count: 1, height: .2 } },
    { id: 'section-2', width: .6, depth: .8 },
  ] })
  const a = createWardrobeAssembly(c)
  const drawer = a.motion.getStates().find(p => p.id === 'section-1/Drawer_1')!
  expect(drawer.enabled).toBe(false); expect(drawer.reason).toContain('Соседняя')
  a.motion.setAll(true, true)
  expect(a.group.getObjectByName(drawer.id)!.position.z).toBe(0)
  expect(a.group.getObjectByName('section-1/Door_Right')!.rotation.y).toBeLessThan(Math.PI / 2)
  c.sections[0].doors!.hinge = 'left'; a.update(c)
  expect(a.motion.getStates().find(p => p.id === drawer.id)?.enabled).toBe(true)
  a.dispose()
})
it('shares independent door finishes, updates inheritance and frees all resources once', async () => {
  const load = vi.fn(async () => new MeshStandardMaterial())
  const c = config({ doors: { count: 2, finish: 'oak-natural', facadeStyle: 'fluted-wide' } })
  const a = createWardrobeAssembly(c, { createMaterial: load }); await a.setFinishes(c)
  const front = a.group.getObjectByName('section-1/Door_Left/Front') as Mesh
  const mate = a.group.getObjectByName('section-1/Door_Right/Front') as Mesh
  expect(front.material).toBe(mate.material)
  expect(load).toHaveBeenCalledTimes(3)
  const geometry = front.geometry, material = front.material
  c.bodyFinish = 'board-white-matte'; a.update(c); await a.setFinishes(c)
  expect(front.material).toBe(material); expect(front.geometry).toBe(geometry)
  delete c.sections[0].doors!.finish; await a.setFinishes(c)
  expect(front.material).toBe((a.group.getObjectByName('section-1/Side_Left') as Mesh).material)
  const geometries = new Set<Mesh['geometry']>(); a.group.traverse(n => { if (n instanceof Mesh) geometries.add(n.geometry) })
  const spies = [...geometries].map(g => vi.spyOn(g, 'dispose'))
  a.dispose(); a.dispose(); expect(spies.every(s => s.mock.calls.length === 1)).toBe(true)
})
