import { describe, expect, it } from 'vitest'
import { Mesh, MeshBasicMaterial, Raycaster, Vector3 } from 'three'
import { getFurnitureDefinition } from '../../configurator/furnitureRegistry'
import { createHerringboneGeometry, herringboneLayout } from './herringboneGeometry'

const profile = getFurnitureDefinition('dresser-12-brooklyn-six-drawer').facades!.herringbone!
const S = Math.SQRT1_2

describe('herringbone machined facades', () => {
  it('keeps complete symmetric pairs, physical pitch and safe fields at every millimetre', () => {
    for (const clear of [0, .012, .03]) for (let mm = 294; mm <= 1000; mm++) {
      const width = mm / 1000, height = .1646666667
      const grooves = herringboneLayout(width, height, profile, clear)
      expect(grooves.length).toBeGreaterThan(0)
      expect(grooves.length % 2).toBe(0)
      for (let i = 0; i < grooves.length; i += 2) {
        const left = grooves[i], right = grooves[i + 1]
        expect(right).toEqual({ ...left, mirror: true })
        expect(left.mirror).toBe(false)
        expect(left.offset / profile.pitch).toBeCloseTo(Math.round(left.offset / profile.pitch), 9)
        expect(left.end - left.start + profile.width).toBeGreaterThanOrEqual(profile.minLength)
        for (const t of [left.start, left.end]) {
          const x = (t + left.offset) * S, y = (t - left.offset) * S, r = profile.width / 2
          expect(x + r).toBeLessThanOrEqual(-Math.max(clear, profile.centerGap) / 2 + 1e-10)
          expect(-x + r).toBeLessThanOrEqual(width / 2 - profile.margin + 1e-10)
          expect(Math.abs(y) + r).toBeLessThanOrEqual(height / 2 - profile.endMargin + 1e-10)
        }
      }
    }
  })

  it('cuts both directions to the same physical depth, keeps the centre solid and the coating upright', () => {
    const material = new MeshBasicMaterial()
    try {
      for (const [width, height] of [[.595, .165], [.995, .28], [.3, 2.4], [.6, 2.6]]) {
        const geometry = createHerringboneGeometry(width, height, .016, .0004, profile)
        const mesh = new Mesh(geometry, material)
        try {
          const trace = (x: number, y: number, depth: number) => {
            const [hit] = new Raycaster(new Vector3(x, y, .1), new Vector3(0, 0, -1)).intersectObject(mesh)
            expect(hit).toBeDefined(); expect(hit.point.z).toBeCloseTo(.008 - depth, 7)
            expect(hit.uv!.x).toBeCloseTo(.5 + x, 6); expect(hit.uv!.y).toBeCloseTo(.5 + y, 6)
          }
          for (const g of herringboneLayout(width, height, profile).filter(g => !g.mirror)) {
            const t = (g.start + g.end) / 2, x = (t + g.offset) * S, y = (t - g.offset) * S
            trace(x, y, profile.depth); trace(-x, y, profile.depth)
          }
          for (const y of [-height / 3, 0, height / 3]) {
            trace(0, y, 0); trace(.005, y, 0); trace(-.005, y, 0)
          }
        } finally { geometry.dispose() }
      }
    } finally { material.dispose() }
  })

  it('rejects invalid profiles and impossible centre strips', () => {
    for (const invalid of [{ centerGap: 0 }, { centerGap: NaN }, { centerGap: -.012 }, { centerGap: .6 }, { pitch: 0 }, { width: .1 }, { depth: .02 }]) {
      expect(() => createHerringboneGeometry(.5, .2, .016, .0007, { ...profile, ...invalid })).toThrow()
    }
    expect(() => createHerringboneGeometry(.5, .2, .016, .0007, profile, -.02)).toThrow()
    expect(() => createHerringboneGeometry(.025, .025, .016, .0007, profile)).toThrow()
  })
})
