import { BufferGeometry, Float32BufferAttribute, Vector3 } from 'three'
import type { DiamondsProfile } from './types'

type Point = [number, number]
type Plane = [number, number, number]
type Patch = { ring: Point[]; plane: Plane }
type Facet = { ring: Vector3[]; edge?: boolean }
const S = Math.SQRT1_2
const at = (plane: Plane, [x, y]: Point) => plane[0] * x + plane[1] * y + plane[2]
const subtract = (a: Plane, b: Plane): Plane => a.map((v, i) => v - b[i]) as Plane

/** Clip a convex polygon to an affine half-plane. */
function clip(ring: Point[], plane: Plane): Point[] {
  const result: Point[] = []
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i], b = ring[(i + 1) % ring.length], da = at(plane, a), db = at(plane, b)
    if (da >= -1e-12) result.push(a)
    if ((da < -1e-12 && db > 1e-12) || (da > 1e-12 && db < -1e-12)) {
      const t = da / (da - db)
      result.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t])
    }
  }
  return result
}

function limitDepth(patches: Patch[], limit: Plane): Patch[] {
  return patches.flatMap(({ ring, plane }) => {
    const diff = subtract(limit, plane), values = ring.map(p => at(diff, p))
    if (values.every(v => v >= -1e-12)) return [{ ring, plane }]
    if (values.every(v => v <= 1e-12)) return [{ ring, plane: limit }]
    return [{ ring: clip(ring, diff), plane }, { ring: clip(ring, subtract(plane, limit)), plane: limit }]
  })
}

/** Fixed metric ±45° lattice. Each diamond is a flat land and four V-cut slopes.
 * Shared valleys describe the union of the cuts: intersections never double
 * the depth or layer independent surfaces. Edge ramps end the cuts in the land.
 */
