import type { WardrobeAssemblyConfiguration } from './state'

export const MAX_CORNER_SECTIONS = 21
export const CORNER_ID = 'corner-1'
export const SECOND_CORNER_ID = 'corner-2'
// Two 50 cm returns provide a 70.7 cm diagonal opening before board reveals.
export const CORNER_RETURN = .5
export type WardrobeCorner = { height: number; shelves: number; bodyFinish?: string }
export type WardrobeArrangement =
  | { kind: 'l'; side: 'left' | 'right'; split: number; corner: WardrobeCorner }
  | { kind: 'u'; side?: never; split: number; secondSplit: number; corner: WardrobeCorner; secondCorner: WardrobeCorner }
export type WardrobeArm = 0 | 1 | 2
export const ARM_LABELS = ['А', 'Б', 'В'] as const
export type SectionPlacement = { id: string; arm: WardrobeArm; x: number; z: number; yaw: number; width: number; height: number; depth: number }
export type PointXZ = [number, number]
export type CornerPlacement = WardrobeCorner & { id: string; polygon: PointXZ[]; width: number; depth: number; depthA: number; depthB: number; sign: number; origin: PointXZ }
export type WardrobePlacement = { bounds: { width: number; height: number; depth: number }; corner: CornerPlacement | null; corners: CornerPlacement[]; sections: SectionPlacement[] }
export const wardrobeCornerCount = (c: WardrobeAssemblyConfiguration) => !c.arrangement ? 0 : c.arrangement.kind === 'u' ? 2 : 1
export const wardrobeSectionCount = (c: WardrobeAssemblyConfiguration) => c.sections.length + wardrobeCornerCount(c)
export const wardrobeSectionLimit = (c: WardrobeAssemblyConfiguration) => c.arrangement ? MAX_CORNER_SECTIONS : 7
export function wardrobeArmRanges(c: WardrobeAssemblyConfiguration) {
  const a = c.arrangement
  const ends = !a ? [c.sections.length] : a.kind === 'l' ? [a.split, c.sections.length] : [a.split, a.secondSplit, c.sections.length]
  return ends.map((end, i) => ({ arm: i as WardrobeArm, start: i ? ends[i - 1] : 0, end }))
}
export function wardrobeArmAt(c: WardrobeAssemblyConfiguration, index: number): WardrobeArm {
  return wardrobeArmRanges(c).find(r => index < r.end)?.arm ?? 0
}
export function straightWardrobeBounds(c: WardrobeAssemblyConfiguration) {
  return { width: Number(c.sections.reduce((sum, s) => sum + s.width, 0).toFixed(8)), height: Math.max(...c.sections.map(s => s.height)), depth: Math.max(...c.sections.map(s => s.depth)) }
}
export function wardrobePlacement(c: WardrobeAssemblyConfiguration): WardrobePlacement {
  const row = straightWardrobeBounds(c)
  if (!c.arrangement) {
    let x = -row.width / 2
    return { bounds: row, corner: null, corners: [], sections: c.sections.map(s => {
      const p: SectionPlacement = { ...s, arm: 0, x: x + s.width / 2, z: (s.depth - row.depth) / 2, yaw: 0 }
      x += s.width
      return p
    }) }
  }
  const a = c.arrangement, isU = a.kind === 'u'
  const arms = wardrobeArmRanges(c).map(r => c.sections.slice(r.start, r.end))
  const depths = arms.map(list => Math.max(...list.map(s => s.depth)))
  const widths = arms.map(list => list.reduce((sum, s) => sum + s.width, 0))
  const cx = depths[1] + CORNER_RETURN, cz = depths[0] + CORNER_RETURN
  const rightWidth = isU ? depths[2] + CORNER_RETURN : 0
  const width = cx + widths[0] + rightWidth
  const depth = cz + Math.max(widths[1], isU ? widths[2] : 0)
  const sign = a.side === 'right' ? -1 : 1
  const world = (x: number, z: number): PointXZ => [sign * (x - width / 2), z - depth / 2]
  const makeCorner = (id: string, settings: WardrobeCorner, w: number, sideDepth: number, origin: PointXZ, direction: number): CornerPlacement => ({
    ...settings, id, width: w, depth: cz, depthA: depths[0], depthB: sideDepth, sign: direction, origin,
    polygon: [[0, 0], [w, 0], [w, depths[0]], [sideDepth, cz], [0, cz]].map(([x, z]) => [origin[0] + direction * x, origin[1] + z]),
  })
  const corners = [makeCorner(CORNER_ID, a.corner, cx, depths[1], world(0, 0), sign)]
  if (isU) corners.push(makeCorner(SECOND_CORNER_ID, a.secondCorner, rightWidth, depths[2], world(width, 0), -1))
  const sections: SectionPlacement[] = []
  for (const [arm, list] of arms.entries()) {
    let offset = 0
    for (const s of list) {
      const [x, z] = arm === 0 ? world(cx + offset + s.width / 2, s.depth / 2)
        : world(arm === 1 ? s.depth / 2 : width - s.depth / 2, cz + offset + s.width / 2)
      sections.push({ ...s, arm: arm as WardrobeArm, x, z, yaw: arm === 0 ? 0 : arm === 1 ? sign * Math.PI / 2 : -Math.PI / 2 })
      offset += s.width
    }
  }
  return { bounds: { width: Number(width.toFixed(8)), height: Math.max(row.height, ...corners.map(p => p.height)), depth: Number(depth.toFixed(8)) }, corner: corners[0], corners, sections }
}
export function placementPolygon(p: SectionPlacement, closedDepth = p.depth): PointXZ[] {
  const c = Math.cos(p.yaw), s = Math.sin(p.yaw)
  return [[-p.width / 2, -p.depth / 2], [p.width / 2, -p.depth / 2], [p.width / 2, closedDepth - p.depth / 2], [-p.width / 2, closedDepth - p.depth / 2]]
    .map(([x, z]) => [p.x + x * c + z * s, p.z - x * s + z * c])
}
