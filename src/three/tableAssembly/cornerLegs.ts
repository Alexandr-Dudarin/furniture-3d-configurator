import { Mesh, type Group } from 'three'
import type { TableBaseDefinition } from '../../configurator/tableAssembly/catalog'
import type { TableAssemblyConfiguration } from '../../configurator/tableAssembly/state'

// Прямые ножки First Table: удлиняется только средняя часть, торцевые фаски сохранены.
export function createCornerLegController(model: Group, base: TableBaseDefinition) {
  const layout = base.cornerLegs
  if (!layout) return null
  const legs = layout.targets.map((name) => {
    const mesh = model.getObjectByName(name)
    if (!(mesh instanceof Mesh)) throw new Error(`Missing corner leg mesh: ${name}`)
    const geometry = mesh.geometry
    geometry.computeBoundingBox()
    const bounds = geometry.boundingBox!
    return {
      mesh, original: geometry.getAttribute('position').clone(),
      bottom: bounds.min.y, height: bounds.max.y - bounds.min.y,
      sideX: Math.sign(mesh.position.x), sideZ: Math.sign(mesh.position.z),
    }
  })
  let previousHeight = Number.NaN
  return (config: TableAssemblyConfiguration) => {
    const inset = layout.insetByShape[config.shape]
    if (inset === undefined) throw new Error(`Unsupported corner-leg shape: ${config.shape}`)
    for (const { mesh, original, bottom, height, sideX, sideZ } of legs) {
      mesh.position.x = sideX * (config.length / 2 - inset)
      mesh.position.z = sideZ * (config.width / 2 - inset)
      if (config.baseHeight === previousHeight) continue
      const position = mesh.geometry.getAttribute('position')
      const delta = config.baseHeight - base.height.base
      for (let i = 0; i < original.count; i++) {
        const y = original.getY(i)
        const weight = Math.min(1, Math.max(0, (y - bottom - layout.endBand) / (height - 2 * layout.endBand)))
        position.setY(i, y + delta * weight)
      }
      position.needsUpdate = true
      // Торцевые полосы только переносятся, а центральные грани остаются вертикальными:
      // исходные нормали и тангенты остаются корректными.
      mesh.geometry.computeBoundingBox()
      mesh.geometry.computeBoundingSphere()
    }
    previousHeight = config.baseHeight
  }
}
