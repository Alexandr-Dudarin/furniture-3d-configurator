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
  if (profile.kind === 'bullnose') {
    // Более узкий полуэллипс вместо выпуклого полукруга R=T/2.
    // ID сохраняется для совместимости с уже сохранёнными сборками.
    const horizontal = Math.min(thickness / 4, 0.01)
    const vertical = thickness / 2
    const rings: ProfileRing[] = []
    const segments = 32
    const speed = (angle: number) => Math.hypot(horizontal * Math.cos(angle), vertical * Math.sin(angle))
    let distance = 0
    for (let i = 0; i <= segments; i++) {
      const angle = i * Math.PI / segments
      if (i > 0) {
        // Длина дуги эллипса по Симпсону; UV не сплющиваются у вертикального торца.
        const start = (i - 1) * Math.PI / segments
        distance += (angle - start) / 6 * (speed(start) + 4 * speed((start + angle) / 2) + speed(angle))
      }
      rings.push({
        inset: horizontal * (1 - Math.sin(angle)), y: vertical * (1 - Math.cos(angle)), distance,
        normal: new Vector2(vertical * Math.sin(angle), -horizontal * Math.cos(angle)).normalize(),
      })
    }
    return rings
  }
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
  const radius = profile.size
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
  // Начальное кольцо верхней дуги уже добавлено вместе с прямым участком.
  for (let i = 1; i <= ROUND_SEGMENTS; i++) {
    const angle = i * Math.PI / (2 * ROUND_SEGMENTS)
    rings.push({
      inset: radius * (1 - Math.cos(angle)), y: thickness - radius + radius * Math.sin(angle),
      distance: upperStart + radius * angle, normal: new Vector2(Math.cos(angle), Math.sin(angle)),
    })
  }
  return rings
}
