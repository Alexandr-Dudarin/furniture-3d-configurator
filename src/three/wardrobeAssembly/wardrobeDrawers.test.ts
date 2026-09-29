import { expect, it, vi } from 'vitest'
import { Box3, Mesh, MeshStandardMaterial, Vector3 } from 'three'
import { normalizeWardrobeAssembly, wardrobeBounds, wardrobeFillingFloor } from '../../configurator/wardrobeAssembly/state'
import { createWardrobeAssembly, planWardrobeParts } from './wardrobeAssembly'
import { createFurnitureMotionStore } from '../../configurator/furnitureMotionStore'

const config = (sections: object[] = [{}]) => normalizeWardrobeAssembly({ sections: sections.map((s, i) => ({ id: `section-${i + 1}`, width: .6, height: 2.2, depth: .55, shelves: 0, rod: false, drawers: { count: 2, height: .2 }, ...s })) })
const lower = (p: ReturnType<typeof planWardrobeParts>[number], axis: number) => p.position[axis] - p.size[axis] / 2
const upper = (p: ReturnType<typeof planWardrobeParts>[number], axis: number) => p.position[axis] + p.size[axis] / 2
it('joins every box to its front, preserves panel thickness, reveals a real cavity and retains slide overlap', () => {
  for (const width of [.4, 1]) for (const height of [.2, .25, .3]) for (const depth of [.4, .8]) {
    const configuration = config([{ width, depth, drawers: { count: 4, height } }]), parts = planWardrobeParts(configuration)
    const section = configuration.sections[0]
    const lid = parts.find(p => p.name.endsWith('/Drawers_Lid'))!
    expect(upper(lid, 1)).toBeCloseTo(wardrobeFillingFloor(section), 8)
    for (let i = 1; i <= section.drawers!.count; i++) {
      const base = `section-1/Drawer_${i}/`, front = parts.find(p => p.name === base + 'Front')!
      const bottom = parts.find(p => p.name === base + 'Bottom')!, back = parts.find(p => p.name === base + 'Back')!
      expect(front.size[2]).toBe(.016); expect(bottom.size[1]).toBe(.004)
      for (const side of [-1, 1]) {
        const wall = parts.find(p => p.name === base + `Side_${side}`)!
        const fixed = parts.find(p => p.name === base + `FixedSlide_${side}`)!
        const moving = parts.find(p => p.name === base + `MovingSlide_${side}`)!
        expect(upper(wall, 2)).toBeCloseTo(lower(front, 2), 8)
        expect(wall.size[0]).toBe(.016)
        expect(upper(wall, 1) - upper(bottom, 1)).toBeCloseTo(height - .044, 8)
        expect(lower(moving, 2) + moving.travel!).toBeLessThan(upper(fixed, 2))
        expect(fixed.drawerId).toBeUndefined()
      }
      expect(upper(bottom, 2)).toBeCloseTo(lower(front, 2), 8)
      expect(lower(bottom, 2)).toBeCloseTo(upper(back, 2), 8)
      expect(upper(front, 1)).toBeLessThanOrEqual(lower(lid, 1))
      expect(front.size[0] - bottom.size[0]).toBeGreaterThan(.032)
      expect(parts.filter(p => p.drawerId === front.drawerId)).toHaveLength(10)
    }
    expect(parts.every(p => p.size.every(n => Number.isFinite(n) && n > 0))).toBe(true)
  }
})
it('keeps the declared closed bounds for different section depths, including all handles', () => {
  const configuration = config([{ depth: .4, width: .4, height: .8 }, { depth: .8, width: 1, height: 2.8, drawers: { count: 4, height: .3 } }])
  const assembly = createWardrobeAssembly(configuration), box = new Box3().setFromObject(assembly.group, true)
  const size = box.getSize(new Vector3()), bounds = wardrobeBounds(configuration)
  expect(size.x).toBeCloseTo(bounds.width, 6); expect(size.y).toBeCloseTo(bounds.height, 6); expect(size.z).toBeCloseTo(bounds.depth, 6)
  expect(box.min.y).toBeCloseTo(0, 7)
  assembly.dispose()
})
it('opens all parts together, reverses smoothly and stops rendering after the motion ends', () => {
  const changed = vi.fn(), assembly = createWardrobeAssembly(config(), { onMotionChange: changed })
  const { motion, group } = assembly, front = group.getObjectByName('section-1/Drawer_1/Front')!, side = group.getObjectByName('section-1/Drawer_1/Side_1')!
  const frontStart = front.getWorldPosition(new Vector3()), sideStart = side.getWorldPosition(new Vector3())
  expect(motion.findPart(front)).toBe('section-1/Drawer_1')
  expect(motion.findPart(group.getObjectByName('section-1/Drawer_1/FixedSlide_1')!)).toBeNull()
  expect(motion.findPart(group.getObjectByName('section-1/Side_Left')!)).toBeNull()
  motion.toggle('section-1/Drawer_1'); expect(motion.update(.24)).toBe(true)
  const halfway = front.getWorldPosition(new Vector3()).z - frontStart.z
  expect(halfway).toBeGreaterThan(0)
  expect(side.getWorldPosition(new Vector3()).z - sideStart.z).toBeCloseTo(halfway, 8)
  motion.toggle('section-1/Drawer_1')
  expect(front.getWorldPosition(new Vector3()).z - frontStart.z).toBeCloseTo(halfway, 8)
  motion.update(.1); expect(front.getWorldPosition(new Vector3()).z - frontStart.z).toBeLessThan(halfway)
  motion.update(.48); expect(front.getWorldPosition(new Vector3()).z).toBeCloseTo(frontStart.z, 8)
  expect(motion.update(.016)).toBe(false)
  expect(motion.getStates().every(p => !p.open)).toBe(true)
  assembly.dispose()
})
it('retains openings during resizing and reordering, prunes deleted drawers and does not reopen new sections', () => {
  const configuration = config([{}, {}]), assembly = createWardrobeAssembly(configuration)
  assembly.motion.setAll(true, true)
  const next = config([{ width: .8, depth: .8, drawers: { count: 1, height: .3 } }, { width: .45 }])
  next.sections.reverse()
  assembly.update(next)
  expect(assembly.motion.getStates()).toHaveLength(3)
  expect(assembly.motion.getStates().every(p => p.open)).toBe(true)
  const parts = planWardrobeParts(next), part = parts.find(p => p.name === 'section-1/Drawer_1/Front')!
  const front = assembly.group.getObjectByName(part.name)!.getWorldPosition(new Vector3())
  expect(front.x).toBeCloseTo(part.position[0], 8)
  expect(front.z).toBeCloseTo(part.position[2] + part.travel!, 8)
  next.sections = next.sections.filter(s => s.id !== 'section-1'); assembly.update(next)
  expect(assembly.motion.getStates().some(p => p.id.startsWith('section-1/'))).toBe(false)
  assembly.update(configuration)
  expect(assembly.motion.getStates().filter(p => p.id.startsWith('section-1/')).every(p => !p.open)).toBe(true)
  assembly.dispose()
})
it('honours reduced motion and detaches the transient bridge without saved-state fields', () => {
  const store = createFurnitureMotionStore(), configuration = config(), saved = JSON.stringify(configuration)
  const publish = vi.fn()
  const assembly = createWardrobeAssembly(configuration, { onMotionChange: publish })
  const binding = store.attach('wardrobe-assembly', assembly.motion, assembly.motion.getStates())
  publish.mockImplementation(binding.publish)
  assembly.motion.setReducedMotion(true)
  store.toggle('wardrobe-assembly', 'section-1/Drawer_1')
  expect(store.getSnapshot().parts[0].open).toBe(true)
  expect(assembly.motion.update(.016)).toBe(false)
  expect(assembly.group.getObjectByName('section-1/Drawer_1')!.position.z).toBeGreaterThan(.2)
  expect(JSON.stringify(configuration)).toBe(saved)
  binding.detach(); assembly.dispose()
  expect(store.getSnapshot().parts).toEqual([])
  expect(assembly.motion.update(.016)).toBe(false)
})
it('loads hardware without a rod, shares finish resources and disposes drawer geometries once', async () => {
  const load = vi.fn<(id: string, anisotropy?: number) => Promise<MeshStandardMaterial>>(async () => new MeshStandardMaterial())
  const configuration = config([{ bodyFinish: 'oak-natural', hardwareFinish: 'metal-brass-satin' }]), assembly = createWardrobeAssembly(configuration, { createMaterial: load })
  await assembly.setFinishes(configuration)
  expect(load.mock.calls.map(([id]) => id)).toEqual(['oak-natural', 'metal-brass-satin'])
  const handle = assembly.group.getObjectByName('section-1/Drawer_1/Handle') as Mesh
  const second = assembly.group.getObjectByName('section-1/Drawer_2/Handle') as Mesh
  expect(handle.material).toBe(second.material)
  const geometries = new Set<Mesh['geometry']>()
  assembly.group.traverse(node => { if (node instanceof Mesh) geometries.add(node.geometry) })
  const disposals = [...geometries].map(g => vi.spyOn(g, 'dispose'))
  assembly.motion.setAll(true, true)
  assembly.dispose(); assembly.dispose()
  expect(disposals.every(spy => spy.mock.calls.length === 1)).toBe(true)
})
