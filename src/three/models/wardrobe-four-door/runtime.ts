// Generated production integration; the source config remains the original review definition.
import type { FurnitureDefinition } from '../../furniture/types'
import { WARDROBE_08_CONFIG as source, BOARD_MATERIAL_TARGETS } from './config'
import { catalogue } from './catalog'
import { textureTransforms } from './textureTransforms'

export const definition: FurnitureDefinition = {
  ...catalogue, loadRuntime: undefined,
  resizeRules: source.resizeRules, textureTransforms,
  materialSlots: {
    carcass: { ...catalogue.materialSlots!.carcass, targets: BOARD_MATERIAL_TARGETS.carcass },
    fronts: { ...catalogue.materialSlots!.fronts, targets: BOARD_MATERIAL_TARGETS.fronts },
    ...source.materialSlots,
    hardware: { ...source.materialSlots!.hardware, allowedFinishes: catalogue.materialSlots!.hardware.allowedFinishes },
  },
}
