import type { DiagonalProfile } from './types'
import { createSlantedGrooveGeometry, validateSlantedProfile } from './slantedGrooveGeometry'

const S = Math.SQRT1_2
export type DiagonalGroove = { offset: number; start: number; end: number }

/** A fixed 45° lattice, clipped to safe fields. Capsule ends never get sliced. */
export function diagonalLayout(width: number, height: number, profile: DiagonalProfile, clearCenter = 0) {
  const radius = profile.width / 2
  const x = width / 2 - profile.margin, y = height / 2 - profile.endMargin
  const regions = clearCenter > 0 ? [[-x, -clearCenter / 2], [clearCenter / 2, x]] : [[-x, x]]
  const count = Math.max(0, Math.floor((x + y) * S / profile.pitch))
  const grooves: DiagonalGroove[] = []
  for (let k = -count; k <= count; k++) {
    const offset = k * profile.pitch
    for (const [left, right] of regions) {
      if (right - left <= 2 * radius || y <= radius) continue
      // x = (t + offset)/sqrt(2), y = (t - offset)/sqrt(2).
      // Inset by the capsule radius before clipping the centre segment.
      const start = Math.max((left + radius) / S - offset, (-y + radius) / S + offset)
      const end = Math.min((right - radius) / S - offset, (y - radius) / S + offset)
      if (end - start + profile.width >= profile.minLength && end > start) grooves.push({ offset, start, end })
    }
  }
  return grooves
}

/** Recessed capsules, a planar face between them, bevel, edges and rear plane. */
export function createDiagonalGeometry(width: number, height: number, thickness: number,
  bevel: number, profile: DiagonalProfile, clearCenter = 0) {
  validateSlantedProfile(width, height, thickness, bevel, profile, clearCenter)
  return createSlantedGrooveGeometry(width, height, thickness, bevel, profile,
    diagonalLayout(width, height, profile, clearCenter), 'diagonal')
}
