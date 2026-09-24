import { BufferGeometry, Float32BufferAttribute, Vector3 } from 'three'
import type { FacadeStyleId, FacadeTarget, FacadeVariants } from './types'

type Point = [number, number, number]

export function grooveLayout(width: number, profile: FacadeVariants['fluted']) {
  // Add/remove whole pairs at the edges; the centre groove never shifts by half
  // a pitch when the count changes during a one-millimetre resize.
  const room = width - 2 * profile.margin - profile.width
  const count = room < 0 ? 0 : 1 + 2 * Math.floor((room + 1e-10) / (2 * profile.pitch))
  const centers = Array.from({ length: count }, (_, i) => (i - (count - 1) / 2) * profile.pitch)
  return { count, centers, margin: count ? (width - (count - 1) * profile.pitch - profile.width) / 2 : width / 2 }
}

export function sideGrooveLayout(width: number, profile: FacadeVariants['fluted'], clearCenter = 0) {
  // Each outer quarter may contain whole grooves. Anchor their phase to the
  // nearest edge; widening the panel only adds mirrored pairs towards the field.
  // The middle half (or a larger handle footprint) always stays on the front plane.
  const outer = width / 2 - profile.margin - profile.width / 2
  const inner = Math.max(width / 4, clearCenter / 2) + profile.width / 2
  const perSide = Math.max(0, 1 + Math.floor((outer - inner + 1e-10) / profile.pitch))
  const right = Array.from({ length: perSide }, (_, i) => outer - i * profile.pitch)
  const centers = [...right.map(x => -x), ...right.slice().reverse()]
  return { count: centers.length, centers }
}

