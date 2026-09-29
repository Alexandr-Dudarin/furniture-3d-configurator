import { expect, it, vi } from 'vitest'
import { Box3, Mesh, MeshStandardMaterial, Raycaster, Vector3 } from 'three'
import { type WardrobeDrawerHandle } from '../../configurator/wardrobeAssembly/drawerHandles'
import { normalizeWardrobeAssembly, wardrobeClosedBounds } from '../../configurator/wardrobeAssembly/state'
import { createWardrobeAssembly, planWardrobeParts } from './wardrobeAssembly'

const config = (handle?: WardrobeDrawerHandle, placement: 'flush' | 'recessed' = 'flush', width = .6, depth = .55, row = .2) => normalizeWardrobeAssembly({ sections: [
  { id: 'section-1', width, depth, height: 2.2, shelves: 0, rod: false, drawers: { count: 2, height: row, placement, ...(handle ? { handle } : {}) } },
] })
const drawerId = 'section-1/Drawer_1', gripName = drawerId + '/Handle', frontName = drawerId + '/Front'

it('uses the selected handle projection, physical attachment and unchanged drawer joints at extreme sizes', () => {
  for (const placement of ['flush', 'recessed'] as const) for (const handle of ['bar', 'knob', 'none'] as const) for (const width of [.4, 1]) for (const depth of [.4, .8]) for (const row of [.2, .3]) {
    const configuration = config(handle, placement, width, depth, row), assembly = createWardrobeAssembly(configuration)
    const front = new Box3().setFromObject(assembly.group.getObjectByName(frontName)!, true)
    const side = new Box3().setFromObject(assembly.group.getObjectByName(drawerId + '/Side_1')!, true)
    expect(side.max.z).toBeCloseTo(front.min.z, 6)
    const grip = assembly.group.getObjectByName(gripName)
    if (handle === 'none') {
      expect(grip).toBeUndefined()
      expect(planWardrobeParts(configuration).some(p => p.name.includes('/Handle'))).toBe(false)
    } else {
      const box = new Box3().setFromObject(grip!, true), expected = handle === 'bar' ? .028 : .02
      expect(box.max.z - front.max.z).toBeCloseTo(expected, 6)
      expect(box.max.x).toBeLessThan(front.max.x); expect(box.min.x).toBeGreaterThan(front.min.x)
      expect(box.max.y).toBeLessThan(front.max.y); expect(box.min.y).toBeGreaterThan(front.min.y)
      const mounts = planWardrobeParts(configuration).filter(p => p.name.startsWith(drawerId + '/HandleMount'))
      expect(mounts).toHaveLength(handle === 'bar' ? 2 : 1)
      for (const mount of mounts) {
        const box = new Box3().setFromObject(assembly.group.getObjectByName(mount.name)!, true)
        expect(box.min.z).toBeCloseTo(front.max.z, 6)
      }
    }
    const size = new Box3().setFromObject(assembly.group, true).getSize(new Vector3()), bounds = wardrobeClosedBounds(configuration)
    expect(size.z).toBeCloseTo(bounds.depth, 6)
    expect(size.x).toBeCloseTo(bounds.width, 6); expect(size.y).toBeCloseTo(bounds.height, 6)
    assembly.dispose()
  }
})
it('retains legacy bars and keeps both drawer openness and facade hit testing when handles are removed', () => {
  expect(planWardrobeParts(config())).toEqual(planWardrobeParts(config('bar')))
  const assembly = createWardrobeAssembly(config()), front = assembly.group.getObjectByName(frontName)!
  assembly.motion.toggle(drawerId); assembly.motion.update(.24)
  const originalZ = front.getWorldPosition(new Vector3()).z
  for (const handle of ['knob', 'none', 'bar', 'none'] as const) {
    assembly.update(config(handle))
    expect(assembly.group.getObjectByName(frontName)).toBe(front)
    expect(front.getWorldPosition(new Vector3()).z).toBeCloseTo(originalZ, 8)
    expect(assembly.motion.getStates().find(p => p.id === drawerId)?.open).toBe(true)
    expect(assembly.motion.findPart(front)).toBe(drawerId)
    if (handle === 'none') expect(assembly.group.getObjectByName(gripName)).toBeUndefined()
    else expect(assembly.motion.findPart(assembly.group.getObjectByName(gripName)!)).toBe(drawerId)
  }
  assembly.motion.setAll(false, true)
  const ray = new Raycaster(new Vector3(0, .186, 2), new Vector3(0, 0, -1))
  const hit = ray.intersectObject(assembly.group, true)[0]
  expect(hit.object.name).toBe(frontName)
  expect(assembly.motion.findPart(hit.object)).toBe(drawerId)
  assembly.motion.toggle(drawerId); assembly.motion.setReducedMotion(true)
  expect(assembly.motion.update(.016)).toBe(false)
  expect(front.getWorldPosition(new Vector3()).z).toBeGreaterThan(originalZ)
  assembly.dispose()
})
it('shares handle materials and geometry, releases removed shapes once, and keeps hardware on handleless slides', async () => {
  const makeMaterial = vi.fn(async () => new MeshStandardMaterial())
  const configuration = { ...config('bar'), hardwareFinish: 'metal-brass-satin' }
  const assembly = createWardrobeAssembly(configuration, { createMaterial: makeMaterial })
  await assembly.setFinishes(configuration)
  const grip = assembly.group.getObjectByName(gripName) as Mesh
  const other = assembly.group.getObjectByName('section-1/Drawer_2/Handle') as Mesh
  const geometry = grip.geometry, disposed = vi.fn(); geometry.addEventListener('dispose', disposed)
  expect(other.geometry).toBe(geometry); expect(other.material).toBe(grip.material)
  for (const handle of ['knob', 'none', 'bar', 'none'] as const) {
    const next = { ...config(handle), hardwareFinish: 'metal-brass-satin' }
    assembly.update(next); await assembly.setFinishes(next)
    const slide = assembly.group.getObjectByName(drawerId + '/MovingSlide_1') as Mesh
    expect(slide.material).toBe(grip.material)
  }
  expect(disposed).toHaveBeenCalledTimes(1)
  expect(makeMaterial).toHaveBeenCalledTimes(2)
  expect(grip.parent).toBeNull()
  assembly.dispose(); expect(disposed).toHaveBeenCalledTimes(1)
})
