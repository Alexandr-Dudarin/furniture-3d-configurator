import { describe, expect, it } from 'vitest'
import { Mesh, MeshBasicMaterial, Raycaster, Vector3 } from 'three'
import { getFurnitureDefinition } from '../../configurator/furnitureRegistry'
import { composedHerringboneLayout, createComposedHerringboneGeometry } from './composedHerringboneGeometry'

const profile = getFurnitureDefinition('wardrobe-07-center-drawers').facades!.herringbone!
const S = Math.SQRT1_2

describe('shared herringbone composition', () => {
  it('keeps one global phase across unequal panels and real gaps at millimetre resizes', () => {
    for (let mm = 1400; mm <= 2000; mm++) {
      const width = mm / 1000, height = 1.9 + (mm - 1400) / 1000
      const panels = [
        { width: width / 4 - .003, height: height - .004, x: -width * .375, y: 0 },
        { width: width / 4 - .003, height: height - .704, x: -width * .125, y: .35 },
        { width: width / 2 - .004, height: .217, x: 0, y: -height / 2 + .36 },
      ].flatMap(p => p.x ? [p, { ...p, x: -p.x }] : [p])
      for (const panel of panels) for (const clear of [0, .012]) {
        const layout = composedHerringboneLayout(panel.width, panel.height, profile, { width, height, x: panel.x, y: panel.y }, clear)
        expect(layout.length).toBeGreaterThan(0)
        for (const g of layout) {
          const sign = g.mirror ? -1 : 1
          expect(g.end - g.start + profile.width).toBeGreaterThanOrEqual(profile.minLength)
          for (const t of [g.start, g.end]) {
            const x = sign * (t + g.offset) * S, y = (t - g.offset) * S, radius = profile.width / 2
            const globalX = x + panel.x, globalY = y + panel.y
            const phase = (sign * globalX - globalY) * S / profile.pitch
            expect(phase).toBeCloseTo(Math.round(phase), 9)
            expect(sign * globalX + radius).toBeLessThanOrEqual(-profile.centerGap / 2 + 1e-10)
            expect(Math.abs(x) + radius).toBeLessThanOrEqual(panel.width / 2 - profile.margin + 1e-10)
            expect(Math.abs(y) + radius).toBeLessThanOrEqual(panel.height / 2 - profile.endMargin + 1e-10)
            if (clear) expect(Math.abs(x) - radius).toBeGreaterThanOrEqual(clear / 2 - 1e-10)
          }
        }
      }
    }
  })

  it('produces closed physical panels with metric coating coordinates on both halves and across the centre', () => {
    const material = new MeshBasicMaterial()
    try {
      for (const [width, height, x, y] of [[.497, 2.686, -.9, 0], [.497, 2.686, .9, 0], [.7975, .217333, 0, -.7], [.4, 1.25, -.2, .35]]) {
        const composition = { width: 2.4, height: 2.7, x, y }
        const geometry = createComposedHerringboneGeometry(width, height, .016, .0007, profile, composition)
        try {
          const mesh = new Mesh(geometry, material)
          const trace = (px: number, py: number, depth: number) => {
            const [hit] = new Raycaster(new Vector3(px, py, .1), new Vector3(0, 0, -1)).intersectObject(mesh)
            expect(hit).toBeDefined(); expect(hit.point.z).toBeCloseTo(.008 - depth, 7)
            expect(hit.uv!.x).toBeCloseTo(.5 + px, 6); expect(hit.uv!.y).toBeCloseTo(.5 + py, 6)
          }
          for (const g of composedHerringboneLayout(width, height, profile, composition)) {
            const t = (g.start + g.end) / 2
            trace((g.mirror ? -1 : 1) * (t + g.offset) * S, (t - g.offset) * S, profile.depth)
          }
          trace(width / 2 - .003, 0, 0)
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
          expect(badArea).toBe(0)
          expect([...edges.values()].filter(s => s.length !== 2 || s[0] + s[1] !== 0)).toEqual([])
          expect(volume).toBeGreaterThan(width * height * (.016 - profile.depth))
          expect(volume).toBeLessThan(width * height * .016)
        } finally { geometry.dispose() }
      }
    } finally { material.dispose() }
  })

  it('rejects missing or invalid envelopes and impossible panels', () => {
    const valid = { width: 1.6, height: 2, x: .4, y: 0 }
    for (const bad of [{ width: 0 }, { height: NaN }, { x: Infinity }]) {
      expect(() => createComposedHerringboneGeometry(.4, 2, .016, .0007, profile, { ...valid, ...bad })).toThrow()
    }
    expect(() => createComposedHerringboneGeometry(.025, .025, .016, .0007, profile, valid)).toThrow()
  })
})
