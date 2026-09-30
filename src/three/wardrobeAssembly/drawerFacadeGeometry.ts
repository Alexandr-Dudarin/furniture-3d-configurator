import { BufferGeometry, Float32BufferAttribute, ShapeUtils, Vector2 } from 'three'
import type { WardrobeDrawerFacade } from '../../configurator/wardrobeAssembly/drawerFacades'
import type { WardrobeDrawerHandle } from '../../configurator/wardrobeAssembly/drawerHandles'
import { createFacadeGeometry, facadeFlutingProfile, grooveLayout, flutingSamples, wideGroove } from '../facades/facadeGeometry'
import type { FacadeVariants } from '../facades/types'

export const DRAWER_FACADE_PROFILE: FacadeVariants = {
  defaultStyle: 'smooth', styles: ['smooth', 'frame', 'fluted', 'fluted-wide'], targets: [], materialSlot: 'body',
  bevel: .00075,
  frame: { width: .028, depth: .003, slope: .002, minField: .040 },
  fluted: { pitch: .020, width: .004, depth: .0018, margin: .020, endMargin: .018, fade: .006 },
}

// Relief and phase belong to the facade, independently of face-mounted hardware.
// Mount roots enter the relief by 2 mm; the rest of the handle keeps its size.
export function drawerHandleMountDepth(style?: WardrobeDrawerFacade, handle?: WardrobeDrawerHandle) {
  if (style === 'frame' && handle === 'semicircle') return DRAWER_FACADE_PROFILE.frame.depth + .0002
  return (style === 'fluted' || style === 'fluted-wide') && handle !== 'profile'
    ? DRAWER_FACADE_PROFILE.fluted.depth + .0002 : 0
}

type Point = [number, number, number]
type XY = [number, number]

