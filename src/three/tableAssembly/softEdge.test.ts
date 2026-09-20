import { expect, it } from 'vitest'
import { Vector2 } from 'three'
import { TOP_SHAPES } from '../../configurator/tableAssembly/catalog'
import { normalizeTableAssembly } from '../../configurator/tableAssembly/state'
import { createTabletopEdgeProfile } from './tabletopEdgeProfile'
import { createTabletopGeometry } from './tabletopGeometry'

it.each([0.02, 0.035, 0.05])('soft edge at %s m has a slim elliptical profile and correct normals/arc length', (thickness) => {
  const profile = createTabletopEdgeProfile('bullnose', thickness)
  const a = Math.min(thickness / 4, 0.01), b = thickness / 2
  expect(profile[0].inset).toBeLessThanOrEqual(0.01)
  expect(profile.at(-1)!.inset).toBeCloseTo(a, 8)
  expect(profile[0].y).toBe(0)
  expect(profile.at(-1)!.y).toBe(thickness)
  let fineArc = 0
  // Независимый эталон: длина плотной полилинии полуэллипса.
  for (let i = 0; i < 20000; i++) {
    const start = i * Math.PI / 20000, end = (i + 1) * Math.PI / 20000
    fineArc += Math.hypot(a * (Math.sin(end) - Math.sin(start)), b * (Math.cos(end) - Math.cos(start)))
  }
  expect(profile.at(-1)!.distance).toBeCloseTo(fineArc, 7)
  profile.forEach((ring, i) => {
    const x = a - ring.inset, y = ring.y - b
    expect(x * x / (a * a) + y * y / (b * b)).toBeCloseTo(1, 8)
    const normal = new Vector2(x / (a * a), y / (b * b)).normalize()
    expect(ring.normal!.distanceTo(normal)).toBeLessThan(1e-10)
    if (i) { expect(ring.y).toBeGreaterThan(profile[i - 1].y); expect(ring.distance).toBeGreaterThan(profile[i - 1].distance) }
  })
})

it.each(TOP_SHAPES)('$id soft edge continues the top UVs/normals without a perimeter seam or collapsed mapping', ({ id }) => {
  for (const thickness of [0.02, 0.05]) {
    const config = normalizeTableAssembly({ shape: id, edgeProfile: 'bullnose', thickness, length: 1.2, width: 0.8 })
    const geometry = createTabletopGeometry(config)
    const p = geometry.getAttribute('position'), uv = geometry.getAttribute('uv'), n = geometry.getAttribute('normal')
    const key = (i: number) => [p.getX(i), p.getY(i), p.getZ(i)].map((x) => Math.round(x * 1e7)).join(',')
    const topUV = new Map<string, Vector2>()
    for (let i = 0; i < geometry.groups[0].count; i++) topUV.set(key(i), new Vector2(uv.getX(i), uv.getY(i)))
    const edgeUV = new Map<string, Vector2>()
    let contacts = 0
    for (let i = geometry.groups[2].start; i < p.count; i++) {
      const value = new Vector2(uv.getX(i), uv.getY(i))
      const previous = edgeUV.get(key(i))
      if (previous) expect(previous.distanceTo(value)).toBeLessThan(1e-6)
      edgeUV.set(key(i), value)
      if (Math.abs(p.getY(i) - thickness) < 1e-7) {
        contacts++
        expect(topUV.has(key(i))).toBe(true)
        expect(topUV.get(key(i))!.distanceTo(value)).toBeLessThan(1e-6)
        expect(n.getX(i)).toBeCloseTo(0, 6); expect(n.getY(i)).toBeCloseTo(1, 6); expect(n.getZ(i)).toBeCloseTo(0, 6)
      }
    }
    expect(contacts).toBeGreaterThan(0)
    for (let i = geometry.groups[2].start; i < p.count; i += 3) {
      const u1 = uv.getX(i+1)-uv.getX(i), v1 = uv.getY(i+1)-uv.getY(i)
      const u2 = uv.getX(i+2)-uv.getX(i), v2 = uv.getY(i+2)-uv.getY(i)
      expect(Math.abs(u1*v2-v1*u2)).toBeGreaterThan(1e-10)
    }
    geometry.dispose()
  }
})
