import type { FurnitureDimensionConfig } from '../../three/furniture/types'

// v1 prototype ranges. These are configurator limits, not production approval.
export const SECTION_DIMENSIONS: Record<'width' | 'height' | 'depth', FurnitureDimensionConfig> = {
  width: { label: 'Ширина секции', base: .6, min: .4, max: 1, step: .05 },
  height: { label: 'Высота секции', base: 2.2, min: 1.8, max: 2.6, step: .1 },
  depth: { label: 'Глубина секции', base: .55, min: .4, max: .65, step: .05 },
}
export const MAX_SECTIONS = 6
export const PANEL_THICKNESS = .016
export const BACK_THICKNESS = .004
export const PLINTH_HEIGHT = .07
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
  | { type: 'update-section'; id: string; patch: Partial<Omit<WardrobeSection, 'id'>> }
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
  const rod = raw.rod === true
  return {
    id, width: size(raw.width, SECTION_DIMENSIONS.width), height: size(raw.height, SECTION_DIMENSIONS.height), depth: size(raw.depth, SECTION_DIMENSIONS.depth),
    // With a rod there is one top shelf at most, keeping the hanging space clear.
    shelves: typeof raw.shelves === 'number' && Number.isFinite(raw.shelves)
      ? Math.max(0, Math.min(rod ? 1 : 6, Math.round(raw.shelves))) : rod ? 1 : 4,
    rod,
  }
}
export function createWardrobeSection(id: string, preset: SectionPreset, dimensions?: Partial<WardrobeSection>) {
  return section({ ...dimensions, shelves: preset === 'shelves' ? 4 : preset === 'hanging' ? 1 : 0, rod: preset === 'hanging' }, id)
}
export function createDefaultWardrobe(): WardrobeAssemblyConfiguration {
  return { sections: [createWardrobeSection('section-1', 'shelves'), createWardrobeSection('section-2', 'hanging', { width: .8 }), createWardrobeSection('section-3', 'shelves')], bodyFinish: 'oak-natural', hardwareFinish: 'metal-black-matte' }
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
    next = { ...current, sections: [...current.sections, createWardrobeSection(`section-${number}`, action.preset, { height: last.height, depth: last.depth })] }
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
    next = { ...current, sections: current.sections.map(item => item.id === action.id ? section({ ...item, ...action.patch }, item.id) : item) }
  } else if (action.type === 'set-wardrobe-finish') {
    const allowed = action.slot === 'bodyFinish' ? BODY_FINISHES : HARDWARE_FINISHES
    if (allowed.includes(action.finishId)) next = { ...current, [action.slot]: action.finishId }
  }
  return JSON.stringify(next) === JSON.stringify(current) ? current : next
}
