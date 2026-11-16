import { Group } from 'three'
import { wardrobePlacement } from '../../configurator/wardrobeAssembly/arrangement'
import type { WardrobeAssemblyConfiguration } from '../../configurator/wardrobeAssembly/state'
import type { MotionPartState } from '../../configurator/furnitureMotionStore'
import type { createFinishMaterial } from '../materials/createMaterial'
import { createReliefFilter } from '../facades/reliefFilter'
import { createAssemblyObjects } from './assemblyObjects'
import { createWardrobeCameraObstacles } from './cameraObstacles'
import { createGeometryResources } from './geometryResources'
import { createMaterialResources } from './materialResources'
import { wardrobeGeometryKey } from './planWardrobeParts'
import { limitDoorSwing } from './doorClearance'
import { createWardrobeDrawerMotion } from './wardrobeDrawerMotion'

// Retain the existing entry point for the scene adapter and geometry callers.
export { planWardrobeParts } from './planWardrobeParts'
export type { Part } from './parts'

export function createWardrobeAssembly(
  initial: WardrobeAssemblyConfiguration,
  options: {
    maxAnisotropy?: number
    createMaterial?: typeof createFinishMaterial
    onChange?: () => void
    onMotionChange?: (parts: MotionPartState[]) => void
  } = {},
) {
  const group = new Group()
  group.name = 'WardrobeAssembly_Root'
  const motion = createWardrobeDrawerMotion(group, (parts) => {
    options.onMotionChange?.(parts)
    options.onChange?.()
  })
  const relief = createReliefFilter()
  const materials = createMaterialResources(options)
  const geometries = createGeometryResources(materials.fallback.body)
  const obstacles = createWardrobeCameraObstacles(group)
  const objects = createAssemblyObjects(group, materials.get, relief.attach)
  let disposed = false
  let previousGeometryKey = ''

  const update = (configuration: WardrobeAssemblyConfiguration) => {
    const geometryKey = wardrobeGeometryKey(configuration)
    if (disposed || geometryKey === previousGeometryKey) return
    const placements = wardrobePlacement(configuration)
    const geometryUpdate = geometries.beginUpdate()
    const obstacleUpdate = obstacles.beginUpdate()
    const entries = objects.update(configuration, placements, geometryUpdate.get, obstacleUpdate.add)
    limitDoorSwing(entries, configuration)
    motion.sync(entries)
    // Retire geometry only after meshes have rebound and motion is synchronized.
    geometryUpdate.commit()
    obstacleUpdate.commit(placements.corners)
    previousGeometryKey = geometryKey
    group.updateMatrixWorld(true)
    options.onChange?.()
  }
  const setFinishes = (configuration: WardrobeAssemblyConfiguration) =>
    materials.setFinishes(configuration, objects.applyMaterials)

  update(initial)
  return {
    group,
    motion,
    update,
    setFinishes,
    getCameraObstacles: obstacles.getBoxes,
    dispose() {
      if (disposed) return
      disposed = true
      motion.dispose()
      relief.dispose()
      geometries.dispose()
      materials.dispose()
      objects.dispose()
      obstacles.dispose()
    },
  }
}
export type WardrobeAssembly = ReturnType<typeof createWardrobeAssembly>