// One owned mesh per panel. Dimensions and profiles are in metres; all relief is
// cut into the original thickness, never added in front of the mounting plane.
export function createFacadeGeometry(width: number, height: number, thickness: number,
  style: Exclude<FacadeStyleId, 'original'>, spec: FacadeVariants,
  target: Pick<FacadeTarget, 'frameWidth' | 'frameField' | 'flutedClearCenter'> = {}): BufferGeometry {
  const b = spec.bevel, front = thickness / 2, back = -front
  if (Math.min(width, height, thickness) <= 2 * b || spec.frame.depth >= thickness || spec.fluted.depth >= thickness) {
    throw new Error('Facade profile exceeds its panel envelope')
  }
  const positions: number[] = [], uv: number[] = [], indices: number[] = [], flatFront: number[] = []
  const vertex = (p: Point, u = .5 + p[0], v = .5 + p[1]) => {
    const index = positions.length / 3; positions.push(...p); uv.push(u, v); return index
  }
  const quad = (a: number, c: number, d: number, e: number) => indices.push(a, c, d, a, d, e)
  // A separate rim preserves hard normals between front, edges and back.
  const closeSolid = (outline: Point[]) => {
    for (let i = 0; i < outline.length; i++) {
      const a = outline[i], c = outline[(i + 1) % outline.length]
      const alongX = Math.abs(c[0] - a[0]) >= Math.abs(c[1] - a[1])
      const edgeVertex = (p: Point) => alongX ? vertex(p, .5 + p[0], .5 + p[2]) : vertex(p, .5 + p[2], .5 + p[1])
      quad(edgeVertex([a[0], a[1], back]), edgeVertex([c[0], c[1], back]), edgeVertex(c), edgeVertex(a))
    }
    const center = vertex([0, 0, back])
    const ring = outline.map(p => vertex([p[0], p[1], back]))
    for (let i = 0; i < ring.length; i++) indices.push(center, ring[(i + 1) % ring.length], ring[i])
  }
  let count = 0
  if (style === 'frame' || style === 'smooth') {
    const { depth, slope, minField } = spec.frame
    const rail = target.frameWidth ?? spec.frame.width
    const flush = target.frameField === 'flush'
    if (style === 'frame' && Math.min(width, height) - 2 * (rail + slope * (flush ? 2 : 1)) < minField) throw new Error('Facade is too small for its frame')
    const outline = (inset: number, z: number): Point[] => {
      const x = width / 2 - inset, y = height / 2 - inset, c = Math.min(b, x / 4, y / 4)
      return [[-x + c, -y, z], [x - c, -y, z], [x, -y + c, z], [x, y - c, z],
        [x - c, y, z], [-x + c, y, z], [-x, y - c, z], [-x, -y + c, z]]
    }
    const rings = [outline(0, front - b), outline(b, front)]
    if (style === 'frame') {
      rings.push(outline(rail, front), outline(rail + slope, front - depth))
      if (flush) rings.push(outline(rail + 2 * slope, front))
    }
    // Keep the flat rail and recessed field planar in the lighting as well as
    // geometry. Sharing normals with the narrow slope would shade the entire
    // 28/45 mm rail like a broad bevel.
    for (let r = 0; r < rings.length - 1; r++) {
      const outer = rings[r].map(p => vertex(p)), inner = rings[r + 1].map(p => vertex(p))
      for (let i = 0; i < 8; i++) {
        const n = (i + 1) % 8; quad(outer[i], outer[n], inner[n], inner[i])
      }
    }
    const fieldRing = rings.at(-1)!
    const center = vertex([0, 0, fieldRing[0][2]])
    const field = fieldRing.map(p => vertex(p))
    for (let i = 0; i < 8; i++) indices.push(center, field[i], field[(i + 1) % 8])
    closeSolid(rings[0])
  } else {
    const profile = spec.fluted, layout = style === 'fluted-sides'
      ? sideGrooveLayout(width, profile, target.flutedClearCenter)
      : grooveLayout(width, profile)
    const centers = layout.centers.filter(c => !target.flutedClearCenter || Math.abs(c) - profile.width / 2 >= target.flutedClearCenter / 2)
    count = centers.length
    if (!count || height <= 2 * (profile.endMargin + profile.fade)) throw new Error('Facade is too small for its fluting')
    const xs = [-width / 2, -width / 2 + b]
    for (const center of centers) for (let i = 0; i <= 8; i++) xs.push(center + profile.width * (i / 8 - .5))
    xs.push(width / 2 - b, width / 2)
    const ys = [-height / 2, -height / 2 + b, -height / 2 + profile.endMargin]
    for (let i = 1; i <= 3; i++) ys.push(-height / 2 + profile.endMargin + profile.fade * i / 3)
    for (let i = 3; i >= 0; i--) ys.push(height / 2 - profile.endMargin - profile.fade * i / 3)
    ys.push(height / 2 - b, height / 2)
    const points = ys.map(y => xs.map((x): Point => {
      const center = centers.find(c => Math.abs(x - c) <= profile.width / 2 + 1e-10)
      const groove = center === undefined ? 0 : Math.cos(Math.PI * (x - center) / profile.width) ** 2 * profile.depth
      const end = Math.max(0, Math.min(1, (height / 2 - Math.abs(y) - profile.endMargin) / profile.fade))
      const fade = Math.sin(end * Math.PI / 2) ** 2
      const edge = Math.max(0, Math.abs(x) - (width / 2 - b), Math.abs(y) - (height / 2 - b))
      return [x, y, front - groove * fade - edge]
    }))
    // Cumulative distances keep a metre of grain a metre along the machined
    // surface. Centre phase stays fixed when full repeats are added at the sides.
    const arc = (points: Point[]) => {
      const values = [0]
      for (let i = 1; i < points.length; i++) values.push(values[i - 1] + new Vector3(...points[i]).distanceTo(new Vector3(...points[i - 1])))
      return values.map(v => .5 + v - values.at(-1)! / 2)
    }
    const us = points.map(arc), vs = xs.map((_, x) => arc(points.map(row => row[x])))
    const grid = points.map((row, y) => row.map((p, x) => {
      const id = vertex(p, us[y][x], vs[x][y])
      // A cosine groove meets its flat land with zero slope. Keep that exact
      // normal so neighbouring grooves do not shade the wide centre like a bowl.
      if (style === 'fluted-sides' && Math.abs(p[2] - front) < 1e-10) flatFront.push(id)
      return id
    }))
    for (let y = 0; y < ys.length - 1; y++) for (let x = 0; x < xs.length - 1; x++) quad(grid[y][x], grid[y][x + 1], grid[y + 1][x + 1], grid[y + 1][x])
    // Every front boundary vertex is retained in the rim, avoiding T-junctions.
    const outline = [...points[0], ...points.slice(1).map(row => row.at(-1)!),
      ...points.at(-1)!.slice(0, -1).reverse(), ...points.slice(1, -1).reverse().map(row => row[0])]
    closeSolid(outline)
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new Float32BufferAttribute(uv, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals(); geometry.computeBoundingBox(); geometry.computeBoundingSphere()
  for (const id of flatFront) geometry.getAttribute('normal').setXYZ(id, 0, 0, 1)
  geometry.userData.facade = { style, width, height, thickness, grooveCount: count }
  return geometry
}
