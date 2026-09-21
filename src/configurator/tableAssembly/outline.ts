import type { TableAssemblyConfiguration } from './state'

export type OutlinePoint = { x: number; y: number }
const point = (x: number, y: number): OutlinePoint => ({ x, y })
const distance = (a: OutlinePoint, b: OutlinePoint) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)

export const CORNER_RADIUS = 0.1

// Контур задаёт внешние размеры. Скос кромки строится внутрь, а не увеличивает габарит.
export function createTabletopOutline(config: Pick<TableAssemblyConfiguration, 'shape' | 'length' | 'width'>): OutlinePoint[] {
  const { shape, length, width } = config
  const x = length / 2
  const z = width / 2
  if (shape === 'circle' || shape === 'ellipse') {
    return Array.from({ length: 128 }, (_, i) => {
      const a = -Math.PI / 2 + i * Math.PI * 2 / 128
      return point(Math.cos(a) * x, Math.sin(a) * (shape === 'circle' ? x : z))
    })
  }
  if (shape === 'rounded-rectangle' || shape === 'capsule') {
    const radius = shape === 'capsule' ? z : CORNER_RADIUS
    const points: OutlinePoint[] = []
    for (const [cx, cz, start] of [[x - radius, z - radius, 0], [-x + radius, z - radius, Math.PI / 2], [-x + radius, -z + radius, Math.PI], [x - radius, -z + radius, Math.PI * 1.5]]) {
      for (let i = 0; i <= 32; i++) {
        const a = start + i * Math.PI / 64
        const p = point(cx + radius * Math.cos(a), cz + radius * Math.sin(a))
        if (!points.length || distance(points.at(-1)!, p) > 1e-8) points.push(p)
      }
    }
    if (distance(points[0], points.at(-1)!) < 1e-8) points.pop()
    return points
  }
  if (shape === 'chamfered' || shape === 'wide-chamfered') {
    const cut = shape === 'chamfered' ? 0.08 : 0.2
    return [[x, -z + cut], [x, z - cut], [x - cut, z], [-x + cut, z], [-x, z - cut], [-x, -z + cut], [-x + cut, -z], [x - cut, -z]].map(([px, pz]) => point(px, pz))
  }
  return [point(x, -z), point(x, z), point(-x, z), point(-x, -z)]
}

