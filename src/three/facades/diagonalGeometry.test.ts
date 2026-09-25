import { describe, expect, it } from 'vitest'
import { Mesh, MeshBasicMaterial, Raycaster, Vector3 } from 'three'
import { getFurnitureDefinition, getFurnitureDefinitions } from '../../configurator/furnitureRegistry'
import { createFacadeGeometry } from './facadeGeometry'
import { createDiagonalGeometry, diagonalLayout } from './diagonalGeometry'

const spec = getFurnitureDefinition('dresser-12-brooklyn-six-drawer').facades!
const profile = spec.diagonal!

describe('diagonal machined facades', () => {
  it('preserves angle/phase/pitch at millimetre resizes, safe borders and the handle strip', () => {
    for (const clear of [0, .012]) for (let mm = 294; mm <= 1000; mm++) {
      const width = mm / 1000, height = .1646666667, grooves = diagonalLayout(width, height, profile, clear)
      expect(grooves.length).toBeGreaterThan(0)
      for (const g of grooves) {
        expect(g.offset / profile.pitch).toBeCloseTo(Math.round(g.offset / profile.pitch), 9)
        expect(g.end - g.start + profile.width).toBeGreaterThanOrEqual(profile.minLength)
        const a = new Vector3((g.start + g.offset) * Math.SQRT1_2, (g.start - g.offset) * Math.SQRT1_2)
        const b = new Vector3((g.end + g.offset) * Math.SQRT1_2, (g.end - g.offset) * Math.SQRT1_2)
        expect(b.x - a.x).toBeCloseTo(b.y - a.y, 9)
        for (const p of [a, b]) {
          expect(Math.abs(p.x) + profile.width / 2).toBeLessThanOrEqual(width / 2 - profile.margin + 1e-10)
          expect(Math.abs(p.y) + profile.width / 2).toBeLessThanOrEqual(height / 2 - profile.endMargin + 1e-10)
          if (clear) expect(Math.abs(p.x) - profile.width / 2).toBeGreaterThanOrEqual(clear / 2 - 1e-10)
        }
        if (clear) expect(Math.sign(a.x)).toBe(Math.sign(b.x))
      }
    }
  })

  it('has physical depth, a flat field and fixed metric grain coordinates through resizing', () => {
    const material = new MeshBasicMaterial()
    try {
      for (const [width, height] of [[.595, .165], [.995, .28], [.5, 2.6]]) {
        const geometry = createFacadeGeometry(width, height, .016, 'diagonal', spec)
        const mesh = new Mesh(geometry, material)
        try {
          for (const [x, y, z] of [[0, 0, .008 - profile.depth], [.02, .02, .008 - profile.depth], [.03, -.03, .008]]) {
            const [hit] = new Raycaster(new Vector3(x, y, .1), new Vector3(0, 0, -1)).intersectObject(mesh)
            expect(hit).toBeDefined(); expect(hit.point.z).toBeCloseTo(z, 7)
            expect(hit.uv!.x).toBeCloseTo(.5 + x, 6); expect(hit.uv!.y).toBeCloseTo(.5 + y, 6)
          }
        } finally { geometry.dispose() }
      }
    } finally { material.dispose() }
  })

  it('rejects overlapping or impossible profiles instead of producing a broken surface', () => {
    for (const invalid of [{ pitch: .005 }, { depth: .02 }, { width: 0 }, { margin: 0 }, { minLength: .005 }, { pitch: NaN }]) {
      expect(() => createDiagonalGeometry(.5, .2, .016, .0007, { ...profile, ...invalid })).toThrow()
    }
    expect(() => createDiagonalGeometry(.025, .025, .016, .0007, profile)).toThrow()
  })

  it.each(['diagonal', 'herringbone', 'diamonds'] as const)('%s is watertight, consistently wound and bounded on all models at extrema and asymmetric dimensions', style => {
    const failures: string[] = []
    for (const definition of getFurnitureDefinitions().filter(d => d.facades)) {
      const facade = definition.facades!
      for (const fraction of [0, .37, 1]) for (const target of facade.targets) {
        const measure = (axis: 'width' | 'height') => {
          const b = target[axis], range = definition.dimensions[b.dimension]
          const value = range.min + (range.max - range.min) * (axis === 'width' ? fraction : 1 - fraction)
          return b.base + (value - range.base) * b.factor
        }
        const geometry = createFacadeGeometry(measure('width'), measure('height'), target.thickness, style, facade, target)
        try {
          const p = geometry.getAttribute('position'), index = geometry.index!, edges = new Map<string, number[]>()
          const a = new Vector3(), b = new Vector3(), c = new Vector3(), ab = new Vector3(), ac = new Vector3()
          const key = (v: Vector3) => v.toArray().map(n => Math.round(n * 1e7)).join(',')
          let badArea = 0, volume = 0
          for (let i = 0; i < index.count; i += 3) {
            a.fromBufferAttribute(p, index.getX(i)); b.fromBufferAttribute(p, index.getX(i + 1)); c.fromBufferAttribute(p, index.getX(i + 2))
            if (ab.subVectors(b, a).cross(ac.subVectors(c, a)).lengthSq() < 1e-20) badArea++
            volume += a.dot(ab.crossVectors(b, c)) / 6
            for (const [v, w] of [[a, b], [b, c], [c, a]]) {
              const k1 = key(v), k2 = key(w), edge = [k1, k2].sort().join('|'), signs = edges.get(edge) ?? []
              signs.push(k1 < k2 ? 1 : -1); edges.set(edge, signs)
            }
          }
          const badEdges = [...edges.values()].filter(signs => signs.length !== 2 || signs[0] + signs[1] !== 0).length
          if (badArea || badEdges || volume <= 0) failures.push(`${definition.id}/${target.panel}/${fraction}: area=${badArea}, edges=${badEdges}, volume=${volume}`)
          expect(index.count / 3).toBeLessThan(style === 'diamonds' ? 12000 : style === 'herringbone' ? 10000 : 6000)
        } finally { geometry.dispose() }
      }
    }
    expect(failures).toEqual([])
  })
})
