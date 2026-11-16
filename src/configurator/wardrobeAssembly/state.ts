// Public entry point retained for existing UI, scene and saved-configuration callers.
// Internal modules import their dependencies directly, never through this facade.
export {
  SECTION_DIMENSIONS,
  RECESSED_DRAWER_INSET,
  DRAWER_PLACEMENTS,
  MAX_SECTIONS,
  BODY_FINISHES,
  HARDWARE_FINISHES,
  SECTION_PRESETS,
} from './constants'
export type {
  SectionPreset,
  WardrobeFinishSlot,
  WardrobeSection,
  WardrobeAssemblyConfiguration,
  WardrobeAssemblyAction,
} from './types'
export {
  createWardrobeSection,
  createDefaultWardrobe,
  normalizeWardrobeAssembly,
  wardrobeAdjustmentNotice,
} from './normalization'
export {
  previewWardrobeSectionUpdate,
  wardrobeHeightNeedsConfirmation,
  wardrobeSectionNeedsConfirmation,
} from './sectionUpdates'
export {
  wardrobeDrawerPlacementLabel,
  wardrobeDrawerFrontInset,
  wardrobeSectionDrawerInset,
  wardrobeSectionClosedDepth,
  wardrobeFillingLabel,
  wardrobeSectionFinish,
  wardrobeFacadeFinishSource,
  wardrobeBounds,
  wardrobeClosedBounds,
  wardrobeAisleWidth,
} from './selectors'
export { updateWardrobeAssembly } from './actions'
export * from './layout'
