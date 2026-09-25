import type { FacadeComposition, HerringboneProfile } from './types'
import { herringboneLayout } from './herringboneGeometry'
import { createSlantedGrooveGeometry, validateSlantedProfile } from './slantedGrooveGeometry'
import type { SlantedGroove } from './slantedGrooveGeometry'

const S = Math.SQRT1_2

/** Clip one shared chevron to each panel's safe mounting field. Offsets include
 * the actual gaps and unequal panel heights, never the number of panel cells.
 * Rounded ends and the physical groove profile are preserved at every edge.
 */
export function composedHerringboneLayout(width: number, height: number, profile: HerringboneProfile,
  composition: FacadeComposition, clearCenter = 0): SlantedGroove[] {
  if (Object.values(composition).some(n => !Number.isFinite(n)) ||
      composition.width <= 0 || composition.height <= 0 || !Number.isFinite(clearCenter) || clearCenter < 0) {
    throw new Error('Invalid facade composition')
  }
  const { x: cx, y: cy } = composition, radius = profile.width / 2
  const x = width / 2 - profile.margin, y = height / 2 - profile.endMargin
  const regions = clearCenter > 0 ? [[-x, -clearCenter / 2], [clearCenter / 2, x]] : [[-x, x]]
  const grooves: SlantedGroove[] = []
  for (const groove of herringboneLayout(composition.width, composition.height, profile)) {
    const sign = groove.mirror ? -1 : 1
    const across = (sign * cx - cy) * S, along = (sign * cx + cy) * S
    const offset = groove.offset - across
    for (const [l, r] of regions) {
      const left = groove.mirror ? -r : l, right = groove.mirror ? -l : r
      if (right - left <= 2 * radius || y <= radius) continue
      const start = Math.max(groove.start - along, (left + radius) / S - offset, (-y + radius) / S + offset)
      const end = Math.min(groove.end - along, (right - radius) / S - offset, (y - radius) / S + offset)
      if (end > start && end - start + profile.width >= profile.minLength) grooves.push({ offset, start, end, mirror: groove.mirror })
    }
  }
  return grooves
}

export function createComposedHerringboneGeometry(width: number, height: number, thickness: number,
  bevel: number, profile: HerringboneProfile, composition: FacadeComposition, clearCenter = 0) {
  validateSlantedProfile(width, height, thickness, bevel, profile, clearCenter)
  return createSlantedGrooveGeometry(width, height, thickness, bevel, profile,
    composedHerringboneLayout(width, height, profile, composition, clearCenter), 'herringbone-wide')
}
