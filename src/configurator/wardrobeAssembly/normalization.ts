import {
  MAX_CORNER_SECTIONS,
  wardrobeSectionLimit,
  wardrobeCornerCount,
  type WardrobeCorner,
  type WardrobeArrangement,
} from './arrangement'
import { SECTION_DIMENSIONS, BODY_FINISHES, HARDWARE_FINISHES, MAX_SECTIONS } from './constants'
import { normalizeWardrobeDoors } from './doors'
import { isWardrobeDrawerFacade } from './drawerFacades'
import { isWardrobeDrawerHandle } from './drawerHandles'
import {
  DRAWER_HEIGHTS,
  wardrobeDrawerLimit,
  fitWardrobeLayout,
  readWardrobeLayout,
  wardrobeCanHaveRod,
  wardrobeShelfLimit,
  wardrobeManualShelfLimit,
  type WardrobeDrawers,
} from './layout'
import type { FurnitureDimensionConfig } from '../../three/furniture/types'
import type { SectionPreset, WardrobeAssemblyConfiguration, WardrobeSection } from './types'

function record(input: unknown): Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input)
    ? (input as Record<string, unknown>)
    : {}
}

export function normalizeWardrobeDimension(input: unknown, config: FurnitureDimensionConfig) {
  const value = typeof input === 'number' && Number.isFinite(input) ? input : config.base
  return Number(
    Math.max(
      config.min,
      Math.min(config.max, config.min + Math.round((value - config.min) / config.step) * config.step),
    ).toFixed(8),
  )
}

export function normalizeWardrobeSection(input: unknown, id: string): WardrobeSection {
  const raw = record(input)
  const width = normalizeWardrobeDimension(raw.width, SECTION_DIMENSIONS.width)
  const doors = normalizeWardrobeDoors(raw.doors, width, BODY_FINISHES)
  const height = normalizeWardrobeDimension(raw.height, SECTION_DIMENSIONS.height)
  const rod = raw.rod === true && wardrobeCanHaveRod(height)
  const requestedShelves =
    typeof raw.shelves === 'number' && Number.isFinite(raw.shelves) ? Math.round(raw.shelves) : rod ? 1 : 4
  const drawerInput = record(raw.drawers)
  const drawerHeight = DRAWER_HEIGHTS.find((value) => value === drawerInput.height) ?? 0.2
  const drawerCount =
    typeof drawerInput.count === 'number' && Number.isFinite(drawerInput.count)
      ? Math.max(0, Math.min(wardrobeDrawerLimit(height, rod, drawerHeight), Math.round(drawerInput.count)))
      : 0
  // Omitted placement retains the original recessed drawers without migrating
  // old v4 configurations. Preserve either explicitly selected valid choice.
  const drawers: WardrobeDrawers | undefined = drawerCount
    ? {
        count: drawerCount,
        height: drawerHeight,
        ...(drawerInput.placement === 'flush' || drawerInput.placement === 'recessed'
          ? { placement: drawerInput.placement }
          : {}),
        ...(isWardrobeDrawerHandle(drawerInput.handle) ? { handle: drawerInput.handle } : {}),
        ...(isWardrobeDrawerFacade(drawerInput.facadeStyle) ? { facadeStyle: drawerInput.facadeStyle } : {}),
        ...(doors ? { placement: 'recessed' as const } : {}),
      }
    : undefined
  const manual = readWardrobeLayout(raw.layout)
  const limit = manual
    ? wardrobeManualShelfLimit(height, rod, drawers)
    : wardrobeShelfLimit(height, rod, drawers)
  const result: WardrobeSection = {
    id,
    width,
    height,
    depth: normalizeWardrobeDimension(raw.depth, SECTION_DIMENSIONS.depth),
    shelves: Math.max(0, Math.min(limit, requestedShelves)),
    rod,
    ...(drawers ? { drawers } : {}),
    ...(doors ? { doors } : {}),
    ...(typeof raw.bodyFinish === 'string' && BODY_FINISHES.includes(raw.bodyFinish)
      ? { bodyFinish: raw.bodyFinish }
      : {}),
    ...(typeof raw.facadeFinish === 'string' && BODY_FINISHES.includes(raw.facadeFinish)
      ? { facadeFinish: raw.facadeFinish }
      : {}),
    ...(typeof raw.hardwareFinish === 'string' && HARDWARE_FINISHES.includes(raw.hardwareFinish)
      ? { hardwareFinish: raw.hardwareFinish }
      : {}),
  }
  if (manual) {
    const targets = raw.rod === true && !rod ? { shelves: [...manual.shelves].sort((a, b) => a - b) } : manual
    const layout = fitWardrobeLayout(result, targets)
    if (layout) result.layout = layout
  }
  return result
}

