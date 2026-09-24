import { MathUtils, Quaternion, Vector3, type Object3D } from 'three'
import type { FurnitureDefinition } from './types'
import type { MotionPartState } from '../../configurator/furnitureMotionStore'

const Y = new Vector3(0, 1, 0)
const DURATION = 0.48
export function isVisible(object: Object3D) {
  for (let node: Object3D | null = object; node; node = node.parent) if (!node.visible) return false
  return true
}

export function createFurnitureMotion(root: Object3D, definition: FurnitureDefinition,
  getDimensions: () => Readonly<Record<string, number>>, onChange: (parts: MotionPartState[]) => void) {
  let reducedMotion = false
  let disposed = false
  const parts = (definition.articulations ?? []).map(spec => {
    const node = root.getObjectByName(spec.target)
    if (!node) throw new Error(`Missing articulation: ${spec.target}`)
    return { spec, node, position: node.position.clone(), quaternion: node.quaternion.clone(),
      progress: 0, start: 0, elapsed: 0, open: false }
  })
  const byNode = new Map(parts.map(part => [part.node, part]))
  const rotation = new Quaternion()
  const getStates = (): MotionPartState[] => parts.map(p => ({ id: p.spec.id, open: p.open, enabled: isVisible(p.node) }))
  const publish = () => onChange(getStates())
  function apply() {
    for (const p of parts) {
      p.node.position.copy(p.position)
      p.node.quaternion.copy(p.quaternion)
      if (p.spec.kind === 'door') {
        rotation.setFromAxisAngle(Y, MathUtils.degToRad(p.spec.angle) * p.progress)
        p.node.quaternion.multiply(rotation)
      } else {
        const t = p.spec.travel
        const delta = (getDimensions()[t.dimension] ?? definition.dimensions[t.dimension].base) - definition.dimensions[t.dimension].base
        const travel = Math.max(0, Math.min(t.max, (t.baseLength + delta * t.factor) * t.ratio))
        p.node.position.z += travel * p.progress
      }
    }
    root.updateMatrixWorld(true)
  }
  function setPart(p: typeof parts[number], open: boolean, immediate: boolean) {
    if (open && !isVisible(p.node)) return
    if (p.open !== open) { p.start = p.progress; p.elapsed = 0; p.open = open }
    if (immediate || reducedMotion) p.progress = open ? 1 : 0
  }
  return {
    getStates,
    // Nearest hit must be resolved first, so a carcass panel blocks doors behind it.
    findPart(object: Object3D) {
      if (disposed || !isVisible(object)) return null
      for (let node: Object3D | null = object; node; node = node.parent) {
        const p = byNode.get(node)
        if (p) return p.spec.id
        if (node === root) break
      }
      return null
    },
    toggle(id: string) {
      if (disposed) return
      const p = parts.find(p => p.spec.id === id)
      if (!p || !isVisible(p.node)) return
      setPart(p, !p.open, false); apply(); publish()
    },
    setAll(open: boolean, immediate = false) {
      if (disposed) return
      for (const p of parts) setPart(p, open, immediate)
      apply(); publish()
    },
    syncVisibility() {
      for (const p of parts) if (!isVisible(p.node)) setPart(p, false, true)
      apply(); publish()
    },
    setReducedMotion(value: boolean) {
      reducedMotion = value
      if (value) { for (const p of parts) p.progress = p.open ? 1 : 0; apply() }
    },
    update(deltaSeconds: number) {
      if (disposed) return
      let changed = false
      for (const p of parts) {
        const target = p.open ? 1 : 0
        if (p.progress === target) continue
        p.elapsed += Math.max(0, deltaSeconds)
        const t = Math.min(1, p.elapsed / DURATION)
        const eased = t * t * (3 - 2 * t)
        p.progress = t === 1 ? target : p.start + (target - p.start) * eased
        changed = true
      }
      if (changed) apply()
      return changed
    },
    // Dimension/UV controllers own closed transforms. Never let them capture a
    // partly opened pose, including when an async finish refresh completes.
    withClosedPose(action: () => void) {
      if (disposed) return
      for (const p of parts) { p.node.position.copy(p.position); p.node.quaternion.copy(p.quaternion) }
      try { action() } finally {
        for (const p of parts) { p.position.copy(p.node.position); p.quaternion.copy(p.node.quaternion) }
        apply()
      }
    },
    dispose() {
      disposed = true
      for (const p of parts) { p.node.position.copy(p.position); p.node.quaternion.copy(p.quaternion) }
    },
  }
}
export type FurnitureMotion = ReturnType<typeof createFurnitureMotion>
