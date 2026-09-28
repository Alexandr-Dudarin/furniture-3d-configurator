import { expect, it, vi } from 'vitest'
import { Box3, Mesh, MeshStandardMaterial, Vector3 } from 'three'
import { createDefaultWardrobe, createWardrobeSection, normalizeWardrobeAssembly, updateWardrobeAssembly, wardrobeBounds } from '../../configurator/wardrobeAssembly/state'
import { createWardrobeAssembly, planWardrobeParts } from './wardrobeAssembly'

it('matches declared outer dimensions with fixed thickness and aligned backs at every supported extreme', () => {
  for (const width of [.4, 1]) for (const height of [.8, 2.8]) for (const depth of [.4, .8]) {
    const config = normalizeWardrobeAssembly({ sections: [createWardrobeSection('section-1', 'hanging', { width, height, depth }), createWardrobeSection('section-2', 'shelves', { width: .65, height: 2.1, depth: .5 })] })
    const assembly = createWardrobeAssembly(config), bounds = wardrobeBounds(config)
    const box = new Box3().setFromObject(assembly.group, true), size = box.getSize(new Vector3())
    expect(size.x).toBeCloseTo(bounds.width, 6); expect(size.y).toBeCloseTo(bounds.height, 6); expect(size.z).toBeCloseTo(bounds.depth, 6)
    expect(box.min.y).toBeCloseTo(0, 6)
    const parts = planWardrobeParts(config)
    for (const p of parts.filter(p => /Side_/.test(p.name))) expect(p.size[0]).toBe(.016)
    for (const p of parts.filter(p => /Shelf_|\/Top$|\/Bottom$/.test(p.name))) expect(p.size[1]).toBe(.016)
    for (const p of parts.filter(p => /\/Back$/.test(p.name))) {
      expect(p.size[2]).toBe(.004)
      expect(p.position[2] - p.size[2] / 2).toBeCloseTo(-bounds.depth / 2, 8)
    }
    // Adjacent carcasses touch, with no air gap and no board volume overlap.
    const right = parts.find(p => p.name === 'section-1/Side_Right')!, left = parts.find(p => p.name === 'section-2/Side_Left')!
    expect(right.position[0] + .008).toBeCloseTo(left.position[0] - .008, 8)
    assembly.dispose()
  }
})
it('keeps both kinds of rods inside the section, with attached supports', () => {
  for (const depth of [.4, .45, .5, .8]) for (const shelves of [0, 1, 2]) {
    const config = normalizeWardrobeAssembly({ sections: [{ ...createWardrobeSection('section-1', 'hanging'), depth, shelves }] })
    const assembly = createWardrobeAssembly(config)
    for (const child of assembly.group.children) {
      const bounds = new Box3().setFromObject(child, true)
      expect(bounds.min.x).toBeGreaterThanOrEqual(-.300001); expect(bounds.max.x).toBeLessThanOrEqual(.300001)
      expect(bounds.min.z).toBeGreaterThanOrEqual(-depth / 2 - 1e-6); expect(bounds.max.z).toBeLessThanOrEqual(depth / 2 + 1e-6)
      expect(bounds.min.y).toBeGreaterThanOrEqual(-1e-6); expect(bounds.max.y).toBeLessThanOrEqual(2.200001)
    }
    const parts = planWardrobeParts(config), rod = parts.find(p => p.name.endsWith('/Rail'))!
    expect(rod.axis).toBe(depth < .5 ? 'z' : 'x')
    if (depth < .5) {
      for (const p of parts.filter(p => p.name.includes('/Bracket_'))) {
        expect(p.position[1] + p.size[1] / 2).toBeCloseTo(shelves ? 2.2 - .268 : 2.2 - .016, 7)
        expect(p.position[1] - p.size[1] / 2).toBeCloseTo(rod.position[1], 7)
      }
    }
    assembly.dispose()
  }
})
it('keeps usable shelf and hanging clearances across all supported heights and depths', () => {
  for (let heightCm = 80; heightCm <= 280; heightCm += 10) for (let depthCm = 40; depthCm <= 80; depthCm += 5) {
    for (const rod of [false, true]) for (const shelves of [0, 1, 2, 4, 6]) {
      const config = normalizeWardrobeAssembly({ sections: [{ id: 'section-1', height: heightCm / 100, depth: depthCm / 100, width: .6, rod, shelves }] })
      const parts = planWardrobeParts(config)
      const bottom = parts.find(p => p.name.endsWith('/Bottom'))!, top = parts.find(p => p.name.endsWith('/Top'))!
      const shelfParts = parts.filter(p => p.name.includes('/Shelf_')).sort((a, b) => a.position[1] - b.position[1])
      expect(shelfParts).toHaveLength(config.sections[0].shelves)
      const panels = [bottom, ...shelfParts, top]
      for (let i = 1; i < panels.length; i++) {
        const gap = panels[i].position[1] - panels[i].size[1] / 2 - panels[i - 1].position[1] - panels[i - 1].size[1] / 2
        expect(gap).toBeGreaterThanOrEqual(.2 - 1e-8)
      }
      if (rod) {
        const rail = parts.find(p => p.name.endsWith('/Rail'))!
        const below = panels.filter(p => p.position[1] < rail.position[1]).at(-1)!
        expect(rail.position[1] - rail.size[0] - below.position[1] - below.size[1] / 2).toBeGreaterThanOrEqual(.6 - 1e-8)
        const above = panels.find(p => p.position[1] > rail.position[1])!
        expect(above.position[1] - above.size[1] / 2 - rail.position[1] - rail.size[0]).toBeGreaterThan(.05)
        for (const bracket of parts.filter(p => p.name.includes('/Bracket_'))) {
          expect(bracket.size[1]).toBeGreaterThan(0)
          expect(bracket.position[1] + bracket.size[1] / 2).toBeCloseTo(above.position[1] - above.size[1] / 2, 7)
        }
      }
    }
  }
})
it('preserves geometry across reorder/material edits and frees abandoned geometry exactly once', async () => {
  let config = createDefaultWardrobe()
  const assembly = createWardrobeAssembly(config, { createMaterial: async () => new MeshStandardMaterial() })
  const left = assembly.group.getObjectByName('section-1/Side_Left') as Mesh
  const original = left.geometry, dispose = vi.spyOn(original, 'dispose')
  config = updateWardrobeAssembly(config, { type: 'move-section', id: 'section-1', direction: 1 })
  assembly.update(config)
  expect(left.geometry).toBe(original)
  const position = left.position.clone()
  await assembly.setFinishes({ ...config, bodyFinish: 'board-white-matte' })
  expect(left.geometry).toBe(original); expect(left.position).toEqual(position)
  config = { ...config, sections: config.sections.map(s => ({ ...s, height: 2.6 })) }
  assembly.update(config)
  expect(dispose).toHaveBeenCalledTimes(1)
  expect(left.geometry).not.toBe(original)
  const remaining = new Set(assembly.group.children.map(child => (child as Mesh).geometry))
  const spies = [...remaining].map(g => vi.spyOn(g, 'dispose'))
  assembly.dispose(); assembly.dispose()
  for (const spy of spies) expect(spy).toHaveBeenCalledTimes(1)
  expect(assembly.group.children).toHaveLength(0)
})
it('keeps metric UVs as panel dimensions change', () => {
  const config = createDefaultWardrobe(), assembly = createWardrobeAssembly(config)
  for (const height of [1.8, 2.6]) {
    assembly.update({ ...config, sections: config.sections.map(s => ({ ...s, height })) })
    const mesh = assembly.group.getObjectByName('section-1/Back') as Mesh
    const p = mesh.geometry.getAttribute('position'), n = mesh.geometry.getAttribute('normal'), uv = mesh.geometry.getAttribute('uv')
    const indices = Array.from({ length: p.count }, (_, i) => i).filter(i => n.getZ(i) > .999)
    const a = indices[0], b = indices.find(i => Math.abs(p.getY(i) - p.getY(a)) > 1)!
    expect(b).toBeDefined()
    expect(uv.getY(b) - uv.getY(a)).toBeCloseTo(p.getY(b) - p.getY(a), 6)
  }
  assembly.dispose()
})
it('applies the latest material request atomically, disposing stale results and failed partial results', async () => {
  const pending: { id: string; resolve: (m: MeshStandardMaterial) => void; reject: (reason: Error) => void }[] = []
  const config = createDefaultWardrobe()
  const assembly = createWardrobeAssembly(config, { createMaterial: id => new Promise((resolve, reject) => pending.push({ id, resolve, reject })) })
  const first = assembly.setFinishes(config)
  const second = assembly.setFinishes({ ...config, bodyFinish: 'board-white-matte' })
  const fresh = pending.splice(2), newBody = new MeshStandardMaterial(), newMetal = new MeshStandardMaterial()
  fresh[0].resolve(newBody); fresh[1].resolve(newMetal); await second
  const body = assembly.group.getObjectByName('section-1/Side_Left') as Mesh
  expect(body.material).toBe(newBody)
  const stale = pending.splice(0).map(req => { const m = new MeshStandardMaterial(), spy = vi.spyOn(m, 'dispose'); req.resolve(m); return spy })
  await first
  for (const spy of stale) expect(spy).toHaveBeenCalledTimes(1)
  expect(body.material).toBe(newBody)
  const failed = assembly.setFinishes({ ...config, bodyFinish: 'board-graphite-matte', hardwareFinish: 'metal-white-matte' })
  const rejected = expect(failed).rejects.toThrow('offline')
  const partial = new MeshStandardMaterial(), disposed = vi.spyOn(partial, 'dispose')
  pending[0].resolve(partial); pending[1].reject(new Error('offline')); await rejected
  expect(disposed).toHaveBeenCalledTimes(1); expect(body.material).toBe(newBody)
  assembly.dispose()
})
