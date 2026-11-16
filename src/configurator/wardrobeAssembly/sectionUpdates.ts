import { SECTION_DIMENSIONS } from './constants'
import {
  automaticLayout,
  fitWardrobeLayoutChange,
  wardrobeCanHaveRod,
  wardrobeManualShelfLimit,
  wardrobeLayoutAdjustments,
} from './layout'
import { normalizeWardrobeSection, normalizeWardrobeDimension } from './normalization'
import type { WardrobeSection } from './types'

export function previewWardrobeSectionUpdate(
  current: WardrobeSection,
  patch: Partial<Omit<WardrobeSection, 'id'>>,
) {
  const changes = { ...patch }
  const height = normalizeWardrobeDimension(changes.height ?? current.height, SECTION_DIMENSIONS.height)
  if (changes.rod && !current.rod && changes.shelves === undefined && wardrobeCanHaveRod(height))
    changes.shelves = Math.min(current.shelves, 1)
  const next = normalizeWardrobeSection({ ...current, ...changes, layout: undefined }, current.id)
  if (current.layout && changes.layout === undefined) {
    next.shelves = Math.min(next.shelves, wardrobeManualShelfLimit(next.height, next.rod, next.drawers))
    const layout = fitWardrobeLayoutChange(current, next)
    if (layout) next.layout = layout
    return next
  }
  return normalizeWardrobeSection({ ...next, layout: changes.layout }, current.id)
}

export function wardrobeHeightNeedsConfirmation(current: WardrobeSection, next: WardrobeSection) {
  return (
    next.height < current.height &&
    ((current.rod && !next.rod) ||
      next.shelves < current.shelves ||
      (next.drawers?.count ?? 0) < (current.drawers?.count ?? 0) ||
      wardrobeLayoutAdjustments(current, next).length > 0)
  )
}

export function wardrobeSectionNeedsConfirmation(current: WardrobeSection, next: WardrobeSection) {
  const drawersChanged = JSON.stringify(current.drawers) !== JSON.stringify(next.drawers)
  const displacedByDrawers =
    drawersChanged &&
    (next.drawers?.count ?? 0) * (next.drawers?.height ?? 0) >
      (current.drawers?.count ?? 0) * (current.drawers?.height ?? 0) &&
    (next.shelves < current.shelves ||
      ((current.shelves > 0 || current.rod) &&
        JSON.stringify(automaticLayout(current)) !== JSON.stringify(automaticLayout(next)) &&
        !current.layout))
  const drawersRemovedForRod =
    !current.rod && next.rod && (next.drawers?.count ?? 0) < (current.drawers?.count ?? 0)
  const drawersRemovedForRow =
    !!current.drawers &&
    !!next.drawers &&
    current.drawers.height !== next.drawers.height &&
    next.drawers.count < current.drawers.count
  const recessForDoors =
    !!next.doors && current.drawers?.placement === 'flush' && next.drawers?.placement === 'recessed'
  return (
    recessForDoors ||
    drawersRemovedForRow ||
    displacedByDrawers ||
    drawersRemovedForRod ||
    wardrobeHeightNeedsConfirmation(current, next) ||
    wardrobeLayoutAdjustments(current, next).length > 0 ||
    (!current.rod && next.rod && next.shelves < current.shelves)
  )
}