export function createWardrobeSection(
  id: string,
  preset: SectionPreset,
  dimensions?: Partial<WardrobeSection>,
) {
  return normalizeWardrobeSection(
    {
      ...dimensions,
      shelves: preset === 'shelves' ? 4 : preset === 'hanging' ? 1 : 0,
      rod: preset === 'hanging',
    },
    id,
  )
}

export function createDefaultWardrobe(): WardrobeAssemblyConfiguration {
  return {
    sections: [
      createWardrobeSection('section-1', 'shelves'),
      createWardrobeSection('section-2', 'hanging', { width: 0.8 }),
      createWardrobeSection('section-3', 'shelves'),
    ],
    bodyFinish: 'board-grey-neutral',
    hardwareFinish: 'metal-black-matte',
  }
}

export function normalizeCorner(input: unknown): WardrobeCorner {
  const corner = record(input)
  const height = normalizeWardrobeDimension(corner.height, SECTION_DIMENSIONS.height)
  const requested =
    typeof corner.shelves === 'number' && Number.isFinite(corner.shelves) ? Math.round(corner.shelves) : 4
  return {
    height,
    shelves: Math.max(0, Math.min(wardrobeShelfLimit(height, false), requested)),
    ...(typeof corner.bodyFinish === 'string' && BODY_FINISHES.includes(corner.bodyFinish)
      ? { bodyFinish: corner.bodyFinish }
      : {}),
  }
}

export function normalizeArrangement(
  input: unknown,
  sections: WardrobeSection[],
): WardrobeArrangement | undefined {
  const raw = record(input),
    isU = raw.kind === 'u'
  if ((!isU && raw.kind !== 'l') || sections.length < (isU ? 3 : 2)) return undefined
  const count = (v: unknown, fallback: number, min: number, max: number) =>
    Math.max(min, Math.min(max, typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : fallback))
  const split = count(
    raw.split,
    Math.ceil(sections.length / (isU ? 3 : 2)),
    1,
    sections.length - (isU ? 2 : 1),
  )
  const corner = normalizeCorner(raw.corner)
  if (isU)
    return {
      kind: 'u',
      split,
      secondSplit: count(
        raw.secondSplit,
        split + Math.ceil((sections.length - split) / 2),
        split + 1,
        sections.length - 1,
      ),
      corner,
      secondCorner: normalizeCorner(raw.secondCorner),
    }
  return { kind: 'l', side: raw.side === 'right' ? 'right' : 'left', split, corner }
}

export function normalizeWardrobeAssembly(input: unknown): WardrobeAssemblyConfiguration {
  const raw = record(input),
    defaults = createDefaultWardrobe()
  const used = new Set<string>()
  const kind = record(raw.arrangement).kind
  const limit = kind === 'u' ? MAX_CORNER_SECTIONS - 2 : kind === 'l' ? MAX_CORNER_SECTIONS - 1 : MAX_SECTIONS
  const sections =
    Array.isArray(raw.sections) && raw.sections.length
      ? raw.sections.slice(0, limit).map((value, index) => {
          const candidate = record(value).id
          let id =
            typeof candidate === 'string' && /^section-\d{1,6}$/.test(candidate) && !used.has(candidate)
              ? candidate
              : `section-${index + 1}`
          let fallback = 1
          while (used.has(id)) id = `section-${fallback++}`
          used.add(id)
          return normalizeWardrobeSection(value, id)
        })
      : defaults.sections
  const arrangement = normalizeArrangement(raw.arrangement, sections)
  return {
    sections,
    ...(arrangement ? { arrangement } : {}),
    bodyFinish:
      typeof raw.bodyFinish === 'string' && BODY_FINISHES.includes(raw.bodyFinish)
        ? raw.bodyFinish
        : defaults.bodyFinish,
    ...(typeof raw.facadeFinish === 'string' && BODY_FINISHES.includes(raw.facadeFinish)
      ? { facadeFinish: raw.facadeFinish }
      : {}),
    hardwareFinish:
      typeof raw.hardwareFinish === 'string' && HARDWARE_FINISHES.includes(raw.hardwareFinish)
        ? raw.hardwareFinish
        : defaults.hardwareFinish,
  }
}

