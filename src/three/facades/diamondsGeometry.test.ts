import { describe, expect, it } from 'vitest'
import { Mesh, MeshBasicMaterial, Raycaster, Vector3 } from 'three'
import { getFurnitureDefinition } from '../../configurator/furnitureRegistry'
import { createDiamondsGeometry } from './diamondsGeometry'

const spec = getFurnitureDefinition('dresser-12-brooklyn-six-drawer').facades!
const profile = spec.diamonds!
const S = Math.SQRT1_2

describe('intersecting diamond cuts', () => {
  it('has one surface at the union of both cuts, without double depth, and metric upright UVs', () => {
    const material = new MeshBasicMaterial()
    try {
      for (const width of [.294, .295, .4, .401, .595, .795, .995]) {
        const geometry = createDiamondsGeometry(width, .208, .016, spec.bevel, profile)
        const mesh = new Mesh(geometry, material)
        try {
          // Cross, either branch, V slopes, and flat lands. These points stay
          // fixed in physical space across resize rather than following a UV scale.
          for (const [u, v] of [[0, 0], [.04, 0], [0, .04], [.04, .04], [.0015, .04], [.0015, .0015], [.08, 0], [-.08, 0]]) {
            const x = (u - v) * S, y = (u + v) * S
            const distance = (n: number) => Math.abs(n - Math.round(n / profile.pitch) * profile.pitch)
            const expectedDepth = profile.depth * Math.max(0, 1 - Math.min(distance(u), distance(v)) / (profile.width / 2))
            const hits = new Raycaster(new Vector3(x, y, .1), new Vector3(0, 0, -1)).intersectObject(mesh)
            expect(hits.length).toBeGreaterThan(0)
            // Hits on shared triangle edges can repeat, but never at a second depth.
            for (const hit of hits) {
              expect(hit.point.z).toBeCloseTo(.008 - expectedDepth, 7)
              expect(hit.uv!.x).toBeCloseTo(.5 + x, 6)
              expect(hit.uv!.y).toBeCloseTo(.5 + y, 6)
            }
          }
        } finally { geometry.dispose() }
      }
    } finally { material.dispose() }
  })

  it('ends in the flat margins and leaves the handle strip solid, with no hidden underlay', () => {
    const material = new MeshBasicMaterial()
    const geometry = createDiamondsGeometry(.4, .208, .016, spec.bevel, profile, .012)
    const mesh = new Mesh(geometry, material)
    try {
      const p = geometry.getAttribute('position')
      let recessed = 0
      for (let i = 0; i < p.count; i++) {
        const x = Math.abs(p.getX(i)), y = Math.abs(p.getY(i)), z = p.getZ(i)
        if (z <= .008 - profile.depth - 1e-7 || z >= .008 - 1e-7) continue
        // Exclude the outer bevel, which has the same depth range.
        if (x > .2 - spec.bevel - 1e-7 || y > .104 - spec.bevel - 1e-7) continue
        recessed++
        expect(x).toBeGreaterThanOrEqual(.006 - 1e-7)
        expect(x).toBeLessThanOrEqual(.2 - profile.margin + 1e-7)
        expect(y).toBeLessThanOrEqual(.104 - profile.endMargin + 1e-7)
      }
      expect(recessed).toBeGreaterThan(0)
      for (const y of [-.075, 0, .075]) for (const x of [-.19, -.005, 0, .005, .19]) {
        const [hit] = new Raycaster(new Vector3(x, y, .1), new Vector3(0, 0, -1)).intersectObject(mesh)
        expect(hit).toBeDefined(); expect(hit.point.z).toBeCloseTo(.008, 7)
      }
    } finally { geometry.dispose(); material.dispose() }
  })

  it('rejects invalid profiles, nonfinite dimensions and panels too small for the edge ramps', () => {
    for (const invalid of [{ pitch: 0 }, { pitch: .005 }, { width: 0 }, { depth: .02 }, { fade: 0 }, { margin: 0 }, { depth: NaN }]) {
      expect(() => createDiamondsGeometry(.5, .2, .016, .0004, { ...profile, ...invalid })).toThrow()
    }
    for (const [w, h, clear] of [[.5, .2, .5], [.5, .2, -.012], [.02, .02, 0], [NaN, .2, 0]]) {
      expect(() => createDiamondsGeometry(w, h, .016, .0004, profile, clear)).toThrow()
    }
  })
})
