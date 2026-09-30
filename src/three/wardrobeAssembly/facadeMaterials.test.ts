import { expect, it, vi } from 'vitest'
import { Mesh, MeshStandardMaterial } from 'three'
import { normalizeWardrobeAssembly, updateWardrobeAssembly } from '../../configurator/wardrobeAssembly/state'
import { createWardrobeAssembly } from './wardrobeAssembly'

it('colors only the fronts, preserves separate door overrides and shares materials without rebuilding or moving meshes', async () => {
  let c = normalizeWardrobeAssembly({ bodyFinish: 'oak-natural', sections: [
    { id: 'section-1', width: .6, shelves: 1, doors: { count: 1, finish: 'oak-black', facadeStyle: 'fluted-wide' }, drawers: { count: 2, height: .25, facadeStyle: 'fluted-wide', handle: 'finger-notch' } },
    { id: 'section-2', width: .6, shelves: 1, doors: { count: 1 }, drawers: { count: 2, height: .25 } },
  ] })
  const make = vi.fn(async (id: string) => { const m = new MeshStandardMaterial(); m.name = id; return m })
  const a = createWardrobeAssembly(c, { createMaterial: make })
  await a.setFinishes(c)
  a.motion.setAll(true, true)
  const meshes: Mesh[] = []; a.group.traverse(n => { if (n instanceof Mesh) meshes.push(n) })
  const geometry = meshes.map(m => m.geometry), position = meshes.map(m => m.position.clone())
  const pose = a.motion.getStates()
  const get = (name: string) => a.group.getObjectByName(name) as Mesh
  const finish = (name: string) => (get(name).material as MeshStandardMaterial).name
  c = updateWardrobeAssembly(c, { type: 'set-wardrobe-finish', slot: 'facadeFinish', finishId: 'board-white-matte' })
  a.update(c); await a.setFinishes(c)
  expect(finish('section-1/Drawer_1/Front')).toBe('board-white-matte')
  expect(finish('section-1/Door_Left/Front')).toBe('oak-black')
  expect(finish('section-2/Door_Left/Front')).toBe('board-white-matte')
  expect(get('section-1/Drawer_1/Front').material).toBe(get('section-2/Door_Left/Front').material)
  for (const name of ['section-1/Side_Left', 'section-1/Shelf_1', 'section-1/Drawer_1/Side_1', 'section-1/Drawer_1/Bottom', 'section-1/Drawer_1/Back']) expect(finish(name)).toBe('oak-natural')
  expect(finish('section-2/Drawer_1/Handle')).toBe('metal-black-matte')
  const white = get('section-1/Drawer_1/Front').material as MeshStandardMaterial, disposeWhite = vi.spyOn(white, 'dispose')
  c = updateWardrobeAssembly(c, { type: 'set-section-finish', id: 'section-1', slot: 'facadeFinish', finishId: 'board-muted-green' })
  a.update(c); await a.setFinishes(c)
  expect(finish('section-1/Drawer_1/Front')).toBe('board-muted-green')
  expect(finish('section-1/Door_Left/Front')).toBe('oak-black')
  expect(disposeWhite).not.toHaveBeenCalled()
  c = updateWardrobeAssembly(c, { type: 'set-wardrobe-finish', slot: 'facadeFinish', finishId: null })
  a.update(c); await a.setFinishes(c)
  expect(disposeWhite).toHaveBeenCalledTimes(1)
  expect(finish('section-2/Door_Left/Front')).toBe('oak-natural')
  meshes.forEach((m, i) => { expect(m.geometry).toBe(geometry[i]); expect(m.position).toEqual(position[i]) })
  expect(a.motion.getStates()).toEqual(pose)
  expect(make.mock.calls.filter(([id]) => id === 'board-white-matte')).toHaveLength(1)
  a.dispose(); a.dispose(); expect(disposeWhite).toHaveBeenCalledTimes(1)
})
