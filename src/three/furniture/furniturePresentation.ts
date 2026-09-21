import type { Object3D } from 'three'
import type { FurnitureDefinition } from './types'

export type FurnitureView = 'exterior' | 'interior'

export function createFurniturePresentation(root: Object3D, definition: FurnitureDefinition) {
  const targets = (definition.interiorView?.hiddenNodes ?? []).map(name => {
    const object = root.getObjectByName(name)
    if (!object) throw new Error(`[${definition.id}] Interior view target "${name}" is missing.`)
    return { object, visible: object.visible }
  })
  return {
    setView(view: FurnitureView) {
      for (const target of targets) target.object.visible = view === 'interior' ? false : target.visible
    },
    dispose() {
      for (const target of targets) target.object.visible = target.visible
    },
  }
}
