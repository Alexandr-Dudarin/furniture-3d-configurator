import { expect, it } from 'vitest'
import { Vector3 } from 'three'
import { TOP_SHAPES } from '../../configurator/tableAssembly/catalog'
import { normalizeTableAssembly } from '../../configurator/tableAssembly/state'
import { CORNER_RADIUS, createTabletopGeometry, createTabletopOutline } from './tabletopGeometry'

it.each(TOP_SHAPES)('$id preserves bounds, outward faces, watertightness and metric UVs through resizing', ({ id }) => {
  for (const size of [1.2, 1.3, 1.6, 1.2]) {
    for (const thickness of [0.02, 0.035, 0.05]) {
      const config = normalizeTableAssembly({ shape: id, length: size, width: 0.85, thickness })
      const geometry = createTabletopGeometry(config)
      const bounds = geometry.boundingBox!
      expect(bounds.max.x - bounds.min.x).toBeCloseTo(config.length, 6)
      expect(bounds.max.z - bounds.min.z).toBeCloseTo(config.width, 6)
      expect(bounds.min.y).toBe(0)
      expect(bounds.max.y).toBeCloseTo(thickness, 6)
      expect(geometry.groups.map((group) => group.materialIndex)).toEqual([0, 1, 2])
      const position = geometry.getAttribute('position')
      const normal = geometry.getAttribute('normal')
      const uv = geometry.getAttribute('uv')
      const edges = new Map<string, number>()
      const key = (vertex: Vector3) => vertex.toArray().map((value) => Math.round(value * 1e6)).join(',')
      for (let i = 0; i < position.count; i += 3) {
        const a = new Vector3().fromBufferAttribute(position, i)
        const b = new Vector3().fromBufferAttribute(position, i + 1)
        const c = new Vector3().fromBufferAttribute(position, i + 2)
        const face = b.clone().sub(a).cross(c.clone().sub(a))
        expect(face.lengthSq()).toBeGreaterThan(1e-18)
        expect(face.dot(new Vector3().fromBufferAttribute(normal, i))).toBeGreaterThan(0)
        for (const [u, v] of [[a, b], [b, c], [c, a]]) {
          const edge = [key(u), key(v)].sort().join('|')
          edges.set(edge, (edges.get(edge) ?? 0) + 1)
        }
      }
      expect([...edges.values()].every((count) => count === 2)).toBe(true)
      const faceEnd = geometry.groups[1].start + geometry.groups[1].count
      for (let i = 0; i < faceEnd; i++) {
        expect(uv.getX(i)).toBeCloseTo(position.getX(i) + 0.5, 6)
        expect(uv.getY(i)).toBeCloseTo(position.getZ(i) + 0.5, 6)
      }
      // На вертикальном торце и горизонтальный шаг, и высота имеют UV-плотность 1/м.
      const firstSide = geometry.groups[2].start + 6
      const bottom = new Vector3().fromBufferAttribute(position, firstSide)
      const nextBottom = new Vector3().fromBufferAttribute(position, firstSide + 2)
      expect(uv.getX(firstSide + 2) - uv.getX(firstSide)).toBeCloseTo(bottom.distanceTo(nextBottom), 6)
      expect(uv.getY(firstSide + 1) - uv.getY(firstSide)).toBeCloseTo(config.thickness - 0.002, 6)
      geometry.dispose()
    }
  }
})

it('keeps the corner radius and cut sizes fixed instead of scaling their profiles', () => {
  for (const length of [1.2, 1.6]) {
    const points = createTabletopOutline({ shape: 'rounded-rectangle', length, width: 0.8 })
    const upperRight = points.filter((p) => p.x > 0 && Math.abs(p.y - 0.4) < 1e-8)
    expect(Math.max(...upperRight.map((p) => p.x))).toBeCloseTo(length / 2 - CORNER_RADIUS)
    expect(createTabletopOutline({ shape: 'chamfered', length, width: 0.8 })[0].y).toBeCloseTo(-0.32)
    expect(createTabletopOutline({ shape: 'wide-chamfered', length, width: 0.8 })[0].y).toBeCloseTo(-0.2)
  }
})
