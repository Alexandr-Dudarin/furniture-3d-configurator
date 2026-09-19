import { Vector2 } from 'three'
import { getTabletopEdgeProfile, type TabletopEdgeProfile } from '../../configurator/tableAssembly/catalog'

type ProfileRing = {
  inset: number
  y: number
  distance: number
  // X — наружу от контура, Y — вертикаль; у фаски нормаль задаётся полосой.
  normal?: Vector2
}

const ROUND_SEGMENTS = 8 // На четверть окружности; точка бокового габарита включена.

// Профиль всегда внутри исходного контура; низ Y=0, верх Y=thickness.
export function createTabletopEdgeProfile(id: TabletopEdgeProfile, thickness: number): ProfileRing[] {
  const profile = getTabletopEdgeProfile(id)
  if (profile.kind === 'bevel') {
    const b = profile.size
    const diagonal = b * Math.SQRT2
    return [
      { inset: b, y: 0, distance: 0 },
      { inset: 0, y: b, distance: diagonal },
      { inset: 0, y: thickness - b, distance: diagonal + thickness - 2 * b },
      { inset: b, y: thickness, distance: 2 * diagonal + thickness - 2 * b },
    ]
  }
  const radius = profile.kind === 'bullnose' ? thickness / 2 : profile.size
  const rings: ProfileRing[] = []
  for (let i = 0; i <= ROUND_SEGMENTS; i++) {
    const angle = i * Math.PI / (2 * ROUND_SEGMENTS)
    rings.push({
      inset: radius * (1 - Math.sin(angle)), y: radius * (1 - Math.cos(angle)),
      distance: radius * angle, normal: new Vector2(Math.sin(angle), -Math.cos(angle)),
    })
  }
  const middleHeight = thickness - 2 * radius
  const upperStart = Math.PI * radius / 2 + middleHeight
  if (middleHeight > 1e-9) rings.push({ inset: 0, y: thickness - radius, distance: upperStart, normal: new Vector2(1, 0) })
  // У полукруглой кромки две дуги встречаются в одном кольце, без нулевой полосы.
  for (let i = 1; i <= ROUND_SEGMENTS; i++) {
    const angle = i * Math.PI / (2 * ROUND_SEGMENTS)
    rings.push({
      inset: radius * (1 - Math.cos(angle)), y: thickness - radius + radius * Math.sin(angle),
      distance: upperStart + radius * angle, normal: new Vector2(Math.cos(angle), Math.sin(angle)),
    })
  }
  return rings
}
