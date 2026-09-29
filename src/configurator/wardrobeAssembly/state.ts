import type { FurnitureDimensionConfig } from '../../three/furniture/types'

// Prototype ranges. These are configurator limits, not production approval.
export const SECTION_DIMENSIONS: Record<'width' | 'height' | 'depth', FurnitureDimensionConfig> = {
  width: { label: 'Ширина секции', base: .6, min: .4, max: 1, step: .05 },
  height: { label: 'Высота секции', base: 2.2, min: .8, max: 2.8, step: .1 },
  depth: { label: 'Глубина секции', base: .55, min: .4, max: .8, step: .05 },
}
export const MAX_SECTIONS = 6
export const PANEL_THICKNESS = .016
export const BACK_THICKNESS = .004
export const PLINTH_HEIGHT = .07
export const MIN_SHELF_CLEARANCE = .2
export const MIN_ROD_CLEARANCE = .6
export const ROD_RADIUS = .0125
export const MIN_ROD_SECTION_HEIGHT = 1.5
export const MIN_ROD_AXIS_HEIGHT = 1.2
const ROD_TOP_CLEARANCE = .08

export function wardrobeCanHaveRod(height: number) {
  return height >= MIN_ROD_SECTION_HEIGHT
}

// Shared by state validation, the controls and the actual geometry. Clearances
// are usable space between surfaces, never a distance between panel centres.
export function wardrobeRodY(height: number) {
  return Math.max(height - .38, MIN_ROD_AXIS_HEIGHT, PLINTH_HEIGHT + PANEL_THICKNESS + MIN_ROD_CLEARANCE + ROD_RADIUS)
}
export function wardrobeShelfLimit(height: number, rod: boolean) {
  const floor = PLINTH_HEIGHT + PANEL_THICKNESS
  if (rod) {
    const y = wardrobeRodY(height)
    if (height - .26 - PANEL_THICKNESS / 2 - y < ROD_TOP_CLEARANCE - 1e-9) return 0
    const lowerTop = floor + MIN_SHELF_CLEARANCE + PANEL_THICKNESS
    return y - ROD_RADIUS - lowerTop >= MIN_ROD_CLEARANCE - 1e-9 ? 2 : 1
  }
  const inside = height - PANEL_THICKNESS - floor
  return Math.max(0, Math.min(6, Math.floor((inside - MIN_SHELF_CLEARANCE + 1e-9) / (MIN_SHELF_CLEARANCE + PANEL_THICKNESS))))
}
export function wardrobeShelfYs(section: Pick<WardrobeSection, 'height' | 'shelves' | 'rod'>) {
  const { height, rod } = section
  const count = Math.min(section.shelves, wardrobeShelfLimit(height, rod))
  const floor = PLINTH_HEIGHT + PANEL_THICKNESS
  if (rod) return count === 0 ? [] : count === 1 ? [height - .26] : [height - .26, floor + MIN_SHELF_CLEARANCE + PANEL_THICKNESS / 2]
  const gap = (height - PANEL_THICKNESS - floor - count * PANEL_THICKNESS) / (count + 1)
  return Array.from({ length: count }, (_, index) => floor + gap + PANEL_THICKNESS / 2 + index * (gap + PANEL_THICKNESS))
}

export function wardrobeFillingLabel(section: Pick<WardrobeSection, 'shelves' | 'rod'>) {
  const { shelves, rod } = section
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
export type WardrobeSection = { id: string; width: number; height: number; depth: number; shelves: number; rod: boolean }
export type WardrobeAssemblyConfiguration = { sections: WardrobeSection[]; bodyFinish: string; hardwareFinish: string }
export type WardrobeAssemblyAction =
  | { type: 'add-section'; preset: SectionPreset }
  | { type: 'remove-section'; id: string }
  | { type: 'move-section'; id: string; direction: -1 | 1 }
  | { type: 'update-section'; id: string; patch: Partial<Omit<WardrobeSection, 'id'>>; confirmHeightChange?: boolean }
  | { type: 'set-wardrobe-finish'; slot: 'bodyFinish' | 'hardwareFinish'; finishId: string }

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
  return {
    id, width: size(raw.width, SECTION_DIMENSIONS.width), height, depth: size(raw.depth, SECTION_DIMENSIONS.depth),
    shelves: Math.max(0, Math.min(wardrobeShelfLimit(height, rod), requestedShelves)),
    rod,
  }
}
export function previewWardrobeSectionUpdate(current: WardrobeSection, patch: Partial<Omit<WardrobeSection, 'id'>>) {
  const changes = { ...patch }
  const height = size(changes.height ?? current.height, SECTION_DIMENSIONS.height)
  if (changes.rod && !current.rod && changes.shelves === undefined && wardrobeCanHaveRod(height)) changes.shelves = Math.min(current.shelves, 1)
  return section({ ...current, ...changes }, current.id)
}
export function wardrobeHeightNeedsConfirmation(current: WardrobeSection, next: WardrobeSection) {
  return next.height < current.height && ((current.rod && !next.rod) || next.shelves < current.shelves)
}
export function wardrobeAdjustmentNotice(input: unknown, normalized: WardrobeAssemblyConfiguration) {
  const raw = record(input)
  if (!Array.isArray(raw.sections)) return null
  if (raw.sections.slice(0, MAX_SECTIONS).some((item, i) => record(item).rod === true && !normalized.sections[i]?.rod)) {
    return 'Штанги в секциях ниже 150 см удалены по новым правилам. Оставшиеся полки распределены равномерно; размеры и материалы сохранены в допустимых пределах.'
  }
  if (raw.sections.slice(0, MAX_SECTIONS).some((item, i) => typeof record(item).shelves === 'number' && Number(record(item).shelves) > (normalized.sections[i]?.shelves ?? 0))) {
    return 'Количество полок скорректировано по высоте секций и допустимым зазорам. Проверьте наполнение восстановленной сборки.'
  }
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
      if (wardrobeHeightNeedsConfirmation(item, candidate) && !action.confirmHeightChange) return item
      return candidate
    }) }
  } else if (action.type === 'set-wardrobe-finish') {
    const allowed = action.slot === 'bodyFinish' ? BODY_FINISHES : HARDWARE_FINISHES
    if (allowed.includes(action.finishId)) next = { ...current, [action.slot]: action.finishId }
  }
  return JSON.stringify(next) === JSON.stringify(current) ? current : next
}
