import type { WardrobeAssemblyAction } from '../../configurator/wardrobeAssembly/state'

export type WardrobeSectionPatch = Extract<
  WardrobeAssemblyAction,
  { type: 'update-section' }
>['patch']
export type UpdateWardrobeSection = (patch: WardrobeSectionPatch) => void
