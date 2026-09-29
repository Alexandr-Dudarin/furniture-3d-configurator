import { WARDROBE_15_CONFIG as source } from './config'
import { catalogue } from './catalog'
export const definition = { ...source, handles: catalogue.handles, materialSlots: { ...source.materialSlots, hardware: { ...source.materialSlots!.hardware, allowedFinishes: catalogue.materialSlots!.hardware.allowedFinishes } } }