// The notch is a true open contour. Relief stops before its rim, so its cut
// remains clear at every distance and never gets filled by a decorative mesh.
function notchedFacade(width: number, height: number, thickness: number, style: 'frame' | 'fluted' | 'fluted-wide') {
  const front = thickness / 2, back = -front, top = height / 2
  const arc: XY[] = Array.from({ length: 49 }, (_, i) => {
    const angle = Math.PI * i / 48
    return [.05 * Math.cos(angle), top - .030 * Math.sin(angle)]
  })
  const positions: number[] = [], uvs: number[] = [], indices: number[] = []
  const wideNormals: { id: number; x: number; y: number }[] = []
  const vertex = (p: Point, u = .5 + p[0], v = .5 + p[1]) => {
    const id = positions.length / 3; positions.push(...p); uvs.push(u, v); return id
  }
  const quad = (a: number, b: number, c: number, d: number) => indices.push(a, b, c, a, c, d)
  const rim = (outline: XY[]) => {
    for (let i = 0; i < outline.length; i++) {
      const a = outline[i], b = outline[(i + 1) % outline.length]
      // Separate edge vertices keep their normals independent of the face.
      const length = Math.hypot(b[0] - a[0], b[1] - a[1])
      quad(vertex([a[0], a[1], back], 0, 0), vertex([b[0], b[1], back], length, 0),
        vertex([b[0], b[1], front], length, thickness), vertex([a[0], a[1], front], 0, thickness))
    }
  }
  let count = 0
  if (style === 'frame') {
    const outline: XY[] = [[-width / 2, -top], [width / 2, -top], [width / 2, top], ...arc, [-width / 2, top]]
    const rect = (inset: number): XY[] => [[-width / 2 + inset, -top + inset], [width / 2 - inset, -top + inset],
      [width / 2 - inset, top - inset], [-width / 2 + inset, top - inset]]
    // 40 mm leaves a 10 mm uncut bridge below the 30 mm-deep notch.
    const rings = [rect(.040), rect(.042), rect(.044)]
    const points = [...outline, ...rings[0]]
    const face = points.map(p => vertex([p[0], p[1], front]))
    for (const tri of ShapeUtils.triangulateShape(outline.map(p => new Vector2(...p)), [rings[0].map(p => new Vector2(...p))])) indices.push(...tri.map(i => face[i]))
    for (let r = 0; r < 2; r++) {
      // Each straight slope is a plane. Sharing its corner normals with the
      // perpendicular slope made long sides look like two offset U shapes.
      for (let i = 0; i < 4; i++) {
        const j = (i + 1) % 4
        const at = (ring: number, corner: number): Point => [...rings[ring][corner], ring === 1 ? front - .003 : front]
        quad(vertex(at(r, i)), vertex(at(r, j)), vertex(at(r + 1, j)), vertex(at(r + 1, i)))
      }
    }
    const field = rings[2].map(p => vertex([p[0], p[1], front])); quad(...field as [number, number, number, number])
    const rear = outline.map(p => vertex([p[0], p[1], back]))
    for (const tri of ShapeUtils.triangulateShape(outline.map(p => new Vector2(...p)), [])) indices.push(...tri.reverse().map(i => rear[i]))
    rim(outline)
  } else {
    const profile = facadeFlutingProfile(DRAWER_FACADE_PROFILE, style)
    const centers = grooveLayout(width, profile).centers
    count = centers.length
    const samples = [-width / 2, width / 2, ...arc.map(p => p[0])]
    for (const c of centers) for (const offset of flutingSamples(profile.width, style === 'fluted-wide')) samples.push(c + offset)
    const xs = samples.sort((a, b) => a - b).filter((x, i, a) => !i || x - a[i - 1] > 1e-9)
    const end = .040, fade = profile.fade
    const ys = [-top, -top + end, -top + end + fade / 3, -top + end + 2 * fade / 3, -top + end + fade,
      top - end - fade, top - end - 2 * fade / 3, top - end - fade / 3, top - end]
    const cutY = (x: number) => {
      if (x <= -.05 || x >= .05) return top
      // Follow the same 48-segment semiellipse as the accepted smooth notch.
      const i = arc.findIndex(p => p[0] <= x), a = arc[i - 1], b = arc[i]
      return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0])
    }
    const rows = [...ys.map(y => xs.map((x): Point => {
      const c = centers.find(c => Math.abs(x - c) <= profile.width / 2 + 1e-10)
      const groove = c === undefined ? 0 : (style === 'fluted-wide' ? wideGroove(x - c, profile.width, profile.depth).depth : Math.cos(Math.PI * (x - c) / profile.width) ** 2 * profile.depth)
      const taper = Math.max(0, Math.min(1, (top - Math.abs(y) - end) / fade))
      return [x, y, front - groove * Math.sin(taper * Math.PI / 2) ** 2]
    })), xs.map((x): Point => [x, cutY(x), front])]
    // Metric UV distance along each machined row, as in catalogue facades.
    const grid = rows.map(row => {
      const u = [0]
      for (let i = 1; i < row.length; i++) u.push(u[i - 1] + Math.hypot(row[i][0] - row[i - 1][0], row[i][2] - row[i - 1][2]))
      return row.map((p, i) => {
        const id = vertex(p, .5 + u[i] - u.at(-1)! / 2, .5 + p[1])
        if (style === 'fluted-wide') {
          const c = centers.find(c => Math.abs(p[0] - c) <= profile.width / 2 + 1e-10)
          const g = c === undefined ? { depth: 0, slope: 0 } : wideGroove(p[0] - c, profile.width, profile.depth)
          const t = Math.max(0, Math.min(1, (top - Math.abs(p[1]) - end) / fade))
          wideNormals.push({ id, x: g.slope * Math.sin(t * Math.PI / 2) ** 2,
            y: -Math.sign(p[1]) * g.depth * Math.PI / (2 * fade) * Math.sin(t * Math.PI) })
        }
        return id
      })
    })
    const rear = rows.map(row => row.map(p => vertex([p[0], p[1], back])))
    for (let y = 0; y < rows.length - 1; y++) for (let x = 0; x < xs.length - 1; x++) {
      quad(grid[y][x], grid[y][x + 1], grid[y + 1][x + 1], grid[y + 1][x])
      quad(rear[y][x], rear[y + 1][x], rear[y + 1][x + 1], rear[y][x + 1])
    }
    const outline = [...rows[0], ...rows.slice(1).map(row => row.at(-1)!),
      ...rows.at(-1)!.slice(0, -1).reverse(), ...rows.slice(1, -1).reverse().map(row => row[0])]
    rim(outline.map(p => [p[0], p[1]]))
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2)); geometry.setIndex(indices)
  geometry.computeVertexNormals(); geometry.computeBoundingBox(); geometry.computeBoundingSphere()
  for (const { id, x, y } of wideNormals) {
    const length = Math.hypot(x, y, 1); geometry.getAttribute('normal').setXYZ(id, x / length, y / length, 1 / length)
  }
  geometry.userData.facade = { style, width, height, thickness, grooveCount: count, notch: true, bevel: 0 }
  return geometry
}

export function createDrawerFacadeGeometry(width: number, height: number, thickness: number,
  style: Exclude<WardrobeDrawerFacade, 'smooth'>, handle?: WardrobeDrawerHandle) {
  if (handle === 'finger-notch') return notchedFacade(width, height, thickness, style)
  return createFacadeGeometry(width, height, thickness, style, DRAWER_FACADE_PROFILE,
    { frameField: 'flush' })
}
