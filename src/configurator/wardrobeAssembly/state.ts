import type { FurnitureDimensionConfig } from '../../three/furniture/types'
import { getWardrobeDrawerHandle, isWardrobeDrawerHandle } from './drawerHandles'
import { MIN_ROD_SECTION_HEIGHT, DRAWER_HEIGHTS, wardrobeDrawerLimit, automaticLayout, type WardrobeDrawers, fitWardrobeLayout, fitWardrobeLayoutChange, isValidWardrobeLayout, readWardrobeLayout, wardrobeCanHaveRod, wardrobeShelfLimit, wardrobeManualShelfLimit, wardrobeLayoutAdjustments, type WardrobeLayout } from './layout'
export * from './layout'

// Prototype ranges. These are configurator limits, not production approval.
export const SECTION_DIMENSIONS: Record<'width' | 'height' | 'depth', FurnitureDimensionConfig> = {
  width: { label: 'Ширина секции', base: .6, min: .4, max: 1, step: .05 },
  height: { label: 'Высота секции', base: 2.2, min: .8, max: 2.8, step: .1 },
  depth: { label: 'Глубина корпуса', base: .55, min: .4, max: .8, step: .05 },
}
export const RECESSED_DRAWER_INSET = .029
export const DRAWER_PLACEMENTS = [
  { value: 'recessed', label: 'Утопленные' },
  { value: 'flush', label: 'Вровень с корпусом' },
] as const
export function wardrobeDrawerPlacementLabel(drawers: WardrobeDrawers) {
  return DRAWER_PLACEMENTS.find(option => option.value === (drawers.placement ?? 'recessed'))!.label
}
export function wardrobeDrawerFrontInset(drawers?: WardrobeDrawers) {
  return drawers?.placement === 'flush' ? 0 : RECESSED_DRAWER_INSET
}
export function wardrobeSectionClosedDepth(section: WardrobeSection) {
  const projection = section.drawers ? Math.max(0, getWardrobeDrawerHandle(section.drawers.handle).projection - wardrobeDrawerFrontInset(section.drawers)) : 0
  return Number((section.depth + projection).toFixed(8))
}
export const MAX_SECTIONS = 7
export function wardrobeFillingLabel(section: Pick<WardrobeSection, 'shelves' | 'rod' | 'drawers'>): string {
  const { shelves, rod } = section
  if (section.drawers) return `${wardrobeFillingLabel({ shelves, rod })} · ящиков: ${section.drawers.count}`
  if (rod) return shelves === 2 ? 'Штанга · верхняя и нижняя полки' : shelves === 1 ? 'Штанга · верхняя полка' : 'Штанга · без полок'
  return shelves === 0 ? 'Без полок' : `${shelves} ${shelves === 1 ? 'полка' : shelves < 5 ? 'полки' : 'полок'}`
}
export const BODY_FINISHES = ['board-white-matte', 'board-cashmere-body', 'board-grey-neutral', 'board-graphite-matte', 'oak-natural', 'oak-grey', 'oak-silver', 'oak-black', 'board-muted-green', 'board-powder-beige']
export const HARDWARE_FINISHES = ['metal-black-matte', 'metal-white-matte', 'metal-anthracite', 'metal-brass-satin']
export const SECTION_PRESETS = [
  { id: 'shelves', label: 'С полками' },
  { id: 'hanging', label: 'Со штангой' },
  { id: 'empty', label: 'Пустая секция' },
] as const
export type SectionPreset = typeof SECTION_PRESETS[number]['id']
export type WardrobeFinishSlot = 'bodyFinish' | 'hardwareFinish'
// Omitted finish = live inheritance, not a copy of the assembly's current value.
export type WardrobeSection = { id: string; width: number; height: number; depth: number; shelves: number; rod: boolean; bodyFinish?: string; hardwareFinish?: string; layout?: WardrobeLayout; drawers?: WardrobeDrawers }
export type WardrobeAssemblyConfiguration = { sections: WardrobeSection[]; bodyFinish: string; hardwareFinish: string }
export function wardrobeSectionFinish(config: WardrobeAssemblyConfiguration, section: WardrobeSection, slot: WardrobeFinishSlot) {
  return section[slot] ?? config[slot]
}
export type WardrobeAssemblyAction =
  | { type: 'add-section'; preset: SectionPreset }
  | { type: 'remove-section'; id: string }
  | { type: 'move-section'; id: string; direction: -1 | 1 }
  | { type: 'update-section'; id: string; patch: Partial<Omit<WardrobeSection, 'id'>>; confirmHeightChange?: boolean; confirmFillingChange?: boolean }
  | { type: 'set-wardrobe-finish'; slot: 'bodyFinish' | 'hardwareFinish'; finishId: string }
  | { type: 'set-layout-mode'; id: string; manual: boolean }
  | { type: 'move-shelf'; id: string; index: number; height: number }
  | { type: 'move-rod'; id: string; height: number }
  | { type: 'set-section-finish'; id: string; slot: WardrobeFinishSlot; finishId: string | null }

