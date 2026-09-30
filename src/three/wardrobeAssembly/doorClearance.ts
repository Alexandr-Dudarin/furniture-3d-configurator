import { Box3, Matrix4, Vector3, type Group, type Mesh } from 'three'
import { wardrobeBounds, type WardrobeAssemblyConfiguration } from '../../configurator/wardrobeAssembly/state'
import type { DrawerMotionEntry } from './wardrobeDrawerMotion'

// Conservative swept bounds against OTHER carcasses. Evaluate only on edits,
// never per frame. The panels/handles have their own bounds, so an empty gap
// between the leaf and its handle is not treated as a solid rectangular block.
export function limitDoorSwing(entries: DrawerMotionEntry[], config: WardrobeAssemblyConfiguration) {
  const bounds = wardrobeBounds(config)
  let left = -bounds.width / 2
  const bodies = config.sections.map(s => {
    const box = new Box3(new Vector3(left, 0, -bounds.depth / 2), new Vector3(left + s.width, s.height, s.depth - bounds.depth / 2))
    left += s.width
    return { id: s.id, box }
  })
  const rotation = new Matrix4(), translation = new Matrix4(), matrix = new Matrix4(), box = new Box3(), overlap = new Box3(), size = new Vector3()
  for (const entry of entries) {
    if (!entry.pivot) continue
    const { origin, angle } = entry.pivot
    translation.makeTranslation(...origin)
    const obstacles = bodies.filter(b => b.id !== entry.id.split('/')[0])
    const meshes = (entry.node as Group).children as Mesh[]
    const local = meshes.map(mesh => mesh.geometry.boundingBox!.clone().applyMatrix4(mesh.matrix))
    let allowed = Math.abs(angle)
    for (let degree = 1; degree <= 90; degree++) {
      const radians = Math.min(degree * Math.PI / 180, Math.abs(angle)) * Math.sign(angle)
      rotation.makeRotationY(radians); matrix.multiplyMatrices(translation, rotation)
      const collision = local.some(part => {
        box.copy(part).applyMatrix4(matrix)
        return obstacles.some(b => {
          overlap.copy(box).intersect(b.box)
          if (overlap.isEmpty()) return false
          overlap.getSize(size)
          return Math.min(size.x, size.y, size.z) > .0001
        })
      })
      if (collision) { allowed = Math.max(0, degree - 2) * Math.PI / 180; break }
    }
    entry.clearForDrawers = allowed >= Math.PI / 2 - 1e-8
    entry.pivot = { origin, angle: Math.sign(angle) * allowed }
  }
}
