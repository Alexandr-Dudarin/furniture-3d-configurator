import type { HerringboneProfile } from './types'
import { diagonalLayout } from './diagonalGeometry'
import { createSlantedGrooveGeometry, validateSlantedProfile } from './slantedGrooveGeometry'
import type { SlantedGroove } from './slantedGrooveGeometry'

/** Mirror complete grooves from the left half; the centre strip remains solid. */
export function herringboneLayout(width: number, height: number, profile: HerringboneProfile, clearCenter = 0): SlantedGroove[] {
  if (!Number.isFinite(profile.centerGap) || profile.centerGap <= 0 || !Number.isFinite(clearCenter) || clearCenter < 0) {
    throw new Error('Invalid herringbone centre strip')
  }
  const gap = Math.max(profile.centerGap, clearCenter)
  return diagonalLayout(width, height, profile, gap)
    .filter(g => g.end + g.offset < 0)
    .flatMap(g => [{ ...g, mirror: false }, { ...g, mirror: true }])
}

export function createHerringboneGeometry(width: number, height: number, thickness: number,
  bevel: number, profile: HerringboneProfile, clearCenter = 0) {
  validateSlantedProfile(width, height, thickness, bevel, profile, clearCenter)
  return createSlantedGrooveGeometry(width, height, thickness, bevel, profile,
    herringboneLayout(width, height, profile, clearCenter), 'herringbone')
}
