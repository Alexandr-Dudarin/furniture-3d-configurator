import { BufferGeometry, Float32BufferAttribute, ShapeUtils, Vector2 } from 'three'
import type { DiagonalProfile } from './types'

const S = Math.SQRT1_2
const CAP_SEGMENTS = 8
const PROFILE_STEPS = 4
type Point = [number, number]
const gpuPoint = (p: Point): Point => [Math.fround(p[0]), Math.fround(p[1])]
export type SlantedGroove = { offset: number; start: number; end: number; mirror?: boolean }

export function validateSlantedProfile(width: number, height: number, thickness: number,
  bevel: number, profile: DiagonalProfile, clearCenter: number) {
  const values = [width, height, thickness, bevel, ...Object.values(profile), clearCenter]
  if (values.some(n => !Number.isFinite(n)) || Math.min(width, height, thickness) <= 2 * bevel ||
      bevel <= 0 || profile.width <= 0 || profile.pitch <= profile.width || profile.depth <= 0 ||
      profile.depth >= thickness - bevel || Math.min(profile.margin, profile.endMargin) <= bevel ||
      profile.minLength <= profile.width || clearCenter < 0) throw new Error('Invalid slanted facade profile')
}

/** A single closed panel with rounded 45° grooves and metric coating UVs. */
export function createSlantedGrooveGeometry(width: number, height: number, thickness: number,
  bevel: number, profile: DiagonalProfile, grooves: SlantedGroove[], style: 'diagonal' | 'herringbone') {
  if (!grooves.length) throw new Error('Facade is too small for its pattern')
  const front = thickness / 2, back = -front
  const positions: number[] = [], uvs: number[] = [], indices: number[] = []
  const frontNormals: number[] = []
  const vertex = (p: Point, z: number, uv: Point = [.5 + p[0], .5 + p[1]]) => {
    const id = positions.length / 3
    positions.push(...p, z); uvs.push(...uv)
    return id
  }
  const quad = (a: number, b: number, c: number, d: number) => indices.push(a, b, c, a, c, d)
  const outline = (inset: number): Point[] => {
    const x = width / 2 - inset, y = height / 2 - inset, b = bevel
    return [[-x + b, -y], [x - b, -y], [x, -y + b], [x, y - b],
      [x - b, y], [-x + b, y], [-x, y - b], [-x, -y + b]]
  }
  const outer = outline(0).map(gpuPoint), face = outline(bevel).map(gpuPoint)
  const world = (across: number, along: number, offset: number, mirror = false): Point => {
    // Reverse the across direction as well, keeping rings consistently wound.
    return mirror ? [(-along - offset + across) * S, (along - offset + across) * S]
      : [(along + offset + across) * S, (along - offset - across) * S]
  }
  const capsule = ({ offset, start, end, mirror }: SlantedGroove, radius: number): Point[] => {
    const ring: Point[] = []
    for (const [center, angle] of [[start, Math.PI], [end, 0]]) {
      for (let i = 0; i <= CAP_SEGMENTS; i++) {
        const a = angle + Math.PI * i / CAP_SEGMENTS
        ring.push(world(Math.cos(a) * radius, center + Math.sin(a) * radius, offset, mirror))
      }
    }
    // Triangulate the same precision sent to the GPU. Otherwise nominally
    // collinear cap tips can form microscopic triangles that collapse there.
    return ring.map(gpuPoint)
  }
  const radius = profile.width / 2
  const holes = grooves.map(g => capsule(g, radius))
  const flat = [...face, ...holes.flat()].map(p => vertex(p, front))
  frontNormals.push(...flat)
  const faces = ShapeUtils.triangulateShape(face.map(p => new Vector2(...p)), holes.map(ring => ring.map(p => new Vector2(...p))))
  for (const triangle of faces) indices.push(...triangle.map(i => flat[i]))
  // Each groove joins the same complete perimeter used by the planar face.
  for (const [g, groove] of grooves.entries()) {
    let previous = holes[g].map(p => vertex(p, front))
    frontNormals.push(...previous)
    for (let step = 1; step < PROFILE_STEPS; step++) {
      const r = radius * (1 - step / PROFILE_STEPS)
      const z = front - profile.depth * Math.sin(step / PROFILE_STEPS * Math.PI / 2) ** 2
      const next = capsule(groove, r).map(p => vertex(p, z))
      for (let i = 0; i < next.length; i++) {
        const j = (i + 1) % next.length
        quad(previous[i], previous[j], next[j], next[i])
      }
      previous = next
    }
    const low = vertex(world(0, groove.start, groove.offset, groove.mirror), front - profile.depth)
    const high = vertex(world(0, groove.end, groove.offset, groove.mirror), front - profile.depth)
    for (let i = 0; i < CAP_SEGMENTS; i++) {
      indices.push(low, previous[i], previous[i + 1])
      indices.push(high, previous[CAP_SEGMENTS + 1 + i], previous[CAP_SEGMENTS + 2 + i])
    }
    quad(low, previous[CAP_SEGMENTS], previous[CAP_SEGMENTS + 1], high)
    quad(high, previous.at(-1)!, previous[0], low)
  }
  const outerIds = outer.map(p => vertex(p, front - bevel)), faceIds = face.map(p => vertex(p, front))
  for (let i = 0; i < outer.length; i++) {
    const j = (i + 1) % outer.length
    quad(outerIds[i], outerIds[j], faceIds[j], faceIds[i])
    const a = outer[i], b = outer[j], alongX = Math.abs(b[0] - a[0]) >= Math.abs(b[1] - a[1])
    const edge = (p: Point, z: number) => vertex(p, z, alongX ? [.5 + p[0], .5 + z] : [.5 + z, .5 + p[1]])
    quad(edge(a, back), edge(b, back), edge(b, front - bevel), edge(a, front - bevel))
  }
  const rear = outer.map(p => vertex(p, back)), center = vertex([0, 0], back)
  for (let i = 0; i < rear.length; i++) indices.push(center, rear[(i + 1) % rear.length], rear[i])
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices); geometry.computeVertexNormals()
  for (const i of frontNormals) geometry.getAttribute('normal').setXYZ(i, 0, 0, 1)
  geometry.computeBoundingBox(); geometry.computeBoundingSphere()
  geometry.userData.facade = { style, width, height, thickness, grooveCount: grooves.length }
  return geometry
}
