import { expect, it } from 'vitest'
import { Box3, Group, Mesh, MeshStandardMaterial, BoxGeometry } from 'three'
import { normalizeWardrobeAssembly } from '../../configurator/wardrobeAssembly/state'
import { createWardrobeAssembly } from './wardrobeAssembly'
import { limitDoorSwing } from './doorClearance'
import type { DrawerMotionEntry } from './wardrobeDrawerMotion'

it.each(['left', 'right'] as const)('serializes crossing leaves at the %s U corner and leaves the other side usable', side => {
  const c = normalizeWardrobeAssembly({ arrangement: { kind: 'u', split: 2, secondSplit: 3 }, sections: [
    { width: .6, shelves: 0, doors: { count: 1, hinge: 'left', handle: 'none' } },
    { width: .6, shelves: 0, doors: { count: 1, hinge: 'right', handle: 'none' } },
    { width: .6, shelves: 0, doors: { count: 1, hinge: 'right', handle: 'none' } },
    { width: .6, shelves: 0, doors: { count: 1, hinge: 'left', handle: 'none' } },
  ] })
  const a = createWardrobeAssembly(c)
  const firstId = side === 'left' ? 'section-1/Door_Left' : 'section-2/Door_Right'
  const secondId = side === 'left' ? 'section-3/Door_Right' : 'section-4/Door_Left'
  const first = a.group.getObjectByName(firstId)!, second = a.group.getObjectByName(secondId)!
  a.motion.toggle(firstId); a.motion.update(.5)
  expect(Math.abs(first.rotation.y)).toBeCloseTo(Math.PI / 2)
  a.motion.toggle(secondId); a.motion.update(.24)
  expect(second.rotation.y).toBeCloseTo(0)
  a.motion.update(.24); expect(first.rotation.y).toBeCloseTo(0)
  a.motion.update(.5); expect(Math.abs(second.rotation.y)).toBeCloseTo(Math.PI / 2)
  const farId = side === 'left' ? 'section-4/Door_Left' : 'section-3/Door_Right'
  a.motion.toggle(farId); a.motion.update(.5)
  expect(Math.abs(a.group.getObjectByName(farId)!.rotation.y)).toBeCloseTo(Math.PI / 2)
  expect(a.motion.getStates().filter(p => p.open)).toHaveLength(2)
  a.motion.setAll(false, true); a.motion.setAll(true)
  for (let i = 0; i < 6; i++) a.motion.update(.5)
  expect(a.motion.getStates().filter(p => p.open)).toHaveLength(2)
  expect(a.motion.update(.1)).toBe(false)
  a.dispose()
})
it('limits swing at the second corner with unequal depths, so internal drawers cannot pass a partially open leaf', () => {
  const c = normalizeWardrobeAssembly({ arrangement: { kind: 'u', split: 2, secondSplit: 3 }, sections: [
    { width: .6, depth: .8, shelves: 0 },
    { width: .4, depth: .4, shelves: 0, drawers: { count: 2, height: .2 }, doors: { count: 1, hinge: 'right', handle: 'profile' } },
    { width: .6, depth: .55, shelves: 0 }, { width: .6, depth: .55, shelves: 0 },
  ] })
  const a = createWardrobeAssembly(c)
  const states = a.motion.getStates(), drawer = states.find(p => p.id === 'section-2/Drawer_1')!
  expect(drawer.enabled).toBe(false); expect(drawer.reason).toContain('Соседняя секция')
  a.motion.toggle(drawer.id); a.motion.update(.5)
  expect(a.group.getObjectByName(drawer.id)!.position.z).toBe(0)
  a.motion.toggle('section-2/Door_Right'); a.motion.update(.5)
  expect(Math.abs(a.group.getObjectByName('section-2/Door_Right')!.rotation.y)).toBeLessThan(Math.PI / 2)
  a.dispose()
})
it('detects opposing-run sweeps and limits a travel that would hit the opposite closed body', () => {
  // Deliberately overlong travel exercises the generic collision guard. Normal
  // drawers are shorter; legal U corners already provide a generous aisle.
  const c = normalizeWardrobeAssembly({ arrangement: { kind: 'u', split: 1, secondSplit: 2 }, sections: Array(3).fill({ width: .4, depth: .8, shelves: 0 }) })
  const root = new Group(), material = new MeshStandardMaterial(), geometry = new BoxGeometry(.3, .2, .3)
  geometry.computeBoundingBox()
  const entries: DrawerMotionEntry[] = [1, -1].map((sign, i) => {
    const parent = new Group(); parent.position.set(sign * -.8, 0, .65); parent.rotation.y = sign * Math.PI / 2; root.add(parent)
    const node = new Group(), mesh = new Mesh(geometry, material); mesh.position.y = .5; mesh.updateMatrix(); node.add(mesh); parent.add(node)
    return { id: `section-${i + 2}/Drawer_1`, node, travel: 3 }
  })
  root.updateMatrixWorld(true); limitDoorSwing(entries, c)
  expect(entries[0].conflicts).toContain(entries[1].id)
  expect(entries[1].conflicts).toContain(entries[0].id)
  for (const entry of entries) {
    expect(entry.travel).toBeLessThan(3)
    entry.node.position.z = entry.travel; root.updateMatrixWorld(true)
    const b = new Box3().setFromObject(entry.node)
    expect(b.min.x).toBeGreaterThan(-.9); expect(b.max.x).toBeLessThan(.9)
  }
  geometry.dispose(); material.dispose()
})
