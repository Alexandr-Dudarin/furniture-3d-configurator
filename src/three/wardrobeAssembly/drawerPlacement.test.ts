import { expect, it } from 'vitest'
import { Box3, Vector3 } from 'three'
import { normalizeWardrobeAssembly, wardrobeClosedBounds, type WardrobeDrawers } from '../../configurator/wardrobeAssembly/state'
import { createWardrobeAssembly, planWardrobeParts } from './wardrobeAssembly'

const config = (placement?: WardrobeDrawers['placement'], depth = .55, width = .6, height = .25) => normalizeWardrobeAssembly({ sections: [
  { id: 'section-1', width, depth, height: 2.2, shelves: 0, rod: false, drawers: { count: 4, height, ...(placement ? { placement } : {}) } },
] })
const frontEdge = (p: ReturnType<typeof planWardrobeParts>[number]) => p.position[2] + p.size[2] / 2
const backEdge = (p: ReturnType<typeof planWardrobeParts>[number]) => p.position[2] - p.size[2] / 2

it('places the front face flush or 29 mm recessed, with a joined box and unchanged rear clearance at all extremes', () => {
  for (const placement of ['flush', 'recessed'] as const) for (const depth of [.4, .8]) for (const width of [.4, 1]) for (const row of [.2, .25, .3]) {
    const parts = planWardrobeParts(config(placement, depth, width, row)), side = parts.find(p => p.name === 'section-1/Side_Left')!
    for (let i = 1; i <= 4; i++) {
      const base = `section-1/Drawer_${i}/`, get = (suffix: string) => parts.find(p => p.name === base + suffix)!
      const front = get('Front'), wall = get('Side_1'), bottom = get('Bottom'), back = get('Back'), handle = get('Handle')
      expect(frontEdge(side) - frontEdge(front)).toBeCloseTo(placement === 'flush' ? 0 : .029, 8)
      expect(frontEdge(wall)).toBeCloseTo(backEdge(front), 8)
      expect(frontEdge(bottom)).toBeCloseTo(backEdge(front), 8)
      expect(backEdge(bottom)).toBeCloseTo(frontEdge(back), 8)
      expect(backEdge(back) - (-depth / 2 + .004)).toBeCloseTo(.02, 8)
      expect(handle.position[2] + .004 - frontEdge(front)).toBeCloseTo(.028, 8)
      expect(get('HandleMount_1').position[2] - .01).toBeCloseTo(frontEdge(front), 8)
      expect(wall.travel).toBe(front.travel)
      expect(backEdge(get('MovingSlide_1')) + front.travel!).toBeLessThan(frontEdge(get('FixedSlide_1')))
      expect(front.size[2]).toBe(.016); expect(wall.size[0]).toBe(.016); expect(bottom.size[1]).toBe(.004)
    }
    expect(parts.every(p => p.size.every(n => Number.isFinite(n) && n > 0))).toBe(true)
  }
})
it('old default and explicitly recessed geometry are identical', () => {
  expect(planWardrobeParts(config())).toEqual(planWardrobeParts(config('recessed')))
})
it('matches the physical closed bounding box including protruding handles at mixed section depths', () => {
  for (const deeperFlush of [false, true]) {
    const configuration = config('flush', .4)
    configuration.sections.push({ ...configuration.sections[0], id: 'section-2', depth: .8, drawers: { count: 2, height: .2, placement: deeperFlush ? 'flush' : 'recessed' } })
    const assembly = createWardrobeAssembly(configuration), box = new Box3().setFromObject(assembly.group, true)
    const size = box.getSize(new Vector3()), declared = wardrobeClosedBounds(configuration)
    expect(size.x).toBeCloseTo(declared.width, 6); expect(size.y).toBeCloseTo(declared.height, 6); expect(size.z).toBeCloseTo(declared.depth, 6)
    expect(box.min.z).toBeCloseTo(-.4, 6)
    assembly.dispose()
  }
})
it('retains opening progress and front-to-box joints through repeated placement changes, without accumulating offsets', () => {
  const assembly = createWardrobeAssembly(config()), id = 'section-1/Drawer_1', front = assembly.group.getObjectByName(id + '/Front')!
  assembly.motion.toggle(id); assembly.motion.update(.24)
  for (const placement of ['flush', 'recessed', 'flush', 'recessed', 'flush'] as const) {
    const configuration = config(placement), part = planWardrobeParts(configuration).find(p => p.name === id + '/Front')!
    assembly.update(configuration)
    expect(assembly.group.getObjectByName(id + '/Front')).toBe(front)
    expect(assembly.motion.getStates().find(p => p.id === id)?.open).toBe(true)
    const position = front.getWorldPosition(new Vector3())
    expect(position.z).toBeCloseTo(part.position[2] + part.travel! * .5, 8)
    const side = new Box3().setFromObject(assembly.group.getObjectByName(id + '/Side_1')!, true)
    const face = new Box3().setFromObject(front, true)
    expect(side.max.z).toBeCloseTo(face.min.z, 6)
  }
  assembly.motion.setAll(false, true)
  const closed = new Box3().setFromObject(front, true)
  expect(closed.max.z).toBeCloseTo(.55 / 2, 6)
  expect(assembly.motion.update(.016)).toBe(false)
  assembly.dispose()
})