// JSON key order has no meaning, including optional drawer and corner fields.
function sameInput(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (Array.isArray(a) && Array.isArray(b))
    return a.length === b.length && a.every((v, i) => sameInput(v, b[i]))
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const left = record(a),
      right = record(b)
    return (
      Object.keys(left).length === Object.keys(right).length &&
      Object.keys(left).every((k) => Object.hasOwn(right, k) && sameInput(left[k], right[k]))
    )
  }
  return false
}

export function wardrobeAdjustmentNotice(input: unknown, normalized: WardrobeAssemblyConfiguration) {
  const raw = record(input)
  if (!Array.isArray(raw.sections)) return null
  const limit = wardrobeSectionLimit(normalized) - wardrobeCornerCount(normalized)
  if (
    normalized.arrangement &&
    (raw.sections.length > limit || !sameInput(raw.arrangement, normalized.arrangement))
  )
    return 'Угловая компоновка скорректирована: до 21 секции вместе с углами, минимум одна обычная секция на каждой стороне. Проверьте размеры и наполнение углов.'
  if (raw.sections.length > limit)
    return `В прямой сборке допускается до ${MAX_SECTIONS} секций. Из загруженного варианта оставлены первые ${MAX_SECTIONS}; проверьте состав сборки.`
  if (
    raw.sections.slice(0, limit).some((item, i) => {
      const value = record(item).doors
      return value !== undefined && !sameInput(value, normalized.sections[i]?.doors)
    })
  )
    return 'Параметры дверей скорректированы: ширина одной створки — до 60 см. Проверьте двери и наполнение восстановленной сборки.'
  if (
    raw.sections.slice(0, limit).some((item, i) => {
      const value = record(item).drawers
      return value !== undefined && !sameInput(value, normalized.sections[i]?.drawers)
    })
  )
    return 'Параметры ящиков скорректированы по размерам секций и допустимым зазорам. Проверьте восстановленное наполнение.'
  if (
    raw.sections.slice(0, limit).some((item, i) => record(item).rod === true && !normalized.sections[i]?.rod)
  ) {
    return 'Штанги в секциях ниже 150 см удалены по новым правилам. Проверьте оставшиеся полки; размеры и материалы сохранены в допустимых пределах.'
  }
  if (
    raw.sections
      .slice(0, limit)
      .some(
        (item, i) =>
          typeof record(item).shelves === 'number' &&
          Number(record(item).shelves) > (normalized.sections[i]?.shelves ?? 0),
      )
  ) {
    return 'Количество полок скорректировано по высоте секций и допустимым зазорам. Проверьте наполнение восстановленной сборки.'
  }
  if (
    raw.sections
      .slice(0, limit)
      .some((item, i) =>
        (['bodyFinish', 'facadeFinish', 'hardwareFinish'] as const).some(
          (slot) => record(item)[slot] != null && record(item)[slot] !== normalized.sections[i]?.[slot],
        ),
      )
  ) {
    return 'Недоступные материалы отдельных секций заменены общими материалами сборки.'
  }
  if (
    raw.sections.slice(0, limit).some((item, i) => {
      const value = record(item).layout
      return (
        value !== undefined &&
        (!readWardrobeLayout(value) || !sameInput(readWardrobeLayout(value), normalized.sections[i]?.layout))
      )
    })
  )
    return 'Положения полок и штанг скорректированы по размерам секций, шагу 5 см и допустимым зазорам. Проверьте наполнение.'
  return null
}
