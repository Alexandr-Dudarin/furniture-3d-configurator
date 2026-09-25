import { BufferGeometry, Mesh, MeshStandardMaterial, type Object3D } from 'three'
import type { FurnitureDefinition } from '../furniture/types'
import type { FacadeStyleId } from './types'
import { createFacadeGeometry } from './facadeGeometry'

const MATERIAL = 'Configurator_Facade_Profile'

export function createFacadeController(root: Object3D, definition: FurnitureDefinition) {
  const spec = definition.facades
  if (!spec) return null
  const placeholder = new MeshStandardMaterial({ name: MATERIAL })
  const panels = spec.targets.map(target => {
    const node = root.getObjectByName(target.panel)
    if (!node) throw new Error(`Missing facade panel: ${target.panel}`)
    const original = node.children.map(child => ({ child, visible: child.visible }))
    const mesh = new Mesh(new BufferGeometry(), placeholder)
    mesh.name = `${target.panel}__Facade`
    mesh.castShadow = true; mesh.receiveShadow = true; mesh.visible = false
    node.add(mesh)
    return { target, original, mesh }
  })
  const slot = definition.materialSlots?.[spec.materialSlot]
  if (!slot) throw new Error('Facade material slot is missing')
  // Add the procedural surfaces to the existing finish group. Their UVs are
  // already metric; they must not inherit segmented-GLB UV resize bindings.
  const materialDefinition: FurnitureDefinition = { ...definition, materialSlots: {
    ...definition.materialSlots, [spec.materialSlot]: { ...slot, targets: [...slot.targets, MATERIAL] },
  } }
  // Only the current set is retained. Equal panels share immutable geometry,
  // while each mesh keeps its own material, visibility and moving parent.
  // disposeFurnitureModel already disposes shared geometries once via a Set.
  let geometries = new Map<string, BufferGeometry>()
  return {
    materialDefinition,
    update(dimensions: Readonly<Record<string, number>>, style: FacadeStyleId = spec.defaultStyle) {
      if (!spec.styles.includes(style)) throw new Error(`Unsupported facade style: ${style}`)
      const source = style === (spec.sourceStyle ?? 'smooth')
      const next = new Map<string, BufferGeometry>(), replacements: BufferGeometry[] = []
      try {
        for (const { target } of panels) {
          const measure = (axis: 'width' | 'height') => {
            const binding = target[axis]
            return binding.base + ((dimensions[binding.dimension] ?? definition.dimensions[binding.dimension].base) - definition.dimensions[binding.dimension].base) * binding.factor
          }
          const width = measure('width'), height = measure('height')
          // Imported equal doors may differ by ~1e-16 m after coordinate
          // subtraction. Ignore that noise in the key (1 nm), not in the mesh.
          const key = JSON.stringify([style, Math.round(width * 1e9), Math.round(height * 1e9), target.thickness,
            target.frameWidth ?? spec.frame.width, target.frameField ?? 'recessed', target.flutedClearCenter ?? 0])
          let geometry = next.get(key) ?? geometries.get(key)
          if (!geometry) geometry = source ? new BufferGeometry() : createFacadeGeometry(width, height, target.thickness, style as Exclude<FacadeStyleId, 'original'>, spec, target)
          next.set(key, geometry); replacements.push(geometry)
        }
      } catch (error) {
        for (const [key, geometry] of next) if (!geometries.has(key)) geometry.dispose()
        throw error
      }
      const retired = new Set(panels.map(panel => panel.mesh.geometry)), retained = new Set(next.values())
      panels.forEach((panel, index) => {
        panel.mesh.geometry = replacements[index]
        panel.original.forEach(({ child, visible }) => { child.visible = source && visible })
        panel.mesh.visible = !source
      })
      for (const geometry of retired) if (!retained.has(geometry)) geometry.dispose()
      geometries = next
    },
  }
}
export type FacadeController = NonNullable<ReturnType<typeof createFacadeController>>
