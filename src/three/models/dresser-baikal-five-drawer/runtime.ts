// Generated production integration; keep original model review config reproducible.
import type { FurnitureDefinition } from '../../furniture/types'
import { DRESSER_14_CONFIG as source, MATERIAL_TARGETS } from './config'
import { catalogue } from './catalog'
import { textureTransforms } from './textureTransforms'

export const definition: FurnitureDefinition = {
  ...catalogue, loadRuntime: undefined,
  resizeRules: source.resizeRules, textureTransforms,
  materialSlots: {
    carcass: { ...catalogue.materialSlots!.carcass, targets: MATERIAL_TARGETS.carcass },
    fronts: { ...catalogue.materialSlots!.fronts, targets: MATERIAL_TARGETS.fronts },
    hardware: { ...catalogue.materialSlots!.hardware, targets: MATERIAL_TARGETS.hardware },
  },
}
