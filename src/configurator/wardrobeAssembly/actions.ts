import {
  wardrobeSectionCount,
  wardrobeSectionLimit,
  wardrobeArmRanges,
  wardrobeArmAt,
  MAX_CORNER_SECTIONS,
} from './arrangement'
import { SECTION_PRESETS, MAX_SECTIONS, BODY_FINISHES, HARDWARE_FINISHES } from './constants'
import {
  MIN_ROD_SECTION_HEIGHT,
  fitWardrobeLayout,
  isValidWardrobeLayout,
  type WardrobeLayout,
} from './layout'
import {
  createWardrobeSection,
  normalizeWardrobeSection,
  normalizeCorner,
  normalizeArrangement,
} from './normalization'
import { previewWardrobeSectionUpdate, wardrobeSectionNeedsConfirmation } from './sectionUpdates'
import type { WardrobeAssemblyAction, WardrobeAssemblyConfiguration } from './types'

export function updateWardrobeAssembly(
  current: WardrobeAssemblyConfiguration,
  action: WardrobeAssemblyAction,
) {
  let next = current
  if (action.type === 'set-arrangement') {
    if (action.kind === 'straight') {
      if (current.sections.length > MAX_SECTIONS) return current
      next = { ...current }
      delete next.arrangement
    } else if (
      current.sections.length >= (action.kind === 'u' ? 3 : 2) &&
      current.sections.length <= MAX_CORNER_SECTIONS - (action.kind === 'u' ? 2 : 1)
    ) {
      const previous = current.arrangement
      next = {
        ...current,
        arrangement: normalizeArrangement(
          {
            ...previous,
            kind: action.kind,
            side: action.side ?? previous?.side,
            corner: previous?.corner ?? { height: current.sections[0].height, shelves: 4 },
            secondCorner:
              previous?.kind === 'u'
                ? previous.secondCorner
                : (previous?.corner ?? { height: current.sections.at(-1)!.height, shelves: 4 }),
          },
          current.sections,
        ),
      }
    }
  } else if (action.type === 'set-arm-count' && current.arrangement && Number.isFinite(action.count)) {
    const a = current.arrangement
    if (a.kind === 'u') {
      const oldB = a.secondSplit - a.split
      const count = Math.max(
        1,
        Math.min(current.sections.length - (action.arm === 1 ? a.split : oldB) - 1, Math.round(action.count)),
      )
      next = {
        ...current,
        arrangement: {
          ...a,
          split: action.arm === 1 ? a.split : count,
          secondSplit: action.arm === 1 ? a.split + count : count + oldB,
        },
      }
    } else
      next = {
        ...current,
        arrangement: normalizeArrangement({ ...a, split: action.count }, current.sections),
      }
  } else if (action.type === 'update-corner' && current.arrangement) {
    const a = current.arrangement,
      second = action.cornerId === 'corner-2'
    if (second && a.kind !== 'u') return current
    const old = second && a.kind === 'u' ? a.secondCorner : a.corner
    const corner = normalizeCorner({ ...old, ...action.patch })
    if (corner.height < old.height && corner.shelves < old.shelves && !action.confirmFillingChange)
      return current
    next = {
      ...current,
      arrangement: second && a.kind === 'u' ? { ...a, secondCorner: corner } : { ...a, corner },
    }
  } else if (
    action.type === 'add-section' &&
    wardrobeSectionCount(current) < wardrobeSectionLimit(current) &&
    SECTION_PRESETS.some((preset) => preset.id === action.preset)
  ) {
    let number = 1
    while (current.sections.some((item) => item.id === `section-${number}`)) number++
    const ranges = wardrobeArmRanges(current),
      range = ranges.find((r) => r.arm === action.arm) ?? ranges.at(-1)!
    const at = range.end,
      last = current.sections[at - 1]!
    const height = action.preset === 'hanging' ? Math.max(last.height, MIN_ROD_SECTION_HEIGHT) : last.height
    const sections = [...current.sections]
    sections.splice(
      at,
      0,
      createWardrobeSection(`section-${number}`, action.preset, { height, depth: last.depth }),
    )
    const a = current.arrangement
    const arrangement = a && {
      ...a,
      split: a.split + (range.arm === 0 ? 1 : 0),
      ...(a.kind === 'u' ? { secondSplit: a.secondSplit + (range.arm < 2 ? 1 : 0) } : {}),
    }
    next = { ...current, sections, ...(arrangement ? { arrangement } : {}) }
  } else if (action.type === 'remove-section' && current.sections.length > 1) {
    const index = current.sections.findIndex((item) => item.id === action.id)
    if (index < 0) return current
    const arm = wardrobeArmAt(current, index),
      range = wardrobeArmRanges(current)[arm]
    if (range.end - range.start <= 1) return current
    const a = current.arrangement
    const arrangement = a && {
      ...a,
      split: a.split - (arm === 0 ? 1 : 0),
      ...(a.kind === 'u' ? { secondSplit: a.secondSplit - (arm < 2 ? 1 : 0) } : {}),
    }
    next = {
      ...current,
      sections: current.sections.filter((item) => item.id !== action.id),
      ...(arrangement ? { arrangement } : {}),
    }
  } else if (action.type === 'move-section') {
    const index = current.sections.findIndex((item) => item.id === action.id),
      target = index + action.direction
    if (index >= 0 && target >= 0 && target < current.sections.length && Math.abs(action.direction) === 1) {
      const sections = [...current.sections]
      ;[sections[index], sections[target]] = [sections[target], sections[index]]
      next = { ...current, sections }
    }
  } else if (action.type === 'update-section') {
    next = {
      ...current,
      sections: current.sections.map((item) => {
        if (item.id !== action.id) return item
        const candidate = previewWardrobeSectionUpdate(item, action.patch)
        if (
          wardrobeSectionNeedsConfirmation(item, candidate) &&
          !action.confirmFillingChange &&
          !(action.confirmHeightChange && candidate.height !== item.height)
        )
          return item
        return candidate
      }),
    }
  } else if (
    action.type === 'set-layout-mode' ||
    action.type === 'move-shelf' ||
    action.type === 'move-rod'
  ) {
    next = {
      ...current,
      sections: current.sections.map((item) => {
        if (item.id !== action.id) return item
        if (action.type === 'set-layout-mode') {
          if (!action.manual) return normalizeWardrobeSection({ ...item, layout: undefined }, item.id)
          if (item.layout) return item
          const layout = fitWardrobeLayout(item)
          return layout ? { ...item, layout } : item
        }
        if (!item.layout || !Number.isFinite(action.height)) return item
        const layout: WardrobeLayout = { ...item.layout, shelves: [...item.layout.shelves] }
        if (action.type === 'move-rod') {
          if (!item.rod) return item
          layout.rod = action.height
        } else {
          if (!Number.isInteger(action.index) || action.index < 0 || action.index >= item.shelves) return item
          layout.shelves[action.index] = action.height
        }
        return isValidWardrobeLayout(item, layout) ? { ...item, layout } : item
      }),
    }
  } else if (action.type === 'set-wardrobe-finish') {
    const allowed = action.slot === 'hardwareFinish' ? HARDWARE_FINISHES : BODY_FINISHES
    if (action.slot === 'facadeFinish' && action.finishId === null) {
      next = { ...current }
      delete next.facadeFinish
    } else if (action.finishId !== null && allowed.includes(action.finishId))
      next = { ...current, [action.slot]: action.finishId }
  } else if (action.type === 'set-section-finish') {
    const allowed = action.slot === 'hardwareFinish' ? HARDWARE_FINISHES : BODY_FINISHES
    if (action.finishId === null || allowed.includes(action.finishId)) {
      next = {
        ...current,
        sections: current.sections.map((item) =>
          item.id === action.id
            ? normalizeWardrobeSection({ ...item, [action.slot]: action.finishId }, item.id)
            : item,
        ),
      }
    }
  }
  // Subscribers use reference identity to skip unchanged scenes and saves.
  // Keep the original snapshot for rejected edits and equivalent results.
  return JSON.stringify(next) === JSON.stringify(current) ? current : next
}
