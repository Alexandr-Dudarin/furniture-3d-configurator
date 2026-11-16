import type { WardrobeArm, WardrobeArrangement, WardrobeCorner } from './arrangement'
import type { WardrobeDoors } from './doors'
import type { WardrobeDrawers, WardrobeLayout } from './layout'
import type { SECTION_PRESETS } from './constants'

export type SectionPreset = (typeof SECTION_PRESETS)[number]['id']

export type WardrobeFinishSlot = 'bodyFinish' | 'facadeFinish' | 'hardwareFinish'

// Omitted finish = live inheritance, not a copy of the assembly's current value.
export type WardrobeSection = {
  id: string
  width: number
  height: number
  depth: number
  shelves: number
  rod: boolean
  bodyFinish?: string
  facadeFinish?: string
  hardwareFinish?: string
  layout?: WardrobeLayout
  drawers?: WardrobeDrawers
  doors?: WardrobeDoors
}

export type WardrobeAssemblyConfiguration = {
  arrangement?: WardrobeArrangement
  sections: WardrobeSection[]
  bodyFinish: string
  facadeFinish?: string
  hardwareFinish: string
}

export type WardrobeAssemblyAction =
  | { type: 'add-section'; preset: SectionPreset; arm?: WardrobeArm }
  | { type: 'set-arrangement'; kind: 'straight' | 'l' | 'u'; side?: 'left' | 'right' }
  | { type: 'set-arm-count'; count: number; arm?: 0 | 1 }
  | {
      type: 'update-corner'
      cornerId?: 'corner-1' | 'corner-2'
      patch: Partial<WardrobeCorner>
      confirmFillingChange?: boolean
    }
  | { type: 'remove-section'; id: string }
  | { type: 'move-section'; id: string; direction: -1 | 1 }
  | {
      type: 'update-section'
      id: string
      patch: Partial<Omit<WardrobeSection, 'id'>>
      confirmHeightChange?: boolean
      confirmFillingChange?: boolean
    }
  | { type: 'set-wardrobe-finish'; slot: 'bodyFinish' | 'hardwareFinish'; finishId: string }
  | { type: 'set-wardrobe-finish'; slot: 'facadeFinish'; finishId: string | null }
  | { type: 'set-layout-mode'; id: string; manual: boolean }
  | { type: 'move-shelf'; id: string; index: number; height: number }
  | { type: 'move-rod'; id: string; height: number }
  | { type: 'set-section-finish'; id: string; slot: WardrobeFinishSlot; finishId: string | null }
