import { Group, Mesh, type BufferGeometry, type MeshStandardMaterial } from 'three'
import {
  straightWardrobeBounds,
  type WardrobePlacement,
} from '../../configurator/wardrobeAssembly/arrangement'
import type { WardrobeAssemblyConfiguration } from '../../configurator/wardrobeAssembly/state'
import { RELIEF_ATTRIBUTE } from '../facades/reliefFilter'
import { planWardrobeParts } from './planWardrobeParts'
import type { DrawerMotionEntry } from './wardrobeDrawerMotion'
import type { Part, PartSlot } from './parts'

type MaterialFor = (sectionId: string, slot: PartSlot) => MeshStandardMaterial

// Own scene nodes, not their shared geometries or materials. Stable names keep
// the same meshes and motion groups alive when their dimensions/parents change.
export function createAssemblyObjects(
  group: Group,
  materialFor: MaterialFor,
  attachRelief: (mesh: Mesh) => void,
) {
  const meshes = new Map<string, Mesh<BufferGeometry, MeshStandardMaterial>>()
  const drawerGroups = new Map<string, Group>()
  const sectionGroups = new Map<string, Group>()
  return {
    update(
      configuration: WardrobeAssemblyConfiguration,
      placements: WardrobePlacement,
      getGeometry: (part: Part) => BufferGeometry,
      addVolume: (id: string, mesh: Mesh, parent: Group) => void,
    ) {
      // Keep existing part coordinates and IDs; only the owning section rotates.
      // Straight assemblies retain their original flat hierarchy.
      const row = straightWardrobeBounds(configuration)
      let oldLeft = -row.width / 2
      for (const placement of placements.sections) {
        if (configuration.arrangement) {
          let parent = sectionGroups.get(placement.id)
          if (!parent) {
            parent = new Group()
            parent.name = `Placement/${placement.id}`
            sectionGroups.set(placement.id, parent)
            group.add(parent)
          }
          const oldX = oldLeft + placement.width / 2,
            oldZ = (placement.depth - row.depth) / 2
          const c = Math.cos(placement.yaw),
            s = Math.sin(placement.yaw)
          parent.position.set(placement.x - oldX * c - oldZ * s, 0, placement.z + oldX * s - oldZ * c)
          parent.rotation.y = placement.yaw
          parent.updateMatrix()
        }
        oldLeft += placement.width
      }
      const keep = new Set<string>()
      const moving = new Map<string, DrawerMotionEntry>()
      for (const part of planWardrobeParts(configuration)) {
        const geometry = getGeometry(part)
        let mesh = meshes.get(part.name)
        if (!mesh) {
          mesh = new Mesh(geometry, materialFor(part.sectionId, part.slot))
          mesh.name = part.name
          mesh.castShadow = mesh.receiveShadow = true
          meshes.set(part.name, mesh)
        }
        let parent = configuration.arrangement ? (sectionGroups.get(part.sectionId) ?? group) : group
        const motionId = part.doorId ?? part.drawerId
        if (motionId) {
          let drawer = drawerGroups.get(motionId)
          if (!drawer) {
            drawer = new Group()
            drawer.name = motionId
            drawerGroups.set(motionId, drawer)
          }
          if (drawer.parent !== parent) parent.add(drawer)
          parent = drawer
          moving.set(motionId, { id: motionId, node: drawer, travel: part.travel ?? 0, pivot: part.pivot })
        }
        if (mesh.parent !== parent) parent.add(mesh)
        mesh.userData.materialSlot = part.slot
        mesh.userData.sectionId = part.sectionId
        mesh.geometry = geometry
        mesh.material = materialFor(part.sectionId, part.slot)
        if (geometry.hasAttribute(RELIEF_ATTRIBUTE)) attachRelief(mesh)
        mesh.position.set(...part.position)
        mesh.rotation.set(
          part.axis === 'z' ? Math.PI / 2 : 0,
          part.rotationY ?? 0,
          part.rotationZ ?? (part.axis === 'x' ? Math.PI / 2 : 0),
        )
        mesh.updateMatrix()
        addVolume(motionId ?? part.sectionId, mesh, parent)
        keep.add(part.name)
      }
      for (const [name, mesh] of meshes)
        if (!keep.has(name)) {
          mesh.removeFromParent()
          meshes.delete(name)
        }
      for (const [id, drawer] of drawerGroups)
        if (!moving.has(id)) {
          drawer.removeFromParent()
          drawerGroups.delete(id)
        }
      for (const [id, parent] of sectionGroups)
        if (!configuration.arrangement || !configuration.sections.some((s) => s.id === id)) {
          parent.removeFromParent()
          sectionGroups.delete(id)
        }
      group.updateMatrixWorld(true)
      return [...moving.values()]
    },
    applyMaterials() {
      for (const mesh of meshes.values()) {
        mesh.material = materialFor(mesh.userData.sectionId, mesh.userData.materialSlot)
        if (mesh.geometry.hasAttribute(RELIEF_ATTRIBUTE)) attachRelief(mesh)
      }
    },
    dispose() {
      drawerGroups.clear()
      sectionGroups.clear()
      meshes.clear()
      group.clear()
    },
  }
}