function record(input: unknown): Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input) ? input as Record<string, unknown> : {}
}
function size(input: unknown, config: FurnitureDimensionConfig) {
  const value = typeof input === 'number' && Number.isFinite(input) ? input : config.base
  return Number(Math.max(config.min, Math.min(config.max, config.min + Math.round((value - config.min) / config.step) * config.step)).toFixed(8))
}
function section(input: unknown, id: string): WardrobeSection {
  const raw = record(input)
  const height = size(raw.height, SECTION_DIMENSIONS.height)
  const rod = raw.rod === true && wardrobeCanHaveRod(height)
  const requestedShelves = typeof raw.shelves === 'number' && Number.isFinite(raw.shelves) ? Math.round(raw.shelves) : rod ? 1 : 4
  const drawerInput = record(raw.drawers)
  const drawerHeight = DRAWER_HEIGHTS.find(value => value === drawerInput.height) ?? .2
  const drawerCount = typeof drawerInput.count === 'number' && Number.isFinite(drawerInput.count)
    ? Math.max(0, Math.min(wardrobeDrawerLimit(height, rod, drawerHeight), Math.round(drawerInput.count))) : 0
  // Omitted placement retains the original recessed drawers without migrating
  // old v4 configurations. Preserve either explicitly selected valid choice.
  const drawers: WardrobeDrawers | undefined = drawerCount ? { count: drawerCount, height: drawerHeight,
    ...(drawerInput.placement === 'flush' || drawerInput.placement === 'recessed' ? { placement: drawerInput.placement } : {}),
    ...(isWardrobeDrawerHandle(drawerInput.handle) ? { handle: drawerInput.handle } : {}) } : undefined
  const manual = readWardrobeLayout(raw.layout)
  const limit = manual ? wardrobeManualShelfLimit(height, rod, drawers) : wardrobeShelfLimit(height, rod, drawers)
  const result: WardrobeSection = {
    id, width: size(raw.width, SECTION_DIMENSIONS.width), height, depth: size(raw.depth, SECTION_DIMENSIONS.depth),
    shelves: Math.max(0, Math.min(limit, requestedShelves)),
    rod,
    ...(drawers ? { drawers } : {}),
    ...(typeof raw.bodyFinish === 'string' && BODY_FINISHES.includes(raw.bodyFinish) ? { bodyFinish: raw.bodyFinish } : {}),
    ...(typeof raw.hardwareFinish === 'string' && HARDWARE_FINISHES.includes(raw.hardwareFinish) ? { hardwareFinish: raw.hardwareFinish } : {}),
  }
  if (manual) {
    const targets = raw.rod === true && !rod ? { shelves: [...manual.shelves].sort((a, b) => a - b) } : manual
    const layout = fitWardrobeLayout(result, targets)
    if (layout) result.layout = layout
  }
  return result
}
export function previewWardrobeSectionUpdate(current: WardrobeSection, patch: Partial<Omit<WardrobeSection, 'id'>>) {
  const changes = { ...patch }
  const height = size(changes.height ?? current.height, SECTION_DIMENSIONS.height)
  if (changes.rod && !current.rod && changes.shelves === undefined && wardrobeCanHaveRod(height)) changes.shelves = Math.min(current.shelves, 1)
  const next = section({ ...current, ...changes, layout: undefined }, current.id)
  if (current.layout && changes.layout === undefined) {
    next.shelves = Math.min(next.shelves, wardrobeManualShelfLimit(next.height, next.rod, next.drawers))
    const layout = fitWardrobeLayoutChange(current, next)
    if (layout) next.layout = layout
    return next
  }
  return section({ ...next, layout: changes.layout }, current.id)
}
export function wardrobeHeightNeedsConfirmation(current: WardrobeSection, next: WardrobeSection) {
  return next.height < current.height && ((current.rod && !next.rod) || next.shelves < current.shelves || (next.drawers?.count ?? 0) < (current.drawers?.count ?? 0) || wardrobeLayoutAdjustments(current, next).length > 0)
}
export function wardrobeSectionNeedsConfirmation(current: WardrobeSection, next: WardrobeSection) {
  const drawersChanged = JSON.stringify(current.drawers) !== JSON.stringify(next.drawers)
  const displacedByDrawers = drawersChanged && (next.drawers?.count ?? 0) * (next.drawers?.height ?? 0) > (current.drawers?.count ?? 0) * (current.drawers?.height ?? 0) && (next.shelves < current.shelves ||
    (current.shelves > 0 || current.rod) && JSON.stringify(automaticLayout(current)) !== JSON.stringify(automaticLayout(next)) && !current.layout)
  const drawersRemovedForRod = !current.rod && next.rod && (next.drawers?.count ?? 0) < (current.drawers?.count ?? 0)
  const drawersRemovedForRow = !!current.drawers && !!next.drawers && current.drawers.height !== next.drawers.height && next.drawers.count < current.drawers.count
  return drawersRemovedForRow || displacedByDrawers || drawersRemovedForRod || wardrobeHeightNeedsConfirmation(current, next) || wardrobeLayoutAdjustments(current, next).length > 0
    || (!current.rod && next.rod && next.shelves < current.shelves)
}
export function wardrobeAdjustmentNotice(input: unknown, normalized: WardrobeAssemblyConfiguration) {
  const raw = record(input)
  if (!Array.isArray(raw.sections)) return null
  if (raw.sections.length > MAX_SECTIONS) return `В прямой сборке допускается до ${MAX_SECTIONS} секций. Из загруженного варианта оставлены первые ${MAX_SECTIONS}; проверьте состав сборки.`
  if (raw.sections.slice(0, MAX_SECTIONS).some((item, i) => {
    const value = record(item).drawers
    return value !== undefined && JSON.stringify(value) !== JSON.stringify(normalized.sections[i]?.drawers)
  })) return 'Параметры ящиков скорректированы по размерам секций и допустимым зазорам. Проверьте восстановленное наполнение.'
  if (raw.sections.slice(0, MAX_SECTIONS).some((item, i) => record(item).rod === true && !normalized.sections[i]?.rod)) {
    return 'Штанги в секциях ниже 150 см удалены по новым правилам. Проверьте оставшиеся полки; размеры и материалы сохранены в допустимых пределах.'
  }
  if (raw.sections.slice(0, MAX_SECTIONS).some((item, i) => typeof record(item).shelves === 'number' && Number(record(item).shelves) > (normalized.sections[i]?.shelves ?? 0))) {
    return 'Количество полок скорректировано по высоте секций и допустимым зазорам. Проверьте наполнение восстановленной сборки.'
  }
  if (raw.sections.slice(0, MAX_SECTIONS).some((item, i) => (['bodyFinish', 'hardwareFinish'] as const)
    .some(slot => record(item)[slot] != null && record(item)[slot] !== normalized.sections[i]?.[slot]))) {
    return 'Недоступные материалы отдельных секций заменены общими материалами сборки.'
  }
  if (raw.sections.slice(0, MAX_SECTIONS).some((item, i) => {
    const value = record(item).layout
    return value !== undefined && (!readWardrobeLayout(value) || JSON.stringify(readWardrobeLayout(value)) !== JSON.stringify(normalized.sections[i]?.layout))
  })) return 'Положения полок и штанг скорректированы по размерам секций, шагу 5 см и допустимым зазорам. Проверьте наполнение.'
  return null
}
export function createWardrobeSection(id: string, preset: SectionPreset, dimensions?: Partial<WardrobeSection>) {
  return section({ ...dimensions, shelves: preset === 'shelves' ? 4 : preset === 'hanging' ? 1 : 0, rod: preset === 'hanging' }, id)
}
export function createDefaultWardrobe(): WardrobeAssemblyConfiguration {
  return { sections: [createWardrobeSection('section-1', 'shelves'), createWardrobeSection('section-2', 'hanging', { width: .8 }), createWardrobeSection('section-3', 'shelves')], bodyFinish: 'board-grey-neutral', hardwareFinish: 'metal-black-matte' }
}
export function normalizeWardrobeAssembly(input: unknown): WardrobeAssemblyConfiguration {
  const raw = record(input), defaults = createDefaultWardrobe()
  const used = new Set<string>()
  const sections = Array.isArray(raw.sections) && raw.sections.length ? raw.sections.slice(0, MAX_SECTIONS).map((value, index) => {
    const candidate = record(value).id
    let id = typeof candidate === 'string' && /^section-\d{1,6}$/.test(candidate) && !used.has(candidate) ? candidate : `section-${index + 1}`
    let fallback = 1
    while (used.has(id)) id = `section-${fallback++}`
    used.add(id)
    return section(value, id)
  }) : defaults.sections
  return { sections,
    bodyFinish: typeof raw.bodyFinish === 'string' && BODY_FINISHES.includes(raw.bodyFinish) ? raw.bodyFinish : defaults.bodyFinish,
    hardwareFinish: typeof raw.hardwareFinish === 'string' && HARDWARE_FINISHES.includes(raw.hardwareFinish) ? raw.hardwareFinish : defaults.hardwareFinish,
  }
}
export function wardrobeBounds(config: WardrobeAssemblyConfiguration) {
  return { width: Number(config.sections.reduce((sum, item) => sum + item.width, 0).toFixed(8)),
    height: Math.max(...config.sections.map(item => item.height)), depth: Math.max(...config.sections.map(item => item.depth)) }
}
// Rear panels stay aligned using carcass bounds; framing and overall dimensions
// additionally include handles of the CLOSED drawers, even at mixed depths.
export function wardrobeClosedBounds(config: WardrobeAssemblyConfiguration) {
  return { ...wardrobeBounds(config), depth: Math.max(...config.sections.map(wardrobeSectionClosedDepth)) }
}
export function updateWardrobeAssembly(current: WardrobeAssemblyConfiguration, action: WardrobeAssemblyAction) {
  let next = current
  if (action.type === 'add-section' && current.sections.length < MAX_SECTIONS && SECTION_PRESETS.some(preset => preset.id === action.preset)) {
    let number = 1
    while (current.sections.some(item => item.id === `section-${number}`)) number++
    const last = current.sections.at(-1)!
    const height = action.preset === 'hanging' ? Math.max(last.height, MIN_ROD_SECTION_HEIGHT) : last.height
    next = { ...current, sections: [...current.sections, createWardrobeSection(`section-${number}`, action.preset, { height, depth: last.depth })] }
  } else if (action.type === 'remove-section' && current.sections.length > 1) {
    next = { ...current, sections: current.sections.filter(item => item.id !== action.id) }
  } else if (action.type === 'move-section') {
    const index = current.sections.findIndex(item => item.id === action.id), target = index + action.direction
    if (index >= 0 && target >= 0 && target < current.sections.length && Math.abs(action.direction) === 1) {
      const sections = [...current.sections]
      ;[sections[index], sections[target]] = [sections[target], sections[index]]
      next = { ...current, sections }
    }
  } else if (action.type === 'update-section') {
    next = { ...current, sections: current.sections.map(item => {
      if (item.id !== action.id) return item
      const candidate = previewWardrobeSectionUpdate(item, action.patch)
      if (wardrobeSectionNeedsConfirmation(item, candidate) && !action.confirmFillingChange && !(action.confirmHeightChange && candidate.height !== item.height)) return item
      return candidate
    }) }
  } else if (action.type === 'set-layout-mode' || action.type === 'move-shelf' || action.type === 'move-rod') {
    next = { ...current, sections: current.sections.map(item => {
      if (item.id !== action.id) return item
      if (action.type === 'set-layout-mode') {
        if (!action.manual) return section({ ...item, layout: undefined }, item.id)
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
    }) }
  } else if (action.type === 'set-wardrobe-finish') {
    const allowed = action.slot === 'bodyFinish' ? BODY_FINISHES : HARDWARE_FINISHES
    if (allowed.includes(action.finishId)) next = { ...current, [action.slot]: action.finishId }
  } else if (action.type === 'set-section-finish') {
    const allowed = action.slot === 'bodyFinish' ? BODY_FINISHES : HARDWARE_FINISHES
    if (action.finishId === null || allowed.includes(action.finishId)) {
      next = { ...current, sections: current.sections.map(item => item.id === action.id
        ? section({ ...item, [action.slot]: action.finishId }, item.id) : item) }
    }
  }
  return JSON.stringify(next) === JSON.stringify(current) ? current : next
}
