import type * as THREE from 'three'

import type {
  MaterialFinishId,
  MaterialSlotName,
} from '../furniture/types'

export type MaterialFinishCategory =
  | 'wood'
  | 'stone'
  | 'metal'

type MaterialFinishBase = {
  id: MaterialFinishId
  label: string
  category: MaterialFinishCategory
}

export type TextureMaterialFinish =
  MaterialFinishBase & {
    kind: 'texture'

    maps: {
      color: string
      roughness: string
      normal: string
    }

    color?: THREE.ColorRepresentation
    metalness: number
    roughness: number
    normalScale?: number
  }

export type ProceduralMaterialFinish =
  MaterialFinishBase & {
    kind: 'procedural'

    color: THREE.ColorRepresentation
    metalness: number
    roughness: number
  }

export type MaterialFinishDefinition =
  | TextureMaterialFinish
  | ProceduralMaterialFinish

export type MaterialSelections =
  Record<
    MaterialSlotName,
    MaterialFinishId
  >

