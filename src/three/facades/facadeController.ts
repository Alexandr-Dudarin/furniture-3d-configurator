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
    return { target, original, mesh, key: '' }
  })
  const slot = definition.materialSlots?.[spec.materialSlot]
  if (!slot) throw new Error('Facade material slot is missing')
  // Add the procedural surfaces to the existing finish group. Their UVs are
  // already metric; they must not inherit segmented-GLB UV resize bindings.
  const materialDefinition: FurnitureDefinition = { ...definition, materialSlots: {
    ...definition.materialSlots, [spec.materialSlot]: { ...slot, targets: [...slot.targets, MATERIAL] },
  } }
  return {
    materialDefinition,
    update(dimensions: Readonly<Record<string, number>>, style: FacadeStyleId = spec.defaultStyle) {
      if (!spec.styles.includes(style)) throw new Error(`Unsupported facade style: ${style}`)
      for (const panel of panels) {
        const { target, mesh } = panel
        const measure = (axis: 'width' | 'height') => {
          const binding = target[axis]
          return binding.base + ((dimensions[binding.dimension] ?? definition.dimensions[binding.dimension].base) - definition.dimensions[binding.dimension].base) * binding.factor
        }
        const width = measure('width'), height = measure('height'), key = `${style}/${width}/${height}`
        if (key === panel.key) continue
        const source = style === (spec.sourceStyle ?? 'smooth')
        const geometry = source ? new BufferGeometry() : createFacadeGeometry(width, height, target.thickness, style as Exclude<FacadeStyleId, 'original'>, spec, target)
        mesh.geometry.dispose(); mesh.geometry = geometry
        panel.original.forEach(({ child, visible }) => { child.visible = source && visible })
        mesh.visible = !source; panel.key = key
      }
    },
  }
}
export type FacadeController = NonNullable<ReturnType<typeof createFacadeController>>
