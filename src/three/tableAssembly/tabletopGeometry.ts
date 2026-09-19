import { BufferGeometry, Float32BufferAttribute, Vector2, Vector3 } from 'three'
import type { TableAssemblyConfiguration } from '../../configurator/tableAssembly/state'

export const TABLETOP_BEVEL = 0.001
export const CORNER_RADIUS = 0.1

// Контур задаёт внешние размеры. Скос кромки строится внутрь, а не увеличивает габарит.
export function createTabletopOutline(config: Pick<TableAssemblyConfiguration, 'shape' | 'length' | 'width'>): Vector2[] {
  const { shape, length, width } = config
  const x = length / 2
  const z = width / 2
  if (shape === 'circle' || shape === 'ellipse') {
    return Array.from({ length: 128 }, (_, i) => {
      const a = -Math.PI / 2 + i * Math.PI * 2 / 128
      return new Vector2(Math.cos(a) * x, Math.sin(a) * (shape === 'circle' ? x : z))
    })
  }
  if (shape === 'rounded-rectangle' || shape === 'capsule') {
    const radius = shape === 'capsule' ? z : CORNER_RADIUS
    const points: Vector2[] = []
    for (const [cx, cz, start] of [[x - radius, z - radius, 0], [-x + radius, z - radius, Math.PI / 2], [-x + radius, -z + radius, Math.PI], [x - radius, -z + radius, Math.PI * 1.5]]) {
      for (let i = 0; i <= 32; i++) {
        const a = start + i * Math.PI / 64
        const p = new Vector2(cx + radius * Math.cos(a), cz + radius * Math.sin(a))
        if (!points.length || points.at(-1)!.distanceTo(p) > 1e-8) points.push(p)
      }
    }
    if (points[0].distanceTo(points.at(-1)!) < 1e-8) points.pop()
    return points
  }
  if (shape === 'chamfered' || shape === 'wide-chamfered') {
    const cut = shape === 'chamfered' ? 0.08 : 0.2
    return [[x, -z + cut], [x, z - cut], [x - cut, z], [-x + cut, z], [-x, z - cut], [-x, -z + cut], [-x + cut, -z], [x - cut, -z]].map(([px, pz]) => new Vector2(px, pz))
  }
  return [new Vector2(x, -z), new Vector2(x, z), new Vector2(-x, z), new Vector2(-x, -z)]
}

export function createTabletopGeometry(config: TableAssemblyConfiguration) {
  const outline = createTabletopOutline(config)
  const count = outline.length
  const normals = outline.map((p, i) => {
    const next = outline[(i + 1) % count].clone().sub(p).normalize()
    return new Vector2(next.y, -next.x)
  })
  const smooth = ['circle', 'ellipse', 'capsule', 'rounded-rectangle'].includes(config.shape)
  const cornerNormals = normals.map((normal, i) => normal.clone().add(normals[(i + count - 1) % count]).normalize())
  const inset = outline.map((p, i) => {
    const direction = cornerNormals[i]
    return p.clone().addScaledVector(direction, -TABLETOP_BEVEL / direction.dot(normals[i]))
  })
  const positions: number[] = []
  const uv: number[] = []
  const vertexNormals: number[] = []
  const geometry = new BufferGeometry()
  const vertex = (p: Vector2, y: number, normal: Vector3, u: number, v: number) => {
    positions.push(p.x, y, p.y)
    vertexNormals.push(normal.x, normal.y, normal.z)
    uv.push(u, v)
  }
  const center = new Vector2()
  // X/Z-проекция: одна UV-единица на метр, рисунок привязан к центру.
  for (const [y, ny, material] of [[config.thickness, 1, 0], [0, -1, 1]]) {
    const start = positions.length / 3
    const normal = new Vector3(0, ny, 0)
    for (let i = 0; i < count; i++) {
      const a = inset[i]
      const b = inset[(i + 1) % count]
      for (const p of ny > 0 ? [center, b, a] : [center, a, b]) vertex(p, y, normal, p.x + 0.5, p.y + 0.5)
    }
    geometry.addGroup(start, positions.length / 3 - start, material)
  }

  const edgeStart = positions.length / 3
  const b = TABLETOP_BEVEL
  const ringContours = [inset, outline, outline, inset]
  const levels = [0, b, config.thickness - b, config.thickness]
  const edgeV = [0, Math.SQRT2 * b, Math.SQRT2 * b + config.thickness - 2 * b, 2 * Math.SQRT2 * b + config.thickness - 2 * b]
  const perimeter = outline.reduce((sum, p, i) => sum + p.distanceTo(outline[(i + 1) % count]), 0)
  let distance = -perimeter / 2
  for (let i = 0; i < count; i++) {
    const j = (i + 1) % count
    const end = distance + outline[i].distanceTo(outline[j])
    for (let band = 0; band < 3; band++) {
      const vertical = band === 0 ? -1 : band === 2 ? 1 : 0
      const normal = (index: number) => {
        const outward = smooth ? cornerNormals[index] : normals[i]
        return new Vector3(outward.x, vertical, outward.y).normalize()
      }
      // Независимая развёртка торца: U — метры периметра, V — метры профиля кромки.
      for (const [index, ring, u] of [[i, band, distance], [j, band + 1, end], [j, band, end], [i, band, distance], [i, band + 1, distance], [j, band + 1, end]]) {
        vertex(ringContours[ring][index], levels[ring], normal(index), u + 0.5, edgeV[ring] + 0.5)
      }
    }
    distance = end
  }
  geometry.addGroup(edgeStart, positions.length / 3 - edgeStart, 2)
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('normal', new Float32BufferAttribute(vertexNormals, 3))
  geometry.setAttribute('uv', new Float32BufferAttribute(uv, 2))
  geometry.computeBoundingBox()
  geometry.computeBoundingSphere()
  return geometry
}
