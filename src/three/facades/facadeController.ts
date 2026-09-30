import { BufferGeometry, Matrix4, Mesh, MeshStandardMaterial, Vector3, type Object3D } from 'three'
import type { FurnitureDefinition } from '../furniture/types'
import type { FacadeComposition, FacadeStyleId } from './types'
import { createFacadeGeometry, facadeFlutingProfile } from './facadeGeometry'
import { createSourceFacadeBatch } from './sourceFacadeBatch'
import { createReliefFilter, prepareReliefGeometry, type ReliefProfile } from './reliefFilter'

const MATERIAL = 'Configurator_Facade_Profile'

export function createFacadeController(root: Object3D, definition: FurnitureDefinition, options: { filterRelief?: boolean } = {}) {
  const spec = definition.facades
  if (!spec) return null
  const relief = createReliefFilter()
  const placeholder = new MeshStandardMaterial({ name: MATERIAL })
  const panels = spec.targets.map(target => {
    const node = root.getObjectByName(target.panel)
    if (!node) throw new Error(`Missing facade panel: ${target.panel}`)
    const original = node.children.map(child => ({ child, visible: child.visible }))
    const batch = spec.batchSolidSource ? createSourceFacadeBatch(node, node.children.slice()) : null
    const mesh = new Mesh(new BufferGeometry(), placeholder)
    mesh.name = `${target.panel}__Facade`
    mesh.castShadow = true; mesh.receiveShadow = true; mesh.visible = false
    node.add(mesh)
    return { target, node, original, mesh, batch }
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
  let filterState: { source: boolean; width: number; height: number; profile: ReliefProfile }[] = []
  const refreshRelief = () => {
    if (options.filterRelief === false) return
    panels.forEach(({ node, target, mesh }, i) => {
      const state = filterState[i]
      if (!state) return
      const candidates = state.source ? node.children.filter(child => child !== mesh) : [mesh]
      for (const child of candidates) if (child instanceof Mesh && child.visible &&
        prepareReliefGeometry(child, state.width, state.height, target.thickness, state.source ? 0 : spec.bevel, state.profile)) relief.attach(child)
    })
  }
  return {
    materialDefinition,
    refreshMaterials() { panels.forEach(panel => panel.batch?.refreshMaterials()); refreshRelief() },
    update(dimensions: Readonly<Record<string, number>>, style: FacadeStyleId = spec.defaultStyle) {
      if (!spec.styles.includes(style)) throw new Error(`Unsupported facade style: ${style}`)
      const source = style === (spec.sourceStyle ?? 'smooth')
      const measured = panels.map(({ target, mesh }) => {
        const measure = (axis: 'width' | 'height') => {
          const binding = target[axis]
          return binding.base + ((dimensions[binding.dimension] ?? definition.dimensions[binding.dimension].base) - definition.dimensions[binding.dimension].base) * binding.factor
        }
        return { target, mesh, width: measure('width'), height: measure('height'), composition: undefined as FacadeComposition | undefined }
      })
      if (style === 'herringbone-wide') {
        // update is called inside motion.withClosedPose, after body resizing.
        // Measure in model space so scene placement and camera never affect
        // the design. Include actual gaps and different drawer/door heights.
        root.updateWorldMatrix(true, true)
        const inverse = root.matrixWorld.clone().invert(), matrix = new Matrix4(), center = new Vector3()
        const centers = measured.map(panel => {
          matrix.multiplyMatrices(inverse, panel.mesh.parent!.matrixWorld)
          center.setFromMatrixPosition(matrix)
          return { x: center.x, y: center.y }
        })
        // Asymmetric fronts can declare independent balanced compositions.
        // Groups are explicit asset metadata, never inferred from mesh names.
        const groups = new Map<string | undefined, number[]>()
        measured.forEach((p, i) => {
          const members = groups.get(p.target.compositionGroup) ?? []
          members.push(i); groups.set(p.target.compositionGroup, members)
        })
        for (const members of groups.values()) {
          const left = Math.min(...members.map(i => centers[i].x - measured[i].width / 2))
          const right = Math.max(...members.map(i => centers[i].x + measured[i].width / 2))
          const bottom = Math.min(...members.map(i => centers[i].y - measured[i].height / 2))
          const top = Math.max(...members.map(i => centers[i].y + measured[i].height / 2))
          for (const i of members) measured[i].composition = {
            width: right - left, height: top - bottom,
            x: centers[i].x - (left + right) / 2, y: centers[i].y - (bottom + top) / 2,
          }
        }
      }
      const next = new Map<string, BufferGeometry>(), replacements: BufferGeometry[] = []
      try {
        for (const { target, width, height, composition } of measured) {
          // Imported equal doors may differ by ~1e-16 m after coordinate
          // subtraction. Ignore that noise in the key (1 nm), not in the mesh.
          const key = JSON.stringify([style, Math.round(width * 1e9), Math.round(height * 1e9), target.thickness,
            target.frameWidth ?? spec.frame.width, target.frameField ?? 'recessed', target.flutedClearCenter ?? 0,
            composition && [composition.width, composition.height, composition.x, composition.y].map(n => Math.round(n * 1e9))])
          let geometry = next.get(key) ?? geometries.get(key)
          if (!geometry) geometry = source ? new BufferGeometry() : createFacadeGeometry(width, height, target.thickness, style as Exclude<FacadeStyleId, 'original'>, spec, target, composition)
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
        panel.batch?.refresh(source)
      })
      for (const geometry of retired) if (!retained.has(geometry)) geometry.dispose()
      geometries = next
      const profile = source ? spec.sourceRelief :
        (style === 'fluted' || style === 'fluted-wide' || style === 'fluted-sides') ? facadeFlutingProfile(spec, style) :
        style === 'diagonal' ? spec.diagonal : style === 'diamonds' ? spec.diamonds :
        (style === 'herringbone' || style === 'herringbone-wide') ? spec.herringbone : undefined
      filterState = profile ? measured.map(p => ({ source, width: p.width, height: p.height,
        profile: { width: profile.width, depth: profile.depth, vertical: source || style === 'fluted' || style === 'fluted-wide' || style === 'fluted-sides' },
      })) : []
      refreshRelief()
    },
  }
}
export type FacadeController = NonNullable<ReturnType<typeof createFacadeController>>
