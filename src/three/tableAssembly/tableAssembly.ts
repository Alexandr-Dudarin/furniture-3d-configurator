import { Group, Mesh, MeshStandardMaterial, Vector3 } from 'three'
import { getAssemblyMaterialDefinition, getBaseRuntimeDefinition, getTableBase } from '../../configurator/tableAssembly/catalog'
import type { TableAssemblyConfiguration } from '../../configurator/tableAssembly/state'
import { createFurnitureController } from '../furniture/furnitureController'
import { disposeFurnitureModel } from '../furniture/model'
import { createTabletopGeometry } from './tabletopGeometry'
import { createCornerLegController } from './cornerLegs'
import { createUFrameController } from './uFrames'

// Принимает отдельный GLB основания. Готовые столы и их контроллер не изменяются.
export function createTableAssembly(baseModel: Group, initial: TableAssemblyConfiguration) {
  const base = getTableBase(initial.baseId)
  const attachment = baseModel.getObjectByName(base.attachment)
  if (!attachment) throw new Error(`Missing attachment: ${base.attachment}`)
  const controller = createFurnitureController(baseModel, getBaseRuntimeDefinition(base))
  const updateLegs = createCornerLegController(baseModel, base)
  const updateFrames = createUFrameController(baseModel, base)
  const group = new Group()
  group.name = 'CustomTable_Root'
  const top = new Mesh(createTabletopGeometry(initial), ['Top_Surface', 'Top_Bottom', 'Top_Edge'].map((name) => {
    const material = new MeshStandardMaterial({ color: 0xd5c3a6, roughness: 0.65 })
    material.name = name
    return material
  }))
  top.name = 'TableTop_Module'
  top.castShadow = top.receiveShadow = true
  group.add(baseModel, top)
  let previous = initial
  let disposed = false
  const update = (next: TableAssemblyConfiguration) => {
    if (disposed) return
    if (next.baseId !== base.id) throw new Error('A different base requires a new assembly')
    if (next.shape !== previous.shape || next.length !== previous.length || next.width !== previous.width || next.thickness !== previous.thickness) {
      const geometry = createTabletopGeometry(next)
      top.geometry.dispose()
      top.geometry = geometry
    }
    controller.setDimensions({ baseHeight: next.baseHeight })
    updateLegs?.(next)
    updateFrames?.(next)
    group.updateMatrixWorld(true)
    top.position.copy(group.worldToLocal(attachment.getWorldPosition(new Vector3())))
    previous = next
  }
  update(initial)
  return {
    group, top, baseModel, update,
    materialDefinition: getAssemblyMaterialDefinition(base),
    // Верх и торец получают UV из физической геометрии; повторная компенсация не нужна.
    refreshTextures: controller.refreshTextures,
    dispose: () => {
      if (disposed) return
      disposed = true
      disposeFurnitureModel(group)
    },
  }
}

export type TableAssembly = ReturnType<typeof createTableAssembly>