export function createDiamondsGeometry(width: number, height: number, thickness: number,
  bevel: number, profile: DiamondsProfile, clearCenter = 0) {
  const { pitch, width: grooveWidth, depth, margin, endMargin, fade } = profile
  if ([width, height, thickness, bevel, ...Object.values(profile), clearCenter].some(n => !Number.isFinite(n)) ||
      Math.min(width, height, thickness) <= 2 * bevel || bevel <= 0 || grooveWidth <= 0 ||
      pitch <= grooveWidth || depth <= 0 || depth >= thickness - bevel ||
      Math.min(margin, endMargin) <= bevel || fade <= 0 || clearCenter < 0) {
    throw new Error('Invalid diamonds facade profile')
  }
  const x = width / 2 - margin, y = height / 2 - endMargin, radius = grooveWidth / 2
  const regions = clearCenter > 0 ? [[-x, -clearCenter / 2], [clearCenter / 2, x]] : [[-x, x]]
  if (y <= fade || regions.some(([left, right]) => right - left <= 2 * fade)) {
    throw new Error('Facade is too small for its diamonds')
  }
  const front = thickness / 2, back = -front, facets: Facet[] = []
  const surface = ({ ring, plane }: Patch) => {
    if (ring.length >= 3) facets.push({ ring: ring.map(p => new Vector3(...p, front - Math.max(0, at(plane, p)))) })
  }
  const world = (u: number, v: number): Point => [(u - v) * S, (u + v) * S]
  const count = Math.ceil((x + y) * S / pitch)
  for (const [left, right] of regions) {
    const bounds: Plane[] = [[1, 0, -left], [-1, 0, right], [0, 1, y], [0, -1, y]]
    for (let i = -count; i < count; i++) for (let j = -count; j < count; j++) {
      const u = i * pitch, v = j * pitch
      const outer = [world(u, v), world(u + pitch, v), world(u + pitch, v + pitch), world(u, v + pitch)]
      if (outer.every(p => p[0] < left) || outer.every(p => p[0] > right) ||
          outer.every(p => p[1] < -y) || outer.every(p => p[1] > y)) continue
      const inner = [world(u + radius, v + radius), world(u + pitch - radius, v + radius),
        world(u + pitch - radius, v + pitch - radius), world(u + radius, v + pitch - radius)]
      const k = depth / radius
      const planes: Plane[] = [[k * S, -k * S, depth + k * v],
        [k * S, k * S, depth - k * (u + pitch)],
        [-k * S, k * S, depth - k * (v + pitch)],
        [-k * S, -k * S, depth + k * u]]
      const patches: Patch[] = [{ ring: inner, plane: [0, 0, 0] }]
      for (let side = 0; side < 4; side++) {
        const n = (side + 1) % 4
        patches.push({ ring: [outer[side], outer[n], inner[n], inner[side]], plane: planes[side] })
      }
      // Most tiles are away from the perimeter. Their full V-profile needs no
      // clipping or end ramps; keep those operations for boundary tiles only.
      if (outer.every(p => p[0] >= left + fade && p[0] <= right - fade && Math.abs(p[1]) <= y - fade)) {
        patches.forEach(surface)
        continue
      }
      for (const patch of patches) {
        const ring = bounds.reduce((polygon, bound) => clip(polygon, bound), patch.ring)
        if (ring.length < 3) continue
        let pieces: Patch[] = [{ ...patch, ring }]
        for (const bound of bounds) pieces = limitDepth(pieces, bound.map(n => n * depth / fade) as Plane)
        pieces.forEach(surface)
      }
    }
  }
  const outline = (inset: number): Point[] => {
    const w = width / 2 - inset, h = height / 2 - inset, b = bevel
    return [[-w + b, -h], [w - b, -h], [w, -h + b], [w, h - b],
      [w - b, h], [-w + b, h], [-w, h - b], [-w, -h + b]]
  }
  const face = outline(bevel), outer = outline(0)
  // Flat mounting fields and margins complete the front without an underlay.
  const middle = clip(clip(face, [0, 1, y]), [0, -1, y])
  const lands = [clip(face, [0, 1, -y]), clip(face, [0, -1, -y]),
    clip(middle, [-1, 0, -x]), clip(middle, [1, 0, -x])]
  if (clearCenter > 0) lands.push(clip(clip(middle, [1, 0, clearCenter / 2]), [-1, 0, clearCenter / 2]))
  lands.forEach(ring => surface({ ring, plane: [0, 0, 0] }))
  for (let i = 0; i < outer.length; i++) {
    const j = (i + 1) % outer.length
    facets.push({ ring: [new Vector3(...outer[i], front - bevel), new Vector3(...outer[j], front - bevel),
      new Vector3(...face[j], front), new Vector3(...face[i], front)] })
    facets.push({ edge: true, ring: [new Vector3(...outer[i], back), new Vector3(...outer[j], back),
      new Vector3(...outer[j], front - bevel), new Vector3(...outer[i], front - bevel)] })
  }
  facets.push({ ring: outer.slice().reverse().map(p => new Vector3(...p, back)) })
  return stitchFacets(facets, { style: 'diamonds', width, height, thickness }, pitch / 2)
}

/** Retain subdivision points on adjacent planar patches, including clipped
 * lattice ends and the long flat margins. This avoids T-junctions at any size.
 */
