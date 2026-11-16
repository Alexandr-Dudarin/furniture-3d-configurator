import { wardrobePlacement, placementPolygon, wardrobeArmRanges } from './arrangement'
import { RECESSED_DRAWER_INSET, DRAWER_PLACEMENTS } from './constants'
import { DOOR_BODY_GAP, DOOR_THICKNESS, wardrobeDoorHandleProjection } from './doors'
import { getWardrobeDrawerHandle } from './drawerHandles'
import type { WardrobeDrawers } from './layout'
import type { WardrobeAssemblyConfiguration, WardrobeSection, WardrobeFinishSlot } from './types'

export function wardrobeDrawerPlacementLabel(drawers: WardrobeDrawers) {
  return DRAWER_PLACEMENTS.find((option) => option.value === (drawers.placement ?? 'recessed'))!.label
}

export function wardrobeDrawerFrontInset(drawers?: WardrobeDrawers) {
  return drawers?.placement === 'flush' ? 0 : RECESSED_DRAWER_INSET
}

export function wardrobeSectionDrawerInset(section: WardrobeSection) {
  const inset = wardrobeDrawerFrontInset(section.drawers)
  return section.doors && section.drawers
    ? Math.max(RECESSED_DRAWER_INSET, getWardrobeDrawerHandle(section.drawers.handle).projection + 0.004)
    : inset
}

export function wardrobeSectionClosedDepth(section: WardrobeSection) {
  if (section.doors)
    return Number(
      (
        section.depth +
        DOOR_BODY_GAP +
        DOOR_THICKNESS +
        wardrobeDoorHandleProjection(section.doors.handle)
      ).toFixed(8),
    )
  const projection = section.drawers
    ? Math.max(
        0,
        getWardrobeDrawerHandle(section.drawers.handle).projection -
          wardrobeDrawerFrontInset(section.drawers),
      )
    : 0
  return Number((section.depth + projection).toFixed(8))
}

export function wardrobeFillingLabel(section: Pick<WardrobeSection, 'shelves' | 'rod' | 'drawers'>): string {
  const { shelves, rod } = section
  if (section.drawers) return `${wardrobeFillingLabel({ shelves, rod })} · ящиков: ${section.drawers.count}`
  if (rod)
    return shelves === 2
      ? 'Штанга · верхняя и нижняя полки'
      : shelves === 1
        ? 'Штанга · верхняя полка'
        : 'Штанга · без полок'
  return shelves === 0
    ? 'Без полок'
    : `${shelves} ${shelves === 1 ? 'полка' : shelves < 5 ? 'полки' : 'полок'}`
}

export function wardrobeSectionFinish(
  config: WardrobeAssemblyConfiguration,
  section: WardrobeSection,
  slot: WardrobeFinishSlot,
) {
  if (slot === 'facadeFinish')
    return section.facadeFinish ?? config.facadeFinish ?? section.bodyFinish ?? config.bodyFinish
  return section[slot] ?? config[slot]
}

export function wardrobeFacadeFinishSource(config: WardrobeAssemblyConfiguration, section: WardrobeSection) {
  return section.facadeFinish
    ? 'свой материал фасадов секции'
    : config.facadeFinish
      ? 'общий материал фасадов'
      : 'как у корпуса секции'
}

export function wardrobeBounds(config: WardrobeAssemblyConfiguration) {
  return wardrobePlacement(config).bounds
}

export function wardrobeClosedBounds(config: WardrobeAssemblyConfiguration) {
  if (!config.arrangement)
    return { ...wardrobeBounds(config), depth: Math.max(...config.sections.map(wardrobeSectionClosedDepth)) }
  const layout = wardrobePlacement(config)
  const points = [
    ...layout.corners.flatMap((p) => p.polygon),
    ...layout.sections.flatMap((p, i) => placementPolygon(p, wardrobeSectionClosedDepth(config.sections[i]))),
  ]
  return {
    width: Number((Math.max(...points.map((p) => p[0])) - Math.min(...points.map((p) => p[0]))).toFixed(8)),
    height: layout.bounds.height,
    depth: Number((Math.max(...points.map((p) => p[1])) - Math.min(...points.map((p) => p[1]))).toFixed(8)),
  }
}

// Conservative clear width between CLOSED side runs, including projecting
// handles. An open door or drawer occupies part of this space; no egress claim.
export function wardrobeAisleWidth(config: WardrobeAssemblyConfiguration): number | null {
  if (config.arrangement?.kind !== 'u') return null
  const ranges = wardrobeArmRanges(config)
  const depth = (arm: number) =>
    Math.max(...config.sections.slice(ranges[arm].start, ranges[arm].end).map(wardrobeSectionClosedDepth))
  return Number((wardrobeBounds(config).width - depth(1) - depth(2)).toFixed(8))
}
