import { expect, it, vi } from 'vitest'
import { Box3, Mesh, MeshStandardMaterial, Texture, Vector3 } from 'three'
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
      const rail = parts.find(p => p.name.endsWith('/Rail'))
      if (heightCm < 150) expect(rail).toBeUndefined()
      if (config.sections[0].rod) {
        expect(rail).toBeDefined()
        expect(rail!.position[1]).toBeGreaterThanOrEqual(1.2)
        const below = panels.filter(p => p.position[1] < rail!.position[1]).at(-1)!
        expect(rail!.position[1] - rail!.size[0] - below.position[1] - below.size[1] / 2).toBeGreaterThanOrEqual(.6 - 1e-8)
        const above = panels.find(p => p.position[1] > rail!.position[1])!
        expect(above.position[1] - above.size[1] / 2 - rail!.position[1] - rail!.size[0]).toBeGreaterThan(.05)
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

it('shares equal finishes across sections, isolates overrides and retains geometry/metric UVs on material edits', async () => {
  const make = vi.fn(async (id: string) => { const m = new MeshStandardMaterial(); m.name = id; return m })
  let config = createDefaultWardrobe()
  const assembly = createWardrobeAssembly(config, { createMaterial: make })
  await assembly.setFinishes(config)
  expect(make).toHaveBeenCalledTimes(2)
  const body = (id: string) => assembly.group.getObjectByName(`${id}/Side_Left`) as Mesh
  const first = body('section-1'), last = body('section-3'), geometry = first.geometry, uv = geometry.getAttribute('uv')
  const gray = first.material as MeshStandardMaterial, grayDispose = vi.spyOn(gray, 'dispose')
  config = updateWardrobeAssembly(config, { type: 'set-section-finish', id: 'section-1', slot: 'bodyFinish', finishId: 'oak-natural' })
  assembly.update(config); await assembly.setFinishes(config)
  const oak = first.material as MeshStandardMaterial, oakDispose = vi.spyOn(oak, 'dispose')
  expect(oak.name).toBe('oak-natural'); expect(last.material).toBe(gray)
  for (const child of assembly.group.children) if (child.name.startsWith('section-1/')) expect((child as Mesh).material).toBe(oak)
  expect(first.geometry).toBe(geometry); expect(first.geometry.getAttribute('uv')).toBe(uv)
  config = updateWardrobeAssembly(config, { type: 'set-wardrobe-finish', slot: 'bodyFinish', finishId: 'oak-natural' })
  assembly.update(config); await assembly.setFinishes(config)
  expect(last.material).toBe(oak); expect(make).toHaveBeenCalledTimes(3)
  expect(grayDispose).toHaveBeenCalledTimes(1)
  config = updateWardrobeAssembly(config, { type: 'set-wardrobe-finish', slot: 'bodyFinish', finishId: 'board-white-matte' })
  assembly.update(config); await assembly.setFinishes(config)
  expect(first.material).toBe(oak); expect((last.material as MeshStandardMaterial).name).toBe('board-white-matte')
  expect(oakDispose).not.toHaveBeenCalled()
  config = updateWardrobeAssembly(config, { type: 'move-section', id: 'section-1', direction: 1 })
  assembly.update(config); await assembly.setFinishes(config)
  expect(first.material).toBe(oak); expect(first.geometry).toBe(geometry)
  config = updateWardrobeAssembly(config, { type: 'set-section-finish', id: 'section-1', slot: 'bodyFinish', finishId: null })
  assembly.update(config); await assembly.setFinishes(config)
  expect(first.material).toBe(last.material); expect(oakDispose).toHaveBeenCalledTimes(1)
  expect(make).toHaveBeenCalledTimes(4)
  assembly.dispose(); assembly.dispose()
  expect(oakDispose).toHaveBeenCalledTimes(1); expect(grayDispose).toHaveBeenCalledTimes(1)
})
it('uses individual hardware for rods and supports and releases materials only after the last user disappears', async () => {
  const make = vi.fn(async (id: string) => { const m = new MeshStandardMaterial(); m.name = id; return m })
  let config = createDefaultWardrobe()
  config = updateWardrobeAssembly(config, { type: 'update-section', id: 'section-1', patch: { rod: true, depth: .4 }, confirmFillingChange: true })
  config = updateWardrobeAssembly(config, { type: 'set-section-finish', id: 'section-1', slot: 'hardwareFinish', finishId: 'metal-brass-satin' })
  const assembly = createWardrobeAssembly(config, { createMaterial: make })
  await assembly.setFinishes(config)
  const rail = assembly.group.getObjectByName('section-1/Rail') as Mesh
  const brass = rail.material as MeshStandardMaterial, dispose = vi.spyOn(brass, 'dispose')
  for (const child of assembly.group.children) if (/section-1\/(Rail|Bracket_)/.test(child.name)) expect((child as Mesh).material).toBe(brass)
  expect(((assembly.group.getObjectByName('section-2/Rail') as Mesh).material as MeshStandardMaterial).name).toBe('metal-black-matte')
  config = updateWardrobeAssembly(config, { type: 'set-section-finish', id: 'section-2', slot: 'hardwareFinish', finishId: 'metal-brass-satin' })
  assembly.update(config); await assembly.setFinishes(config)
  expect(make.mock.calls.filter(([id]) => id === 'metal-brass-satin')).toHaveLength(1)
  config = updateWardrobeAssembly(config, { type: 'remove-section', id: 'section-1' })
  assembly.update(config); await assembly.setFinishes(config)
  expect(dispose).not.toHaveBeenCalled()
  config = updateWardrobeAssembly(config, { type: 'update-section', id: 'section-2', patch: { rod: false } })
  assembly.update(config); await assembly.setFinishes(config)
  expect(dispose).toHaveBeenCalledTimes(1)
  expect(config.sections[0].hardwareFinish).toBe('metal-brass-satin')
  config = updateWardrobeAssembly(config, { type: 'update-section', id: 'section-2', patch: { rod: true } })
  assembly.update(config); await assembly.setFinishes(config)
  expect(((assembly.group.getObjectByName('section-2/Rail') as Mesh).material as MeshStandardMaterial).name).toBe('metal-brass-satin')
  expect(make.mock.calls.filter(([id]) => id === 'metal-brass-satin')).toHaveLength(2)
  assembly.dispose()
  expect(dispose).toHaveBeenCalledTimes(1)
})
it('cancels an in-flight individual finish on return to inheritance and disposes late textures after unmount', async () => {
  const pending: { resolve: (m: MeshStandardMaterial) => void }[] = []
  const config = createDefaultWardrobe()
  const assembly = createWardrobeAssembly(config, { createMaterial: id => id.startsWith('oak-') ? new Promise(resolve => pending.push({ resolve })) : Promise.resolve(new MeshStandardMaterial()) })
  await assembly.setFinishes(config)
  const body = assembly.group.getObjectByName('section-1/Side_Left') as Mesh, original = body.material
  const custom = updateWardrobeAssembly(config, { type: 'set-section-finish', id: 'section-1', slot: 'bodyFinish', finishId: 'oak-natural' })
  assembly.update(custom)
  const loading = assembly.setFinishes(custom)
  assembly.update(config); await assembly.setFinishes(config)
  const late = new MeshStandardMaterial(), texture = new Texture()
  late.map = texture; late.normalMap = texture
  const materialDispose = vi.spyOn(late, 'dispose'), textureDispose = vi.spyOn(texture, 'dispose')
  pending.shift()!.resolve(late); await loading
  expect(body.material).toBe(original)
  expect(materialDispose).toHaveBeenCalledTimes(1); expect(textureDispose).toHaveBeenCalledTimes(1)
  assembly.update(custom)
  const afterUnmount = assembly.setFinishes(custom)
  assembly.dispose()
  const orphan = new MeshStandardMaterial(), orphanDispose = vi.spyOn(orphan, 'dispose')
  pending.shift()!.resolve(orphan); await afterUnmount
  expect(orphanDispose).toHaveBeenCalledTimes(1)
  expect(assembly.group.children).toHaveLength(0)
})

it('keeps actual manual panel and rod clearances over all heights, both rail types and allowed shelf counts', () => {
  for (let heightCm = 80; heightCm <= 280; heightCm += 10) for (const rod of [false, true]) for (const depth of [.4, .5, .8]) for (let shelves = 0; shelves <= 6; shelves++) {
    let config = normalizeWardrobeAssembly({ sections: [{ height: heightCm / 100, rod, depth, shelves }] })
    config = updateWardrobeAssembly(config, { type: 'set-layout-mode', id: config.sections[0].id, manual: true })
    const section = config.sections[0]
    if (!section.layout) continue
    const parts = planWardrobeParts(config), rail = parts.find(p => p.name.endsWith('/Rail'))
    const panels = parts.filter(p => /\/(Bottom|Top|Shelf_\d+)$/.test(p.name)).sort((a, b) => a.position[1] - b.position[1])
    for (let i = 1; i < panels.length; i++) expect(panels[i].position[1] - panels[i].size[1] / 2 - panels[i - 1].position[1] - panels[i - 1].size[1] / 2).toBeGreaterThanOrEqual(.2 - 1e-8)
    parts.filter(p => p.name.includes('/Shelf_')).forEach((part, i) => expect(part.position[1] - .008).toBeCloseTo(section.layout!.shelves[i], 8))
    if (rail) {
      expect(rail.position[1]).toBe(section.layout.rod)
      expect(rail.position[1]).toBeGreaterThanOrEqual(1.2)
      const below = panels.filter(p => p.position[1] < rail.position[1]).at(-1)!, above = panels.find(p => p.position[1] > rail.position[1])!
      expect(rail.position[1] - rail.size[0] - below.position[1] - below.size[1] / 2).toBeGreaterThanOrEqual(.6 - 1e-8)
      expect(above.position[1] - above.size[1] / 2 - rail.position[1]).toBeGreaterThanOrEqual(.08 - 1e-8)
      for (const part of parts.filter(p => p.name.includes('/Bracket_'))) {
        expect(part.position[1] - part.size[1] / 2).toBeCloseTo(rail.position[1], 8)
        expect(part.position[1] + part.size[1] / 2).toBeCloseTo(above.position[1] - above.size[1] / 2, 8)
      }
    }
  }
})
it('moves actual meshes at fixed carcass dimensions and reuses panel geometry, UVs and materials', async () => {
  let config = updateWardrobeAssembly(createDefaultWardrobe(), { type: 'set-layout-mode', id: 'section-2', manual: true })
  config = updateWardrobeAssembly(config, { type: 'update-section', id: 'section-2', patch: { depth: .4 } })
  const assembly = createWardrobeAssembly(config, { createMaterial: async () => new MeshStandardMaterial() })
  await assembly.setFinishes(config)
  const shelf = assembly.group.getObjectByName('section-2/Shelf_1') as Mesh, rail = assembly.group.getObjectByName('section-2/Rail') as Mesh
  const geometry = shelf.geometry, uv = geometry.getAttribute('uv'), material = shelf.material
  const side = assembly.group.getObjectByName('section-2/Side_Left') as Mesh, oldBox = new Box3().setFromObject(assembly.group, true)
  const sidePosition = side.position.clone(), shelfY = shelf.position.y
  config = updateWardrobeAssembly(config, { type: 'move-rod', id: 'section-2', height: 1.5 })
  assembly.update(config)
  expect(rail.position.y).toBe(1.5); expect(shelf.position.y).toBe(shelfY)
  config = updateWardrobeAssembly(config, { type: 'move-shelf', id: 'section-2', index: 0, height: 1.7 })
  assembly.update(config)
  expect(shelf.position.y).toBeCloseTo(1.708, 8)
  expect(side.position).toEqual(sidePosition)
  expect(shelf.geometry).toBe(geometry); expect(shelf.geometry.getAttribute('uv')).toBe(uv); expect(shelf.material).toBe(material)
  expect(new Box3().setFromObject(assembly.group, true).equals(oldBox)).toBe(true)
  const bracket = assembly.group.getObjectByName('section-2/Bracket_1') as Mesh
  const box = new Box3().setFromObject(bracket, true)
  expect(box.min.y).toBeCloseTo(1.5, 6); expect(box.max.y).toBeCloseTo(1.7, 6)
  assembly.dispose()
})
