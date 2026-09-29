import type { Object3D } from 'three'
import type { MotionPartState } from '../../configurator/furnitureMotionStore'
import { isVisible } from '../furniture/furnitureMotion'

export type DrawerMotionEntry = { id: string; node: Object3D; travel: number }
type MovingDrawer = DrawerMotionEntry & { progress: number; start: number; elapsed: number; open: boolean }

// Stable section/drawer IDs keep an opening pose through resizing, reordering
// and material changes. Group origins are the closed pose; children own geometry.
export function createWardrobeDrawerMotion(root: Object3D, onChange: (parts: MotionPartState[]) => void) {
  const parts = new Map<string, MovingDrawer>()
  let reducedMotion = false, disposed = false
  const getStates = (): MotionPartState[] => [...parts.values()].map(p => ({ id: p.id, open: p.open, enabled: isVisible(p.node) }))
  const publish = () => onChange(getStates())
  const apply = () => {
    for (const p of parts.values()) p.node.position.z = p.travel * p.progress
    root.updateMatrixWorld(true)
  }
  function set(p: MovingDrawer, open: boolean, immediate = false) {
    if (p.open !== open) { p.start = p.progress; p.elapsed = 0; p.open = open }
    if (immediate || reducedMotion) p.progress = open ? 1 : 0
  }
  return {
    getStates,
    sync(entries: DrawerMotionEntry[]) {
      if (disposed) return
      const old = JSON.stringify(getStates()), keep = new Set(entries.map(p => p.id))
      for (const [id, p] of parts) if (!keep.has(id)) { p.node.position.z = 0; parts.delete(id) }
      for (const entry of entries) {
        const oldPart = parts.get(entry.id)
        if (oldPart) Object.assign(oldPart, entry)
        else parts.set(entry.id, { ...entry, progress: 0, start: 0, elapsed: 0, open: false })
      }
      apply()
      if (JSON.stringify(getStates()) !== old) publish()
    },
    findPart(object: Object3D) {
      if (disposed || !isVisible(object)) return null
      for (let node: Object3D | null = object; node && node !== root; node = node.parent) {
        const p = parts.get(node.name)
        if (p?.node === node) return p.id
      }
      return null
    },
    toggle(id: string) {
      const p = parts.get(id)
      if (disposed || !p || !isVisible(p.node)) return
      set(p, !p.open); apply(); publish()
    },
    setAll(open: boolean, immediate = false) {
      if (disposed) return
      for (const p of parts.values()) set(p, open, immediate)
      apply(); publish()
    },
    setReducedMotion(value: boolean) {
      reducedMotion = value
      if (value) { for (const p of parts.values()) set(p, p.open, true); apply() }
    },
    update(deltaSeconds: number) {
      if (disposed) return false
      let changed = false
      for (const p of parts.values()) {
        const target = p.open ? 1 : 0
        if (p.progress === target) continue
        p.elapsed += Math.max(0, Math.min(deltaSeconds, 1))
        const t = Math.min(1, p.elapsed / .48), eased = t * t * (3 - 2 * t)
        p.progress = t === 1 ? target : p.start + (target - p.start) * eased
        changed = true
      }
      if (changed) apply()
      return changed
    },
    dispose() {
      disposed = true
      for (const p of parts.values()) p.node.position.z = 0
      parts.clear()
    },
  }
}