function stitchFacets(facets: Facet[], metadata: Record<string, string | number>, cellSize: number) {
  // Index each unique point once. Short lattice edges then inspect only nearby
  // cells, rather than hashing a 3D supporting line twice per edge and scanning
  // every endpoint along a whole row of diamonds. The grid only finds candidates;
  // the 3D distance check below still decides which points belong to the edge.
  const pointKey = (p: Vector3) => `${Math.round(p.x * 1e7)},${Math.round(p.y * 1e7)},${Math.round(p.z * 1e7)}`
  const canonical = new Map<string, number>(), points: Vector3[] = []
  const clean = facets.map(({ ring, edge }) => {
    const ids = ring.map(p => {
      const key = pointKey(p)
      let id = canonical.get(key)
      if (id === undefined) { id = points.length; canonical.set(key, id); points.push(p) }
      return id
    })
    return { edge, ring: ids.filter((id, i) => id !== ids[(i + 1) % ids.length]) }
  }).filter(f => f.ring.length >= 3)
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const p of points) {
    minX = Math.min(minX, p.x); minY = Math.min(minY, p.y)
    maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y)
  }
  const columns = Math.floor((maxX - minX) / cellSize) + 1
  const rows = Math.floor((maxY - minY) / cellSize) + 1
  const cells: (number[] | undefined)[] = new Array(columns * rows)
  for (let id = 0; id < points.length; id++) {
    const p = points[id], x = Math.floor((p.x - minX) / cellSize), y = Math.floor((p.y - minY) / cellSize)
    ;(cells[y * columns + x] ??= []).push(id)
  }
  const positions: number[] = [], normals: number[] = [], uvs: number[] = [], indices: number[] = []
  const vertex = (p: Vector3, normal: Vector3, edge: boolean, alongX: boolean) => {
    const id = positions.length / 3
    positions.push(p.x, p.y, p.z); normals.push(normal.x, normal.y, normal.z)
    uvs.push(.5 + (edge && !alongX ? p.z : p.x), .5 + (edge && alongX ? p.z : p.y))
    return id
  }
  const center = new Vector3(), normal = new Vector3(), ab = new Vector3(), ac = new Vector3()
  const candidates: { id: number; t: number }[] = []
  for (const { ring, edge = false } of clean) {
    const stitched: number[] = []
    for (let i = 0; i < ring.length; i++) {
      const a = points[ring[i]], b = points[ring[(i + 1) % ring.length]]
      const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z, lengthSq = dx * dx + dy * dy + dz * dz
      // Expand cell bounds by the same tolerance as the collinearity test, so
      // an edge exactly on a cell boundary also finds points in its neighbour.
      const x0 = Math.max(0, Math.floor((Math.min(a.x, b.x) - minX - 1e-8) / cellSize))
      const x1 = Math.min(columns - 1, Math.floor((Math.max(a.x, b.x) - minX + 1e-8) / cellSize))
      const y0 = Math.max(0, Math.floor((Math.min(a.y, b.y) - minY - 1e-8) / cellSize))
      const y1 = Math.min(rows - 1, Math.floor((Math.max(a.y, b.y) - minY + 1e-8) / cellSize))
      candidates.length = 0
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        const cell = cells[y * columns + x]
        if (!cell) continue
        for (const id of cell) {
          const p = points[id], px = p.x - a.x, py = p.y - a.y, pz = p.z - a.z
          const t = (px * dx + py * dy + pz * dz) / lengthSq
          if (t < -1e-9 || t >= 1 - 1e-9) continue
          const ex = px - dx * t, ey = py - dy * t, ez = pz - dz * t
          if (ex * ex + ey * ey + ez * ez <= 1e-16) candidates.push({ id, t })
        }
      }
      candidates.sort((a, b) => a.t - b.t)
      for (const candidate of candidates) stitched.push(candidate.id)
    }
    if (stitched.length < 3) continue
    center.set(0, 0, 0); normal.set(0, 0, 0)
    for (const id of stitched) center.add(points[id])
    center.divideScalar(stitched.length)
    for (let i = 0; i < stitched.length; i++) {
      ab.subVectors(points[stitched[i]], center); ac.subVectors(points[stitched[(i + 1) % stitched.length]], center)
      normal.add(ab.cross(ac))
    }
    if (normal.lengthSq() < 1e-20) continue
    normal.normalize()
    const alongX = Math.abs(normal.y) > Math.abs(normal.x), c = vertex(center, normal, edge, alongX)
    const ids = stitched.map(id => vertex(points[id], normal, edge, alongX))
    for (let i = 0; i < ids.length; i++) indices.push(c, ids[i], ids[(i + 1) % ids.length])
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3))
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices); geometry.computeBoundingBox(); geometry.computeBoundingSphere()
  geometry.userData.facade = metadata
  return geometry
}
