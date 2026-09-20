import { expect, it } from 'vitest'
import { Vector3 } from 'three'
import { TABLETOP_EDGE_PROFILES, TOP_SHAPES } from '../../configurator/tableAssembly/catalog'
import { normalizeTableAssembly } from '../../configurator/tableAssembly/state'
import { createTabletopGeometry } from './tabletopGeometry'

const cases = TABLETOP_EDGE_PROFILES.filter((profile) => profile.id !== 'bevel-1')
  .flatMap((profile) => TOP_SHAPES.map((shape) => ({ profile, shape: shape.id })))

it.each(cases)('$shape / $profile.id is closed, has outward normals and preserves exact bounds', ({ profile, shape }) => {
  for (const [length, width] of [[0.95, 0.55], [2, 1.2]]) for (const thickness of [0.02, 0.05]) {
    const curved = ['circle', 'ellipse', 'capsule'].includes(shape)
    const config = normalizeTableAssembly({ shape, baseId: curved ? 'v-pedestal' : 'u-frame', length, width, thickness, edgeProfile: profile.id })
    const geometry = createTabletopGeometry(config)
    const box = geometry.boundingBox!
    expect(box.min.y).toBe(0)
    expect(box.max.y).toBeCloseTo(thickness, 6)
    expect(box.max.x - box.min.x).toBeCloseTo(config.length, 6)
    expect(box.max.z - box.min.z).toBeCloseTo(config.width, 6)
    expect(geometry.groups.map((group) => group.materialIndex)).toEqual([0, 1, 2])
    const p = geometry.getAttribute('position'), n = geometry.getAttribute('normal'), uv = geometry.getAttribute('uv')
    const edges = new Map<string, number>()
    const key = (point: Vector3) => point.toArray().map((value) => Math.round(value * 1e6)).join(',')
    const a = new Vector3(), b = new Vector3(), c = new Vector3(), ab = new Vector3(), ac = new Vector3(), normal = new Vector3()
    for (let i = 0; i < p.count; i += 3) {
      a.fromBufferAttribute(p, i); b.fromBufferAttribute(p, i + 1); c.fromBufferAttribute(p, i + 2)
      const face = ab.subVectors(b, a).cross(ac.subVectors(c, a))
      expect(face.lengthSq()).toBeGreaterThan(1e-18)
      for (let j = 0; j < 3; j++) {
        normal.fromBufferAttribute(n, i + j)
        expect(normal.length()).toBeCloseTo(1, 5)
        expect(face.dot(normal)).toBeGreaterThan(0)
        expect(Number.isFinite(uv.getX(i + j)) && Number.isFinite(uv.getY(i + j))).toBe(true)
      }
      for (const [u, v] of [[a, b], [b, c], [c, a]]) {
        const edge = [key(u), key(v)].sort().join('|')
        edges.set(edge, (edges.get(edge) ?? 0) + 1)
      }
    }
    expect([...edges.values()].every((count) => count === 2)).toBe(true)
    const edgeStart = geometry.groups[2].start
    for (let i = 0; i < edgeStart; i++) {
      expect(uv.getX(i)).toBeCloseTo(p.getX(i) + 0.5, 6)
      expect(uv.getY(i)).toBeCloseTo(p.getZ(i) + 0.5, 6)
    }
    geometry.dispose()
  }
})

it.each(TABLETOP_EDGE_PROFILES.filter((profile) => profile.kind !== 'bullnose'))('$id keeps its physical size and profile UV length when thickness changes', (profile) => {
  for (const thickness of [0.02, 0.035, 0.05]) {
    const config = normalizeTableAssembly({ shape: 'rectangle', baseId: 'four-legs', length: 1.2, width: 0.8, thickness, edgeProfile: profile.id })
    const geometry = createTabletopGeometry(config)
    const p = geometry.getAttribute('position'), uv = geometry.getAttribute('uv'), n = geometry.getAttribute('normal')
    const radius = profile.size
    let capMaxX = -Infinity
    for (let i = 0; i < geometry.groups[0].count; i++) capMaxX = Math.max(capMaxX, p.getX(i))
    expect(capMaxX).toBeCloseTo(config.length / 2 - radius, 6)
    const edgeStart = geometry.groups[2].start
    let minV = Infinity, maxV = -Infinity
    for (let i = edgeStart; i < p.count; i++) { minV = Math.min(minV, uv.getY(i)); maxV = Math.max(maxV, uv.getY(i)) }
    const expectedLength = profile.kind === 'bevel' ? thickness + 2 * radius * (Math.SQRT2 - 1) : thickness + radius * (Math.PI - 2)
    expect(maxV - minV).toBeCloseTo(expectedLength, 6)
    if (profile.kind !== 'bevel') {
      // Круговое сечение и аналитические нормали на плоской стороне прямоугольника.
      const firstSideEnd = edgeStart + geometry.groups[2].count / 4
      for (let i = edgeStart; i < firstSideEnd; i++) {
        const y = p.getY(i)
        if (y > radius + 1e-7 && y < thickness - radius - 1e-7) continue
        const centerY = y <= thickness / 2 ? radius : thickness - radius
        const x = p.getX(i) - (config.length / 2 - radius)
        expect(Math.hypot(x, y - centerY)).toBeCloseTo(radius, 6)
        expect(n.getX(i)).toBeCloseTo(x / radius, 4)
        expect(n.getY(i)).toBeCloseTo((y - centerY) / radius, 4)
      }
    }
    geometry.dispose()
  }
})
