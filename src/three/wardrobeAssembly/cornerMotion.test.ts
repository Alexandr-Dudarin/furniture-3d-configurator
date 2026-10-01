import { expect, it } from 'vitest'
import { normalizeWardrobeAssembly } from '../../configurator/wardrobeAssembly/state'
import { createWardrobeAssembly } from './wardrobeAssembly'
import { Group } from 'three'
import { createWardrobeDrawerMotion } from './wardrobeDrawerMotion'

it.each(['left', 'right'] as const)('serializes crossing doors at a real %s corner, including open-all and material/layout updates', side => {
  const c = normalizeWardrobeAssembly({ arrangement: { kind: 'l', side, split: 1 }, sections: [
    { width: .6, depth: .55, shelves: 0, doors: { count: 1, hinge: side === 'left' ? 'left' : 'right', handle: 'none' } },
    { width: .6, depth: .55, shelves: 0, doors: { count: 1, hinge: 'right', handle: 'none' } },
  ] })
  const a = createWardrobeAssembly(c)
  const ids = a.motion.getStates().map(p => p.id)
  const first = a.group.getObjectByName(ids[0])!, second = a.group.getObjectByName(ids[1])!
  a.motion.toggle(ids[0]); a.motion.update(.5)
  expect(Math.abs(first.rotation.y)).toBeCloseTo(Math.PI / 2)
  a.motion.toggle(ids[1])
  a.motion.update(.24)
  expect(second.rotation.y).toBe(0)
  a.motion.update(.24); expect(first.rotation.y).toBeCloseTo(0)
  a.motion.update(.5); expect(Math.abs(second.rotation.y)).toBeCloseTo(Math.PI / 2)
  expect(a.motion.update(.1)).toBe(false)
  a.motion.setAll(false, true); a.motion.setAll(true, true)
  expect(a.motion.getStates().filter(p => p.open)).toHaveLength(1)
  a.dispose()
})
it('waits for conflicting drawers to retract before closing their doors, handles reversal and reduced motion without idle frames', () => {
  const root = new Group(), nodes = ['a/door', 'a/drawer', 'b/door', 'b/drawer'].map(name => { const g = new Group(); g.name = name; root.add(g); return g })
  const motion = createWardrobeDrawerMotion(root, () => {})
  motion.sync(nodes.map((node, i) => ({ id: node.name, node, travel: .4, conflicts: i < 2 ? ['b/door', 'b/drawer'] : ['a/door', 'a/drawer'], ...(i % 2 === 0 ? { pivot: { origin: [0, 0, 0] as [number, number, number], angle: Math.PI / 2 } } : {}) })))
  motion.toggle('a/drawer'); motion.update(.5); motion.update(.5)
  motion.toggle('b/drawer'); motion.update(.5)
  expect(nodes[1].position.z).toBe(0); expect(nodes[0].rotation.y).toBeCloseTo(Math.PI / 2)
  expect(nodes[2].rotation.y).toBe(0); expect(nodes[3].position.z).toBe(0)
  motion.update(.5); expect(nodes[0].rotation.y).toBe(0)
  motion.update(.5); expect(nodes[2].rotation.y).toBeCloseTo(Math.PI / 2)
  motion.update(.5); expect(nodes[3].position.z).toBe(.4)
  motion.toggle('a/drawer'); motion.update(.1); motion.toggle('b/drawer')
  for (let i = 0; i < 10; i++) motion.update(.5)
  expect(motion.update(.1)).toBe(false)
  motion.setReducedMotion(true); motion.toggle('a/drawer')
  expect(nodes[2].rotation.y).toBe(0); expect(nodes[3].position.z).toBe(0)
  expect(nodes[1].position.z).toBe(.4)
  expect(motion.update(.1)).toBe(false)
  motion.dispose()
})
