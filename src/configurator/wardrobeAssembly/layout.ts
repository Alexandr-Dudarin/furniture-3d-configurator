// Physical dimensions in metres. Manual shelf heights refer to their LOWER
// surface; rod height refers to its axis. Floor of the whole section is y=0.
export const PANEL_THICKNESS = .016
export const BACK_THICKNESS = .004
export const PLINTH_HEIGHT = .07
export const MIN_SHELF_CLEARANCE = .2
export const MIN_ROD_CLEARANCE = .6
export const ROD_RADIUS = .0125
export const MIN_ROD_SECTION_HEIGHT = 1.5
export const MIN_ROD_AXIS_HEIGHT = 1.2
export const FILLING_POSITION_STEP = .05
const ROD_TOP_CLEARANCE = .08
const EPSILON = 1e-8
const bottom = PLINTH_HEIGHT + PANEL_THICKNESS
const round = (n: number) => Number(n.toFixed(8))
const up = (n: number) => round(Math.ceil((n - EPSILON) / FILLING_POSITION_STEP) * FILLING_POSITION_STEP)
const down = (n: number) => round(Math.floor((n + EPSILON) / FILLING_POSITION_STEP) * FILLING_POSITION_STEP)
const nearest = (n: number) => round(Math.round(n / FILLING_POSITION_STEP) * FILLING_POSITION_STEP)
export type WardrobeLayout = { shelves: number[]; rod?: number }
export type WardrobeDrawers = { count: number; height: number; placement?: 'recessed' | 'flush' }
export const DRAWER_HEIGHTS = [.2, .25, .3] as const
export const MAX_DRAWERS = 4
export type WardrobeFilling = { height: number; shelves: number; rod: boolean; layout?: WardrobeLayout; drawers?: WardrobeDrawers }
// Top surface of the fixed lid above the drawer block, or of the bottom board.
export function wardrobeFillingFloor(section: { drawers?: WardrobeDrawers }): number {
  return round(bottom + (section.drawers ? section.drawers.count * section.drawers.height + PANEL_THICKNESS : 0))
}
export function wardrobeDrawerLimit(height: number, rod: boolean, rowHeight: number): number {
  // Reserve usable space above the lid. With a rod also reserve the 5 cm grid
  // so entering manual mode never makes an otherwise empty hanging bay invalid.
  const rodCeiling = down(height - PANEL_THICKNESS - ROD_TOP_CLEARANCE)
  const maxFloor = rod ? rodCeiling - MIN_ROD_CLEARANCE - ROD_RADIUS : height - PANEL_THICKNESS - MIN_SHELF_CLEARANCE
  return Math.max(0, Math.min(MAX_DRAWERS, Math.floor((maxFloor - bottom - PANEL_THICKNESS + EPSILON) / rowHeight)))
}
export type PositionRange = { min: number; max: number }
export function wardrobeCanHaveRod(height: number) { return height >= MIN_ROD_SECTION_HEIGHT }
export function wardrobeRodY(input: number | WardrobeFilling): number {
  const height = typeof input === 'number' ? input : input.height
  if (typeof input !== 'number' && input.layout?.rod !== undefined) return input.layout.rod
  const floor = typeof input === 'number' ? bottom : wardrobeFillingFloor(input)
  return Math.max(height - .38, MIN_ROD_AXIS_HEIGHT, floor + MIN_ROD_CLEARANCE + ROD_RADIUS)
}
export function wardrobeShelfLimit(height: number, rod: boolean, drawers?: WardrobeDrawers) {
  const floor = wardrobeFillingFloor({ drawers })
  if (rod) {
    const y = wardrobeRodY({ height, rod, shelves: 0, drawers })
    if (height - .26 - PANEL_THICKNESS / 2 - y < ROD_TOP_CLEARANCE - EPSILON) return 0
    const lowerTop = floor + MIN_SHELF_CLEARANCE + PANEL_THICKNESS
    return y - ROD_RADIUS - lowerTop >= MIN_ROD_CLEARANCE - EPSILON ? 2 : 1
  }
  const inside = height - PANEL_THICKNESS - floor
  return Math.max(0, Math.min(6, Math.floor((inside - MIN_SHELF_CLEARANCE + EPSILON) / (MIN_SHELF_CLEARANCE + PANEL_THICKNESS))))
}
export function wardrobeShelfYs(section: WardrobeFilling): number[] {
  if (section.layout) return section.layout.shelves.map(y => y + PANEL_THICKNESS / 2)
  const floor = wardrobeFillingFloor(section)
  const { height, rod } = section, count = Math.min(section.shelves, wardrobeShelfLimit(height, rod, section.drawers))
  if (rod) return count === 0 ? [] : count === 1 ? [height - .26] : [height - .26, floor + MIN_SHELF_CLEARANCE + PANEL_THICKNESS / 2]
  const gap = (height - PANEL_THICKNESS - floor - count * PANEL_THICKNESS) / (count + 1)
  return Array.from({ length: count }, (_, i) => floor + gap + PANEL_THICKNESS / 2 + i * (gap + PANEL_THICKNESS))
}
export function automaticLayout(section: WardrobeFilling): WardrobeLayout {
  return { shelves: wardrobeShelfYs({ ...section, layout: undefined }).map(y => round(y - PANEL_THICKNESS / 2)),
    ...(section.rod ? { rod: wardrobeRodY({ ...section, layout: undefined }) } : {}) }
}
export function wardrobeShelfLabel(section: WardrobeFilling, index: number) {
  return section.rod ? index === 0 ? 'Верхняя полка' : 'Нижняя полка' : `Полка ${index + 1}`
}
function gridRange(min: number, max: number): PositionRange { return { min: up(min), max: down(max) } }
const within = (n: number, range: PositionRange) => Number.isFinite(n) && n >= range.min - EPSILON && n <= range.max + EPSILON
const onGrid = (n: number) => Number.isFinite(n) && Math.abs(n - nearest(n)) < EPSILON
const clampGrid = (n: number, range: PositionRange) => round(Math.max(range.min, Math.min(range.max, nearest(n))))
export function wardrobeShelfRange(section: WardrobeFilling, index: number): PositionRange {
  const floor = wardrobeFillingFloor(section)
  const layout = section.layout ?? automaticLayout(section)
  let min = floor + MIN_SHELF_CLEARANCE, max = section.height - 2 * PANEL_THICKNESS - MIN_SHELF_CLEARANCE
  if (section.rod) {
    const rod = wardrobeRodY(section)
    if (index === 0) min = Math.max(min, rod + ROD_TOP_CLEARANCE)
    else max = Math.min(max, rod - ROD_RADIUS - MIN_ROD_CLEARANCE - PANEL_THICKNESS)
  } else {
    if (index > 0) min = layout.shelves[index - 1] + PANEL_THICKNESS + MIN_SHELF_CLEARANCE
    if (index + 1 < layout.shelves.length) max = layout.shelves[index + 1] - PANEL_THICKNESS - MIN_SHELF_CLEARANCE
  }
  return gridRange(min, max)
}
export function wardrobeRodRange(section: WardrobeFilling): PositionRange {
  const floor = wardrobeFillingFloor(section)
  const layout = section.layout ?? automaticLayout(section)
  const belowTop = section.shelves >= 2 ? layout.shelves[1] + PANEL_THICKNESS : floor
  const aboveBottom = section.shelves >= 1 ? layout.shelves[0] : section.height - PANEL_THICKNESS
  return gridRange(Math.max(MIN_ROD_AXIS_HEIGHT, belowTop + MIN_ROD_CLEARANCE + ROD_RADIUS), aboveBottom - ROD_TOP_CLEARANCE)
}
export function isValidWardrobeLayout(section: WardrobeFilling, layout: WardrobeLayout): boolean {
  if (layout.shelves.length !== section.shelves || layout.shelves.some(n => !onGrid(n))) return false
  if (section.rod ? layout.rod === undefined || !onGrid(layout.rod) : layout.rod !== undefined) return false
  const candidate = { ...section, layout }
  return layout.shelves.every((y, i) => within(y, wardrobeShelfRange(candidate, i))) &&
    (!section.rod || within(layout.rod!, wardrobeRodRange(candidate)))
}
export function readWardrobeLayout(input: unknown): WardrobeLayout | undefined {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return undefined
  const raw = input as Record<string, unknown>
  if (!Array.isArray(raw.shelves) || raw.shelves.length > 6 || raw.shelves.some(y => typeof y !== 'number' || !Number.isFinite(y))) return undefined
  if (raw.rod !== undefined && (typeof raw.rod !== 'number' || !Number.isFinite(raw.rod))) return undefined
  return { shelves: [...raw.shelves] as number[], ...(typeof raw.rod === 'number' ? { rod: raw.rod } : {}) }
}
// Fit to the grid without collisions. Exact valid manual layouts remain exact.
// The caller decides whether a required adjustment needs confirmation.
export function fitWardrobeLayout(section: WardrobeFilling, targets = automaticLayout(section), preserve: { shelves: number[]; rod?: boolean } = { shelves: [] }): WardrobeLayout | null {
  const floor = wardrobeFillingFloor(section)
  const defaults = automaticLayout(section)
  const wanted = defaults.shelves.map((y, i) => Math.max(0, Math.min(section.height, targets.shelves[i] ?? y)))
  if (!section.rod) {
    const bounds = gridRange(floor + MIN_SHELF_CLEARANCE, section.height - 2 * PANEL_THICKNESS - MIN_SHELF_CLEARANCE)
    const spacing = up(PANEL_THICKNESS + MIN_SHELF_CLEARANCE)
    if (section.shelves && bounds.min + (section.shelves - 1) * spacing > bounds.max + EPSILON) return null
    const shelves: number[] = []
    for (const [i, value] of wanted.entries()) {
      shelves.push(clampGrid(value, { min: i ? shelves[i - 1] + spacing : bounds.min, max: bounds.max - (wanted.length - 1 - i) * spacing }))
    }
    return { shelves }
  }
  const rodBounds = gridRange(Math.max(MIN_ROD_AXIS_HEIGHT, floor + MIN_ROD_CLEARANCE + ROD_RADIUS), section.height - PANEL_THICKNESS - ROD_TOP_CLEARANCE)
  let best: WardrobeLayout | null = null, bestScore = Infinity, bestExistingScore = Infinity
  for (let rod = rodBounds.min; rod <= rodBounds.max + EPSILON; rod = round(rod + FILLING_POSITION_STEP)) {
    const candidate: WardrobeLayout = { shelves: [], rod }
    let valid = true
    for (const [i, y] of wanted.entries()) {
      const range = wardrobeShelfRange({ ...section, layout: candidate }, i)
      if (range.min > range.max + EPSILON) { valid = false; break }
      candidate.shelves.push(clampGrid(y, range))
    }
    if (!valid || !isValidWardrobeLayout(section, candidate)) continue
    const score = (rod - Math.max(0, Math.min(section.height, targets.rod ?? defaults.rod!))) ** 2 + candidate.shelves.reduce((sum, y, i) => sum + (y - wanted[i]) ** 2, 0)
    // Existing positions have priority over a new part's suggested position.
    // In particular, lower a new rod instead of lifting its existing shelf.
    const existingScore = preserve.shelves.reduce((sum, i) => sum + (candidate.shelves[i] - wanted[i]) ** 2, 0)
      + (preserve.rod ? (rod - targets.rod!) ** 2 : 0)
    if (existingScore < bestExistingScore - EPSILON || (Math.abs(existingScore - bestExistingScore) < EPSILON && score < bestScore - EPSILON)) {
      best = candidate; bestScore = score; bestExistingScore = existingScore
    }
  }
  return best
}
export function wardrobeManualShelfLimit(height: number, rod: boolean, drawers?: WardrobeDrawers): number {
  for (let count = wardrobeShelfLimit(height, rod, drawers); count >= 0; count--) {
    if (fitWardrobeLayout({ height, shelves: count, rod, drawers })) return count
  }
  return 0
}
export function wardrobeSectionShelfLimit(section: WardrobeFilling) {
  return section.layout ? wardrobeManualShelfLimit(section.height, section.rod, section.drawers) : wardrobeShelfLimit(section.height, section.rod, section.drawers)
}
// Insert into any free interval, keeping every existing shelf in place. Check
// remaining capacity before each choice: splitting a gap at its centre alone
// can make the next shelf impossible even though the original gap could fit it.
function insertShelves(section: WardrobeFilling, existing: number[]): number[] | null {
  const floor = wardrobeFillingFloor(section)
  let shelves = [...existing].sort((a, b) => a - b)
  if (!isValidWardrobeLayout({ ...section, shelves: shelves.length, rod: false }, { shelves })) return null
  const spacing = up(PANEL_THICKNESS + MIN_SHELF_CLEARANCE)
  const intervals = (positions: number[]) => Array.from({ length: positions.length + 1 }, (_, i) => {
    const below = i ? positions[i - 1] + PANEL_THICKNESS : floor
    const above = i < positions.length ? positions[i] : section.height - PANEL_THICKNESS
    return { ...gridRange(below + MIN_SHELF_CLEARANCE, above - PANEL_THICKNESS - MIN_SHELF_CLEARANCE), below, above }
  })
  const capacity = (positions: number[]) => intervals(positions).reduce((sum, { min, max }) =>
    sum + (max < min - EPSILON ? 0 : Math.floor((max - min + EPSILON) / spacing) + 1), 0)
  if (capacity(shelves) < section.shelves - shelves.length) return null
  while (shelves.length < section.shelves) {
    let best: number[] | null = null, bestGap = -Infinity
    for (const { min, max, below, above } of intervals(shelves)) {
      for (let y = min; y <= max + EPSILON; y = round(y + FILLING_POSITION_STEP)) {
        const candidate = [...shelves, y].sort((a, b) => a - b)
        if (capacity(candidate) < section.shelves - candidate.length) continue
        const gap = Math.min(y - below, above - y - PANEL_THICKNESS)
        if (gap > bestGap + EPSILON) { best = candidate; bestGap = gap }
      }
    }
    if (!best) return null
    shelves = best
  }
  return shelves
}
// Preserve physical shelves across filling changes. With a rod the array is
// upper/lower; without a rod it is bottom-to-top, matching labels in the UI.
export function wardrobeLayoutTargets(current: WardrobeFilling, next: WardrobeFilling): WardrobeLayout {
  const old = current.layout ?? automaticLayout(current), defaults = automaticLayout(next)
  let shelves = [...old.shelves]
  if (current.rod && !next.rod) shelves.sort((a, b) => a - b)
  else if (!current.rod && next.rod) shelves = shelves.length ? [shelves.at(-1)!] : []
  if (!next.rod && next.shelves > shelves.length) {
    const inserted = insertShelves(next, shelves)
    if (inserted) return { shelves: inserted }
  }
  return { shelves: defaults.shelves.map((y, i) => shelves[i] ?? y),
    ...(next.rod ? { rod: current.rod ? old.rod : defaults.rod } : {}) }
}
export function fitWardrobeLayoutChange(current: WardrobeFilling, next: WardrobeFilling) {
  const targets = wardrobeLayoutTargets(current, next)
  const old = current.layout ?? automaticLayout(current)
  return fitWardrobeLayout(next, targets, {
    shelves: targets.shelves.flatMap((y, i) => old.shelves.includes(y) ? [i] : []),
    rod: current.rod && next.rod,
  })
}
export function wardrobeLayoutAdjustments(current: WardrobeFilling, next: WardrobeFilling) {
  if (!current.layout) return []
  const targets = wardrobeLayoutTargets(current, next), actual = next.layout ?? automaticLayout(next)
  const changes: { label: string; before: number; after: number }[] = []
  actual.shelves.forEach((y, i) => {
    const before = targets.shelves[i]
    if (current.layout!.shelves.includes(before) && Math.abs(y - before) > EPSILON) changes.push({ label: wardrobeShelfLabel(next, i), before, after: y })
  })
  if (current.rod && next.rod && Math.abs(actual.rod! - current.layout.rod!) > EPSILON) changes.push({ label: 'Ось штанги', before: current.layout.rod!, after: actual.rod! })
  return changes
}
export function wardrobeFreeSpaceBelow(section: WardrobeFilling, index: number): number {
  const floor = wardrobeFillingFloor(section)
  const shelves = (section.layout ?? automaticLayout(section)).shelves
  const y = shelves[index], below = shelves.filter(value => value < y).sort((a, b) => a - b).at(-1)
  return round(y - (below === undefined ? floor : below + PANEL_THICKNESS))
}
