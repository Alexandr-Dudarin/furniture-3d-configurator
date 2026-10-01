import { Box3, Matrix4, Vector3, type Mesh } from 'three'
import { placementPolygon, wardrobePlacement, type PointXZ } from '../../configurator/wardrobeAssembly/arrangement'
import type { WardrobeAssemblyConfiguration } from '../../configurator/wardrobeAssembly/state'
import type { DrawerMotionEntry } from './wardrobeDrawerMotion'

type Obstacle = { id: string; polygon: PointXZ[]; height: number; minY?: number; bounds?: [number, number, number, number] }
// SAT for a projected moving bounding box and a convex footprint. Unlike a
// single corner AABB, the pentagon leaves the diagonal access free.
function overlaps(box: Box3, b: Obstacle) {
  if (Math.min(box.max.y, b.height) - Math.max(box.min.y, b.minY ?? 0) <= .0001) return false
  const [x0, z0, x1, z1] = b.bounds ??= [Math.min(...b.polygon.map(p => p[0])), Math.min(...b.polygon.map(p => p[1])), Math.max(...b.polygon.map(p => p[0])), Math.max(...b.polygon.map(p => p[1]))]
  if (Math.min(box.max.x, x1) - Math.max(box.min.x, x0) <= .0001 || Math.min(box.max.z, z1) - Math.max(box.min.z, z0) <= .0001) return false
  if (b.polygon.length === 4) return true
  const rect: PointXZ[] = [[box.min.x, box.min.z], [box.max.x, box.min.z], [box.max.x, box.max.z], [box.min.x, box.max.z]]
  for (const p of [rect, b.polygon]) for (let i = 0; i < p.length; i++) {
    const a = p[i], next = p[(i + 1) % p.length], dx = next[0] - a[0], dz = next[1] - a[1], length = Math.hypot(dx, dz)
    const project = (points: PointXZ[]) => points.map(([x, z]) => (-dz * x + dx * z) / length)
    const ra = project(rect), rb = project(b.polygon)
    if (Math.min(Math.max(...ra), Math.max(...rb)) - Math.max(Math.min(...ra), Math.min(...rb)) <= .0001) return false
  }
  return true
}
const occupiedOverlap = (a: Box3, b: Box3) => Math.min(a.max.x, b.max.x) - Math.max(a.min.x, b.min.x) > .002
  && Math.min(a.max.y, b.max.y) - Math.max(a.min.y, b.min.y) > .002
  && Math.min(a.max.z, b.max.z) - Math.max(a.min.z, b.min.z) > .002

// Evaluated only on edits. Animation uses precomputed limits/conflicts.
export function limitDoorSwing(entries: DrawerMotionEntry[], config: WardrobeAssemblyConfiguration) {
  const layout = wardrobePlacement(config)
  const bodies: Obstacle[] = layout.sections.map(p => ({ id: p.id, polygon: placementPolygon(p), height: p.height }))
  for (const corner of layout.corners) bodies.push({ id: corner.id, polygon: corner.polygon, height: corner.height })
  const rotation = new Matrix4(), translation = new Matrix4(), matrix = new Matrix4(), box = new Box3()
  // Closed fronts/handles beyond the carcass also remain physical obstacles.
  if (config.arrangement) for (const entry of entries) {
    if (entry.pivot) matrix.multiplyMatrices(entry.node.parent!.matrixWorld, translation.makeTranslation(...entry.pivot.origin))
    else matrix.copy(entry.node.parent!.matrixWorld)
    for (const mesh of entry.node.children as Mesh[]) {
      box.copy(mesh.geometry.boundingBox!).applyMatrix4(mesh.matrix).applyMatrix4(matrix)
      bodies.push({ id: entry.id.split('/')[0], minY: box.min.y, height: box.max.y,
        polygon: [[box.min.x, box.min.z], [box.max.x, box.min.z], [box.max.x, box.max.z], [box.min.x, box.max.z]] })
    }
  }
  const envelopes = new Map<string, Box3>()
  for (const entry of entries) {
    const parent = entry.node.parent!.matrixWorld
    const local = (entry.node.children as Mesh[]).map(mesh => mesh.geometry.boundingBox!.clone().applyMatrix4(mesh.matrix))
    // Broad phase: a swept leaf/drawer can only reach nearby bodies. Keep the
    // all-angle disk for doors so filtering never misses an intermediate pose.
    const reach = new Box3()
    local.forEach(p => reach.union(p))
    if (entry.pivot) {
      const radius = Math.max(...[reach.min.x, reach.max.x].flatMap(x => [reach.min.z, reach.max.z].map(z => Math.hypot(x, z))))
      const [x, y, z] = entry.pivot.origin, y0 = reach.min.y, y1 = reach.max.y
      reach.set(new Vector3(x - radius, y + y0, z - radius), new Vector3(x + radius, y + y1, z + radius)).applyMatrix4(parent)
    } else {
      const end = reach.clone().translate(new Vector3(0, 0, entry.travel))
      reach.union(end).applyMatrix4(parent)
    }
    const obstacles = bodies.filter(b => b.id !== entry.id.split('/')[0] && overlaps(reach, b))
    const envelope = new Box3()
    const pose = (t: number) => {
      if (entry.pivot) {
        translation.makeTranslation(...entry.pivot.origin); rotation.makeRotationY(entry.pivot.angle * t)
        matrix.multiplyMatrices(parent, translation).multiply(rotation)
      } else matrix.multiplyMatrices(parent, translation.makeTranslation(0, 0, entry.travel * t))
    }
    if (entry.pivot) {
      const { origin, angle } = entry.pivot
      let allowed = Math.abs(angle)
      for (let degree = 1; degree <= 90; degree++) {
        pose(degree / 90)
        if (local.some(p => { box.copy(p).applyMatrix4(matrix); return obstacles.some(b => overlaps(box, b)) })) {
          allowed = Math.max(0, degree - 2) * Math.PI / 180; break
        }
      }
      entry.clearForDrawers = allowed >= Math.PI / 2 - 1e-8
      entry.pivot = { origin, angle: Math.sign(angle) * allowed }
    } else if (config.arrangement) {
      // Drawer travel stops before another carcass, including the corner.
      const full = entry.travel, steps = Math.ceil(full / .005)
      for (let i = 1; i <= steps; i++) {
        pose(i / steps)
        if (local.some(p => { box.copy(p).applyMatrix4(matrix); return obstacles.some(b => overlaps(box, b)) })) {
          entry.travel = Math.max(0, (i - 1) / steps * full - .002); break
        }
      }
      entry.blocked = entry.travel < .04
    }
    if (config.arrangement) {
      for (let i = 0; i <= 90; i++) { pose(i / 90); for (const p of local) envelope.union(box.copy(p).applyMatrix4(matrix)) }
      envelopes.set(entry.id, envelope)
      entry.conflicts = []
    }
  }
  // Perpendicular AND opposing runs can cross. Envelopes deliberately err on the side
  // of closing the other section first, rather than colliding moving handles.
  if (config.arrangement) for (let i = 0; i < entries.length; i++) for (let j = i + 1; j < entries.length; j++) {
    const a = entries[i], b = entries[j]
    const arm = (e: DrawerMotionEntry) => layout.sections.find(s => s.id === e.id.split('/')[0])!.arm
    if (arm(a) !== arm(b) && occupiedOverlap(envelopes.get(a.id)!, envelopes.get(b.id)!)) {
      a.conflicts!.push(b.id); b.conflicts!.push(a.id)
    }
  }
}
