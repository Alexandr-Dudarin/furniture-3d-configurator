import { describe, expect, it } from 'vitest'
import { Vector3 } from 'three'
import { createFacadeGeometry, grooveLayout, sideGrooveLayout } from './facadeGeometry'
import { getFurnitureDefinition } from '../../configurator/furnitureRegistry'

const spec = getFurnitureDefinition('dresser-12-brooklyn-six-drawer').facades!

describe('physical facade profiles', () => {
  it('keeps side grooves mirrored, edge-anchored and outside the smooth centre at every millimetre', () => {
    for (const margin of [.018, .032, .045]) {
      const profile = { ...spec.fluted, margin }
      let previousOffsets: number[] = []
      for (let mm = 294; mm <= 1000; mm++) {
        const width = mm / 1000, { centers, count } = sideGrooveLayout(width, profile)
        expect(count).toBeGreaterThan(0)
        expect(count % 2).toBe(0)
        const right = centers.filter(c => c > 0)
        const offsets = right.map(c => width / 2 - c)
        for (const offset of previousOffsets) expect(offsets.some(n => Math.abs(n - offset) < 1e-9)).toBe(true)
        for (const c of right) {
          expect(centers.some(n => Math.abs(n + c) < 1e-9)).toBe(true)
          expect(c - profile.width / 2).toBeGreaterThanOrEqual(width / 4 - 1e-9)
          expect(width / 2 - c - profile.width / 2).toBeGreaterThanOrEqual(margin - 1e-9)
        }
        for (let i = 1; i < right.length; i++) expect(right[i] - right[i - 1]).toBeCloseTo(profile.pitch, 9)
        previousOffsets = offsets
      }
    }
    const cleared = sideGrooveLayout(.4, spec.fluted, .3)
    expect(cleared.count).toBeGreaterThan(0)
    expect(cleared.centers.every(c => Math.abs(c) - spec.fluted.width / 2 >= .15 - 1e-9)).toBe(true)
  })

  it('leaves a flat central mounting plane and cuts side grooves to the physical depth', () => {
    const geometry = createFacadeGeometry(.795, .208, .016, 'fluted-sides', spec)
    try {
      const p = geometry.getAttribute('position'), n = geometry.getAttribute('normal')
      const samplesAt = (x: number) => {
        // Sample a full-depth row away from both ends and the bevel.
        const y = -.208 / 2 + spec.fluted.endMargin + spec.fluted.fade
        return Array.from({ length: p.count }, (_, i) => i).filter(i => Math.abs(p.getY(i) - y) < 1e-7 && Math.abs(p.getX(i) - x) < 1e-7 && p.getZ(i) > 0)
      }
      const centers = sideGrooveLayout(.795, spec.fluted).centers
      for (const center of centers) for (const i of samplesAt(center)) expect(p.getZ(i)).toBeCloseTo(.008 - spec.fluted.depth, 7)
      for (const edge of [centers.filter(c => c < 0).at(-1)! + spec.fluted.width / 2, centers.find(c => c > 0)! - spec.fluted.width / 2]) {
        const ids = samplesAt(edge)
        expect(ids.length).toBeGreaterThan(0)
        for (const i of ids) {
          expect(p.getZ(i)).toBeCloseTo(.008, 7)
          expect([n.getX(i), n.getY(i), n.getZ(i)]).toEqual([0, 0, 1])
        }
      }
    } finally { geometry.dispose() }
  })

  it('adds centred groove pairs without stretching or shifting the existing pattern', () => {
    let previous = grooveLayout(.2, spec.fluted)
    for (let mm = 201; mm <= 1000; mm++) {
      const layout = grooveLayout(mm / 1000, spec.fluted)
      expect(layout.centers).toContain(0)
      expect(layout.margin).toBeGreaterThanOrEqual(spec.fluted.margin - 1e-9)
      expect(layout.margin).toBeLessThan(spec.fluted.margin + spec.fluted.pitch + 1e-9)
      expect(layout.centers[0]).toBe(-layout.centers.at(-1)!)
      for (const center of previous.centers) expect(layout.centers.some(c => Math.abs(c - center) < 1e-9)).toBe(true)
      for (let i = 1; i < layout.count; i++) expect(layout.centers[i] - layout.centers[i - 1]).toBeCloseTo(.02, 9)
      previous = layout
    }
  })

  it.each(['smooth', 'frame', 'fluted', 'fluted-sides', 'diagonal', 'herringbone'] as const)('%s remains a closed nondegenerate solid inside its physical envelope', style => {
    for (const [width, height] of [[.595, .1646666667], [.795, .208], [.995, .2813333333], [.496, 2.311]]) {
      const geometry = createFacadeGeometry(width, height, .016, style, spec)
      try {
        const p = geometry.getAttribute('position'), normal = geometry.getAttribute('normal'), uv = geometry.getAttribute('uv'), index = geometry.index!
        const size = geometry.boundingBox!.getSize(new Vector3())
        expect(size.x).toBeCloseTo(width, 6); expect(size.y).toBeCloseTo(height, 6); expect(size.z).toBeCloseTo(.016, 6)
        const key = (v: Vector3) => v.toArray().map(n => Math.round(n * 1e7)).join(',')
        const edges = new Map<string, number>(), a = new Vector3(), b = new Vector3(), c = new Vector3()
        for (let i = 0; i < index.count; i += 3) {
          a.fromBufferAttribute(p, index.getX(i)); b.fromBufferAttribute(p, index.getX(i + 1)); c.fromBufferAttribute(p, index.getX(i + 2))
          expect(new Vector3().subVectors(b, a).cross(new Vector3().subVectors(c, a)).lengthSq()).toBeGreaterThan(1e-20)
          for (const [v, w] of [[a, b], [b, c], [c, a]]) { const k = [key(v), key(w)].sort().join('|'); edges.set(k, (edges.get(k) ?? 0) + 1) }
        }
        expect([...edges.values()].every(n => n === 2)).toBe(true)
        for (let i = 0; i < p.count; i++) {
          expect(new Vector3().fromBufferAttribute(normal, i).length()).toBeCloseTo(1, 5)
          expect(Number.isFinite(uv.getX(i)) && Number.isFinite(uv.getY(i))).toBe(true)
        }
        expect(index.count / 3).toBeLessThan(12000)
      } finally { geometry.dispose() }
    }
  })

  it.each(['fluted', 'fluted-sides'] as const)('%s keeps grain spacing metric along the machined surface', style => {
    const geometry = createFacadeGeometry(.795, .208, .016, style, spec)
    try {
      const p = geometry.getAttribute('position'), uv = geometry.getAttribute('uv')
      const y = -.208 / 2 + spec.fluted.endMargin + spec.fluted.fade
      const points = Array.from({ length: p.count }, (_, i) => i).filter(i => Math.abs(p.getY(i) - y) < 1e-7 && p.getZ(i) > 0)
      // Rim vertices share positions but have their own edge UV projection.
      // Keep the first (front-grid) vertex at each coordinate.
      const front = new Map<string, number>()
      for (const i of points) if (!front.has(p.getX(i).toFixed(7))) front.set(p.getX(i).toFixed(7), i)
      const unique = [...front.values()].sort((a, b) => p.getX(a) - p.getX(b))
      for (let i = 1; i < unique.length; i++) {
        const a = unique[i - 1], b = unique[i], distance = Math.hypot(p.getX(b) - p.getX(a), p.getZ(b) - p.getZ(a))
        expect(uv.getX(b) - uv.getX(a)).toBeCloseTo(distance, 6)
      }
      expect(unique.length).toBeGreaterThan(100)
    } finally { geometry.dispose() }
  })

  it('keeps flat frame rails and the recessed field flat in their shading', () => {
    const geometry = createFacadeGeometry(.795, .208, .016, 'frame', spec)
    try {
      const p = geometry.getAttribute('position'), n = geometry.getAttribute('normal'), index = geometry.index!
      let flats = 0
      for (let i = 0; i < index.count; i += 3) {
        const ids = [index.getX(i), index.getX(i + 1), index.getX(i + 2)]
        if (p.getZ(ids[0]) <= 0 || !ids.every(j => Math.abs(p.getZ(j) - p.getZ(ids[0])) < 1e-7)) continue
        flats++
        for (const j of ids) { expect(n.getX(j)).toBeCloseTo(0, 6); expect(n.getY(j)).toBeCloseTo(0, 6); expect(n.getZ(j)).toBeCloseTo(1, 6) }
      }
      expect(flats).toBe(24)
    } finally { geometry.dispose() }
  })
})
