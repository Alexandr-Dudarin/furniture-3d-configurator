import { expect, it, vi } from 'vitest'
import { Box3, Mesh, MeshStandardMaterial, Raycaster, Vector3 } from 'three'
import { DRAWER_FACADE_STYLES, type WardrobeDrawerFacade } from '../../configurator/wardrobeAssembly/drawerFacades'
import { DRAWER_HANDLES, type WardrobeDrawerHandle } from '../../configurator/wardrobeAssembly/drawerHandles'
import { normalizeWardrobeAssembly, wardrobeClosedBounds } from '../../configurator/wardrobeAssembly/state'
import { createWardrobeAssembly } from './wardrobeAssembly'
import { createDrawerFacadeGeometry, DRAWER_FACADE_PROFILE, drawerHandleClearWidth } from './drawerFacadeGeometry'
import { grooveLayout } from '../facades/facadeGeometry'
import { hasReliefShader, RELIEF_ATTRIBUTE } from '../facades/reliefFilter'

const config = (facadeStyle?: WardrobeDrawerFacade, handle: WardrobeDrawerHandle = 'bar', width = .6, depth = .55, height = .2, placement: 'flush' | 'recessed' = 'flush') => normalizeWardrobeAssembly({
  sections: [{ id: 'section-1', width, depth, height: 2.2, shelves: 0, rod: false,
    drawers: { count: 2, height, placement, handle, ...(facadeStyle ? { facadeStyle } : {}) } }],
})
const drawerId = 'section-1/Drawer_1'
const frontName = `${drawerId}/Front`

it.each(DRAWER_FACADE_STYLES)('%s keeps envelope, box contacts, handle mounts and grip openings at size limits', style => {
  for (const { value: handle } of DRAWER_HANDLES) for (const max of [false, true]) for (const placement of ['flush', 'recessed'] as const) {
    const c = config(style, handle, max ? 1 : .4, max ? .8 : .4, max ? .3 : .2, placement)
    const a = createWardrobeAssembly(c)
    const front = a.group.getObjectByName(frontName) as Mesh
    const bounds = new Box3().setFromObject(front, true)
    const side = new Box3().setFromObject(a.group.getObjectByName(`${drawerId}/Side_1`)!, true)
    expect(bounds.getSize(new Vector3()).z).toBeCloseTo(.016, 6)
    expect(side.max.z).toBeCloseTo(bounds.min.z, 6)
    expect(new Box3().setFromObject(a.group, true).getSize(new Vector3()).z).toBeCloseTo(wardrobeClosedBounds(c).depth, 6)
    expect(a.motion.findPart(front)).toBe(drawerId)
    expect((a.group.getObjectByName('section-1/Drawer_2/Front') as Mesh).geometry).toBe(front.geometry)
    const hit = (x: number, y: number) => new Raycaster(new Vector3(x, y, bounds.max.z + .01), new Vector3(0, 0, -1), 0, .04).intersectObject(front)
    if (handle === 'finger-notch') {
      for (const x of [-.04, 0, .04]) expect(hit(x, bounds.max.y - .010)).toHaveLength(0)
      expect(hit(0, bounds.max.y - .020)).toHaveLength(0)
      expect(hit(0, bounds.max.y - .031)).not.toHaveLength(0)
      expect(hit(.04, bounds.max.y - .025)).not.toHaveLength(0)
    }
    if (handle === 'top-grip') {
      expect(.086 + c.sections[0].drawers!.height - bounds.max.y).toBeCloseTo(.04, 6)
      expect(hit(0, bounds.max.y + .02)).toHaveLength(0)
    }
    const mountYs = .086 + c.sections[0].drawers!.height * .7
    const sampleMounts: [number, number][] = handle === 'bar' || handle === 'classic' ? [[-.064, mountYs], [.064, mountYs]]
      : handle === 'knob' ? [[0, mountYs]] : handle === 'flat-bar' ? [[-.068, mountYs], [.068, mountYs]]
        : handle === 'edge-pull' ? [[-.045, bounds.max.y - .041], [0, bounds.max.y - .041], [.045, bounds.max.y - .041]]
          : handle === 'semicircle' ? [[0, bounds.max.y - .0015]] : []
    for (const [x, y] of sampleMounts) {
      const face = hit(x, y)[0]
      expect(face, `${style}/${handle} mount`).toBeDefined()
      expect(face.distance, `${style}/${handle} floating mount`).toBeCloseTo(.01, 6)
    }
    a.dispose()
  }
})

it('preserves the accepted smooth and notched geometry byte for byte when the new field is omitted', () => {
  for (const { value: handle } of DRAWER_HANDLES) {
    const legacy = createWardrobeAssembly(config(undefined, handle)), explicit = createWardrobeAssembly(config('smooth', handle))
    const a = (legacy.group.getObjectByName(frontName) as Mesh).geometry, b = (explicit.group.getObjectByName(frontName) as Mesh).geometry
    expect(b.attributes.position.array).toEqual(a.attributes.position.array)
    expect(b.attributes.uv.array).toEqual(a.attributes.uv.array)
    legacy.dispose(); explicit.dispose()
  }
})

