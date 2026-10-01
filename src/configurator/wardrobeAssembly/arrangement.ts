import type { WardrobeAssemblyConfiguration } from './state'

export const MAX_CORNER_SECTIONS = 21
export const CORNER_ID = 'corner-1'
// The two 50 cm returns provide a 70.7 cm diagonal opening before board reveals.
export const CORNER_RETURN = .5
export type WardrobeCorner = { height: number; shelves: number; bodyFinish?: string }
export type WardrobeArrangement = { kind: 'l'; side: 'left' | 'right'; split: number; corner: WardrobeCorner }
export type SectionPlacement = { id: string; arm: 0 | 1; x: number; z: number; yaw: number; width: number; height: number; depth: number }
export type PointXZ = [number, number]
export const wardrobeSectionCount = (c: WardrobeAssemblyConfiguration) => c.sections.length + (c.arrangement ? 1 : 0)
export const wardrobeSectionLimit = (c: WardrobeAssemblyConfiguration) => c.arrangement ? MAX_CORNER_SECTIONS : 7
export function straightWardrobeBounds(c: WardrobeAssemblyConfiguration) {
  return { width: Number(c.sections.reduce((sum, s) => sum + s.width, 0).toFixed(8)), height: Math.max(...c.sections.map(s => s.height)), depth: Math.max(...c.sections.map(s => s.depth)) }
}
export function wardrobePlacement(c: WardrobeAssemblyConfiguration) {
  const row = straightWardrobeBounds(c)
  if (!c.arrangement) {
    let x = -row.width / 2
    return { bounds: row, corner: null, sections: c.sections.map(s => {
      const p: SectionPlacement = { ...s, arm: 0, x: x + s.width / 2, z: (s.depth - row.depth) / 2, yaw: 0 }
      x += s.width
      return p
    }) }
  }
  const { split, side, corner } = c.arrangement
  const a = c.sections.slice(0, split), b = c.sections.slice(split)
  const depthA = Math.max(...a.map(s => s.depth)), depthB = Math.max(...b.map(s => s.depth))
  const cx = depthB + CORNER_RETURN, cz = depthA + CORNER_RETURN
  const width = cx + a.reduce((sum, s) => sum + s.width, 0), depth = cz + b.reduce((sum, s) => sum + s.width, 0)
  const sign = side === 'left' ? 1 : -1
  const world = (x: number, z: number): PointXZ => [sign * (x - width / 2), z - depth / 2]
  const polygon = [[0, 0], [cx, 0], [cx, depthA], [depthB, cz], [0, cz]].map(([x, z]) => world(x, z))
  const sections: SectionPlacement[] = []
  for (const [arm, list] of [a, b].entries()) {
    let offset = 0
    for (const s of list) {
      const [x, z] = arm === 0 ? world(cx + offset + s.width / 2, s.depth / 2) : world(s.depth / 2, cz + offset + s.width / 2)
      sections.push({ ...s, arm: arm as 0 | 1, x, z, yaw: arm === 0 ? 0 : sign * Math.PI / 2 })
      offset += s.width
    }
  }
  return { bounds: { width: Number(width.toFixed(8)), height: Math.max(row.height, corner.height), depth: Number(depth.toFixed(8)) },
    corner: { ...corner, polygon, width: cx, depth: cz, depthA, depthB, sign, origin: world(0, 0) }, sections }
}
export function placementPolygon(p: SectionPlacement, closedDepth = p.depth): PointXZ[] {
  const c = Math.cos(p.yaw), s = Math.sin(p.yaw)
  return [[-p.width / 2, -p.depth / 2], [p.width / 2, -p.depth / 2], [p.width / 2, closedDepth - p.depth / 2], [-p.width / 2, closedDepth - p.depth / 2]]
    .map(([x, z]) => [p.x + x * c + z * s, p.z - x * s + z * c])
}
