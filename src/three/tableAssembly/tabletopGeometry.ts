import { BufferGeometry, Float32BufferAttribute, Vector2, Vector3 } from 'three'
import type { TableAssemblyConfiguration } from '../../configurator/tableAssembly/state'
import { createTabletopEdgeProfile } from './tabletopEdgeProfile'

import { createTabletopOutline as createOutline } from '../../configurator/tableAssembly/outline'
export { CORNER_RADIUS } from '../../configurator/tableAssembly/outline'

export function createTabletopOutline(config: Pick<TableAssemblyConfiguration, 'shape' | 'length' | 'width'>): Vector2[] {
  return createOutline(config).map(({ x, y }) => new Vector2(x, y))
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
  const profile = createTabletopEdgeProfile(config.edgeProfile, config.thickness)
  const ringContours = profile.map((ring) => outline.map((p, i) => {
    const direction = cornerNormals[i]
    return p.clone().addScaledVector(direction, -ring.inset / direction.dot(normals[i]))
  }))
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
    const contour = ny > 0 ? ringContours.at(-1)! : ringContours[0]
    for (let i = 0; i < count; i++) {
      const a = contour[i]
      const b = contour[(i + 1) % count]
      for (const p of ny > 0 ? [center, b, a] : [center, a, b]) vertex(p, y, normal, p.x + 0.5, p.y + 0.5)
    }
    geometry.addGroup(start, positions.length / 3 - start, material)
  }

  const edgeStart = positions.length / 3
  const perimeter = outline.reduce((sum, p, i) => sum + p.distanceTo(outline[(i + 1) % count]), 0)
  let distance = -perimeter / 2
  for (let i = 0; i < count; i++) {
    const j = (i + 1) % count
    const end = distance + outline[i].distanceTo(outline[j])
    for (let band = 0; band < profile.length - 1; band++) {
      const lower = profile[band]
      const upper = profile[band + 1]
      const bandNormal = new Vector2(upper.y - lower.y, upper.inset - lower.inset).normalize()
      const normal = (index: number, ring: number) => {
        const outward = smooth ? cornerNormals[index] : normals[i]
        const section = profile[ring].normal ?? bandNormal
        return new Vector3(outward.x * section.x, section.y, outward.y * section.x).normalize()
      }
      // Независимая развёртка торца: U — метры периметра, V — метры профиля кромки.
      for (const [index, ring, u] of [[i, band, distance], [j, band + 1, end], [j, band, end], [i, band, distance], [i, band + 1, distance], [j, band + 1, end]]) {
        let edgeU = u + 0.5
        let edgeV = profile[ring].distance + 0.5
        if (config.edgeProfile === 'bullnose') {
          // Разворачиваем торец наружу от границы верхней плоскости по длине дуги.
          // В верхнем стыке UV точно совпадают с плоскостью, включая угол рисунка.
          // Общая биссектриса также сохраняет непрерывность на срезанных углах.
          const direction = cornerNormals[index]
          const travel = profile.at(-1)!.distance - profile[ring].distance
          const unfolded = ringContours.at(-1)![index].clone()
            .addScaledVector(direction, travel / direction.dot(normals[index]))
          edgeU = unfolded.x + 0.5
          edgeV = unfolded.y + 0.5
        }
        vertex(ringContours[ring][index], profile[ring].y, normal(index, ring), edgeU, edgeV)
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
