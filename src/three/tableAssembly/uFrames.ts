import { Mesh, type Group } from 'three'
import type { TableBaseDefinition } from '../../configurator/tableAssembly/catalog'
import type { TableAssemblyConfiguration } from '../../configurator/tableAssembly/state'

// Прямой профиль: торцевые полосы переносятся, удлиняется только середина.
// Начальный GLB может делить одну геометрию между несколькими стойками/рамами.
function captureSegment(model: Group, name: string, axis: 'y' | 'z', endBand: number) {
  const mesh = model.getObjectByName(name)
  if (!(mesh instanceof Mesh)) throw new Error(`Missing frame segment: ${name}`)
  const geometry = mesh.geometry
  geometry.computeBoundingBox()
  const min = geometry.boundingBox!.min[axis]
  const length = geometry.boundingBox!.max[axis] - min
  const source = geometry.getAttribute('position')
  const original = Float32Array.from({ length: source.count }, (_, i) => axis === 'y' ? source.getY(i) : source.getZ(i))
  if (length <= 2 * endBand) throw new Error(`Frame segment too short: ${name}`)
  let previousDelta = Number.NaN
  return {
    mesh, length,
    stretch(delta: number, centered: boolean) {
      if (delta === previousDelta) return
      if (length + delta <= 2 * endBand) throw new Error(`Invalid frame segment length: ${name}`)
      const position = geometry.getAttribute('position')
      for (let i = 0; i < original.length; i++) {
        const value = original[i]
        const weight = Math.min(1, Math.max(0, (value - min - endBand) / (length - 2 * endBand)))
        const next = value + delta * (weight - (centered ? 0.5 : 0))
        if (axis === 'y') position.setY(i, next)
        else position.setZ(i, next)
      }
      position.needsUpdate = true
      // Сечение и направления прямых граней не меняются; фаски только переносятся.
      geometry.computeBoundingBox()
      geometry.computeBoundingSphere()
      previousDelta = delta
    },
  }
}

export function createUFrameController(model: Group, base: TableBaseDefinition) {
  const layout = base.uFrames
  if (!layout) return null
  // Все исходные вершины захватываем до первого изменения общей геометрии.
  const frames = layout.targets.map(({ frame: name, posts, rail }) => {
    const frame = model.getObjectByName(name)
    if (!frame) throw new Error(`Missing U-frame: ${name}`)
    return {
      frame, sideX: Math.sign(frame.position.x),
      posts: posts.map((target) => {
        const segment = captureSegment(model, target, 'y', layout.endBand)
        return { ...segment, sideZ: Math.sign(segment.mesh.position.z) }
      }),
      rail: captureSegment(model, rail, 'z', layout.endBand),
    }
  })
  return (config: TableAssemblyConfiguration) => {
    const inset = layout.insetByShape[config.shape]
    if (inset === undefined) throw new Error(`Unsupported U-frame shape: ${config.shape}`)
    const halfSpread = config.width / 2 - inset
    for (const { frame, sideX, posts, rail } of frames) {
      frame.position.x = sideX * (config.length / 2 - inset)
      for (const post of posts) {
        post.mesh.position.z = post.sideZ * halfSpread
        post.stretch(config.baseHeight - base.sourceHeight, false)
      }
      // Перекладина до внешних граней стоек; одинаковый профиль 25 × 25 мм.
      rail.stretch(2 * halfSpread + layout.postSection - rail.length, true)
    }
  }
}
