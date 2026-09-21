import type { TopShape } from '../../configurator/tableAssembly/catalog'
import { createTabletopOutline } from '../../configurator/tableAssembly/outline'

export function ShapePreview({ shape }: { shape: TopShape }) {
  const points = createTabletopOutline({ shape, length: 1.5, width: 0.9 })
    .map((p) => `${50 + p.x * 42},${34 + p.y * 42}`).join(' ')
  // Тот же контур, что используется в сцене, без перспективного искажения.
  const circle = shape === 'circle'
  return <svg viewBox="0 0 100 68" focusable="false" aria-hidden="true">
    {circle ? <circle cx="50" cy="34" r="25" /> : <polygon points={points} />}
  </svg>
}