it.each(['frame', 'fluted'] as const)('notched %s is a closed, finite solid with outward face normals', style => {
  for (const width of [.364, .964]) for (const height of [.196, .296]) {
    const g = createDrawerFacadeGeometry(width, height, .016, style, 'finger-notch')
    const p = g.getAttribute('position'), n = g.getAttribute('normal'), uv = g.getAttribute('uv'), idx = g.index!
    const edges = new Map<string, number>(), a = new Vector3(), b = new Vector3(), c = new Vector3()
    const key = (v: Vector3) => v.toArray().map(x => Math.round(x * 1e7)).join(',')
    for (let i = 0; i < idx.count; i += 3) {
      a.fromBufferAttribute(p, idx.getX(i)); b.fromBufferAttribute(p, idx.getX(i + 1)); c.fromBufferAttribute(p, idx.getX(i + 2))
      const cross = b.clone().sub(a).cross(c.clone().sub(a))
      expect(cross.lengthSq()).toBeGreaterThan(1e-20)
      if ([a, b, c].every(v => v.z > .00799)) expect(cross.z).toBeGreaterThan(0)
      if ([a, b, c].every(v => v.z < -.00799)) expect(cross.z).toBeLessThan(0)
      for (const [x, y] of [[a, b], [b, c], [c, a]]) { const k = [key(x), key(y)].sort().join('|'); edges.set(k, (edges.get(k) ?? 0) + 1) }
    }
    expect([...edges.values()].every(count => count === 2)).toBe(true)
    for (let i = 0; i < p.count; i++) {
      expect(new Vector3().fromBufferAttribute(n, i).length()).toBeCloseTo(1, 5)
      expect(Number.isFinite(uv.getX(i)) && Number.isFinite(uv.getY(i))).toBe(true)
    }
    expect(idx.count / 3).toBeLessThan(22000)
    g.dispose()
  }
})

it('retains metric fluting phases and clear mounting lands across width changes', () => {
  let previous: number[] = []
  for (const width of [.364, .414, .464, .514, .964]) {
    const g = createDrawerFacadeGeometry(width, .196, .016, 'fluted', 'bar')
    const centers = grooveLayout(width, DRAWER_FACADE_PROFILE.fluted).centers.filter(x => Math.abs(x) - .002 >= drawerHandleClearWidth('bar') / 2)
    for (const c of previous) expect(centers.some(x => Math.abs(x - c) < 1e-9)).toBe(true)
    previous = centers
    const mesh = new Mesh(g, new MeshStandardMaterial())
    mesh.updateMatrixWorld()
    for (const x of centers) {
      const hit = new Raycaster(new Vector3(x, 0, .02), new Vector3(0, 0, -1)).intersectObject(mesh)[0]
      expect(hit.point.z).toBeCloseTo(.008 - .0018, 6)
    }
    g.dispose(); (mesh.material as MeshStandardMaterial).dispose()
  }
})

it('retains opening, shares current geometry, refreshes filtered finishes and frees shadow resources once', async () => {
  const c = config('fluted', 'finger-notch')
  const a = createWardrobeAssembly(c, { createMaterial: async () => new MeshStandardMaterial() })
  await a.setFinishes(c)
  const front = a.group.getObjectByName(frontName) as Mesh
  expect(front.geometry.hasAttribute(RELIEF_ATTRIBUTE)).toBe(true)
  expect(hasReliefShader(front.material as MeshStandardMaterial)).toBe(true)
  const shaderData = front.geometry.getAttribute(RELIEF_ATTRIBUTE), positions = front.geometry.getAttribute('position')
  for (let i = 0; i < positions.count; i++) {
    expect(positions.getZ(i) + shaderData.getX(i)).toBeLessThanOrEqual(.00800001)
    if (positions.getY(i) > .196 / 2 - .031) expect(Math.abs(shaderData.getX(i))).toBeLessThan(1e-7)
  }
  a.motion.toggle(drawerId); a.motion.update(.24)
  const pose = front.getWorldPosition(new Vector3())
  const geometry = front.geometry, retired = vi.spyOn(geometry, 'dispose')
  const depth = vi.spyOn(front.customDepthMaterial!, 'dispose'), distance = vi.spyOn(front.customDistanceMaterial!, 'dispose')
  c.bodyFinish = 'oak-natural'; await a.setFinishes(c)
  expect(front.geometry).toBe(geometry)
  expect(hasReliefShader(front.material as MeshStandardMaterial)).toBe(true)
  c.sections[0].drawers!.facadeStyle = 'frame'; a.update(c)
  expect(retired).toHaveBeenCalledOnce()
  expect(front.getWorldPosition(new Vector3())).toEqual(pose)
  expect(a.motion.getStates()[0].open).toBe(true)
  a.dispose(); a.dispose()
  expect(depth).toHaveBeenCalledOnce(); expect(distance).toHaveBeenCalledOnce()
})
