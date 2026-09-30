import { BufferGeometry, Matrix4, Mesh, MeshStandardMaterial, Raycaster, Vector3, type Object3D } from 'three'
import type { FurnitureDefinition } from '../furniture/types'
import type { CatalogHandle } from '../../configurator/handles'
import { createHandleGeometry } from './handleGeometry'

const MATERIAL = 'Configurator_Handle'
export function createCatalogHandleController(root: Object3D, definition: FurnitureDefinition) {
  if (!definition.handles || !definition.facades) return null
  const placeholder = new MeshStandardMaterial({ name: MATERIAL })
  const entries = definition.handles.targets.map(target => {
    const spec = definition.facades!.targets.find(item => item.panel === target.panel)
    const node = root.getObjectByName(target.panel)
    const original = target.original ? root.getObjectByName(target.original) : undefined
    if (!spec || !node || (target.original && !original)) throw new Error(`Missing handle mount: ${target.panel}`)
    const mesh = new Mesh(new BufferGeometry(), placeholder)
    mesh.name = `${target.panel}__Handle`; mesh.castShadow = mesh.receiveShadow = true; mesh.visible = false
    // Created AFTER facade controller: handles are not original panel tiles.
    node.add(mesh)
    return { target, spec, node, original, originalVisible: original?.visible ?? false, mesh }
  })
  const slot = definition.materialSlots!.hardware
  const materialDefinition: FurnitureDefinition = { ...definition, materialSlots: {
    ...definition.materialSlots, hardware: { ...slot, targets: [...slot.targets, MATERIAL] },
  } }
  let geometries = new Map<string, BufferGeometry>()
  return { materialDefinition,
    update(dimensions: Readonly<Record<string, number>>, selected: Partial<Record<'doors' | 'drawers', CatalogHandle>> = {}) {
      const next = new Map<string, BufferGeometry>(), retired = new Set(entries.map(e => e.mesh.geometry))
      root.updateWorldMatrix(true, true)
      const inverse = root.matrixWorld.clone().invert()
      for (const { mesh, node, spec, target, original, originalVisible } of entries) {
        const style = selected[target.kind === 'door' ? 'doors' : 'drawers'] ?? 'original'
        if (original) original.visible = style === 'original' && originalVisible
        mesh.visible = style !== 'original' && style !== 'none'
        if (!mesh.visible) { mesh.geometry = new BufferGeometry(); continue }
        const measure = (axis: 'width' | 'height') => spec[axis].base + ((dimensions[spec[axis].dimension] ?? definition.dimensions[spec[axis].dimension].base) - definition.dimensions[spec[axis].dimension].base) * spec[axis].factor
        const width = measure('width'), height = measure('height'), door = target.kind === 'door'
        const length = style === 'long-bar' ? Math.min(door ? .600 : .320, (door ? height : width) - .040)
          : style === 'profile' ? (door ? .330 : .220) : style === 'edge-pull' ? (door ? .170 : .110) : undefined
        const faceScale = door && (style === 'knob' || style === 'semicircle') ? 1.75 : 1
        const wrap = style === 'profile'
        const key = `${style}:${length ?? ''}:${wrap ? spec.thickness : ''}:${faceScale}`
        let geometry = next.get(key) ?? geometries.get(key)
        if (!geometry) geometry = createHandleGeometry(style as Exclude<CatalogHandle, 'original' | 'none'>, length, spec.thickness, faceScale)
        next.set(key, geometry); mesh.geometry = geometry
        if (door) {
          const side = target.side!
          const center = new Vector3().setFromMatrixPosition(new Matrix4().multiplyMatrices(inverse, node.matrixWorld))
          const halfLength = geometry.boundingBox!.getSize(new Vector3()).x / 2
          const margin = Math.min(height / 2, halfLength + .025)
          // Reachable floor height, clamped to this leaf; neighbouring leaves align.
          const y = Math.max(-height / 2 + margin, Math.min(height / 2 - margin, 1.05 - center.y))
          const inset = wrap ? 0 : style === 'semicircle' || style === 'edge-pull' ? .020 : style === 'knob' ? .050 : .026
          mesh.position.set(side * (width / 2 - inset), y, spec.thickness / 2)
          mesh.rotation.set(0, 0, -side * Math.PI / 2)
        } else {
          mesh.position.set(0, height / 2 - (wrap ? 0 : style === 'edge-pull' ? .035 : style === 'semicircle' ? .030 : .018), spec.thickness / 2)
          mesh.rotation.set(0, 0, 0)
        }
        if ((door && style === 'knob') || (!door && style === 'semicircle') || style === 'edge-pull') {
          // Face-mounted hardware follows the real surface, including a
          // recessed frame field. Sample the centre of the mounting root.
          const surfaces: Object3D[] = []
          for (const child of node.children) if (child !== mesh) child.traverseVisible(part => {
            if (part instanceof Mesh) surfaces.push(part)
          })
          const mount = new Vector3(0, style === 'edge-pull' ? -.006 : style === 'semicircle' ? -.0015 : 0, 0).applyEuler(mesh.rotation).add(mesh.position)
          const origin = node.localToWorld(new Vector3(mount.x, mount.y, spec.thickness / 2 + .01))
          const direction = new Vector3(0, 0, -1).transformDirection(node.matrixWorld)
          const hit = new Raycaster(origin, direction, 0, spec.thickness + .02).intersectObjects(surfaces, false)[0]
          if (hit) mesh.position.z = node.worldToLocal(hit.point).z
        }
      }
      const retained = new Set(entries.map(e => e.mesh.geometry))
      for (const geometry of retired) if (!retained.has(geometry)) geometry.dispose()
      geometries = next
      // Live geometries/materials are owned by disposeFurnitureModel.
      root.updateMatrixWorld(true)
    },
  }
}
export type CatalogHandleController = NonNullable<ReturnType<typeof createCatalogHandleController>>
