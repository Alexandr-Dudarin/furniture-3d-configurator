import type { Object3D } from 'three'
import type { MotionPartState } from '../../configurator/furnitureMotionStore'
import { isVisible } from '../furniture/furnitureMotion'

export type DrawerMotionEntry = { id: string; node: Object3D; travel: number; blocked?: boolean; conflicts?: string[]; clearForDrawers?: boolean; pivot?: { origin: [number, number, number]; angle: number } }
type MovingPart = DrawerMotionEntry & { progress: number; start: number; elapsed: number; open: boolean }

// Stable section/part IDs retain poses across size/material changes. Door pivots
// are rear hinged edges; drawer group origins are the closed pose. Saved state
// contains neither animation progress nor the user's current inspection pose.
export function createWardrobeDrawerMotion(root: Object3D, onChange: (parts: MotionPartState[]) => void) {
  const parts = new Map<string, MovingPart>()
  let reducedMotion = false, disposed = false
  const obstructed = (p: MovingPart) => !!p.blocked || (!p.pivot && siblings(p).some(q => q.pivot && q.clearForDrawers === false))
  const getStates = (): MotionPartState[] => [...parts.values()].map(p => ({ id: p.id, open: p.open, enabled: isVisible(p.node) && !obstructed(p),
    ...(obstructed(p) || p.clearForDrawers === false ? { reason: 'Соседняя секция ограничивает открывание. Измените расположение, глубину секций, сторону петель или ручку.' } : {}) }))
  const publish = () => onChange(getStates())
  const siblings = (p: MovingPart) => [...parts.values()].filter(q => q.id.split('/')[0] === p.id.split('/')[0])
  const apply = () => {
    for (const p of parts.values()) {
      if (p.pivot) { p.node.position.set(...p.pivot.origin); p.node.rotation.y = p.pivot.angle * p.progress }
      else { p.node.position.set(0, 0, p.travel * p.progress); p.node.rotation.y = 0 }
    }
    root.updateMatrixWorld(true)
  }
  function set(p: MovingPart, open: boolean, immediate = false) {
    if (p.open !== open) { p.start = p.progress; p.elapsed = 0; p.open = open }
    if (immediate || reducedMotion) p.progress = open ? 1 : 0
  }
  function request(p: MovingPart, open: boolean) {
    if (open) {
      const required = !p.pivot ? [p, ...siblings(p).filter(q => q.pivot)] : [p]
      const conflicts = new Set(required.flatMap(q => q.conflicts ?? []))
      const otherSections = new Set([...conflicts].map(id => id.split('/')[0]))
      for (const q of parts.values()) if (otherSections.has(q.id.split('/')[0])) set(q, false)
    }
    // Opening a drawer opens both leaves first. Closing either leaf retracts
    // every drawer in this section before the leaf begins its swing.
    for (const q of siblings(p)) {
      if (!p.pivot && open && q.pivot) set(q, true)
      if (p.pivot && !open && !q.pivot) set(q, false)
    }
    set(p, open)
  }
  function blocked(p: MovingPart) {
    return (p.open && (p.conflicts ?? []).some(id => (parts.get(id)?.progress ?? 0) > 0)) || siblings(p).some(q => !p.pivot && p.open && q.pivot ? q.progress < 1
      : p.pivot && !p.open && !q.pivot ? q.progress > 0 : false)
  }
  return {
    getStates,
    sync(entries: DrawerMotionEntry[]) {
      if (disposed) return
      const old = JSON.stringify(getStates()), keep = new Set(entries.map(p => p.id))
      for (const [id, p] of parts) if (!keep.has(id)) { p.node.position.z = 0; p.node.rotation.y = 0; parts.delete(id) }
      for (const entry of entries) {
        const oldPart = parts.get(entry.id)
        if (oldPart) Object.assign(oldPart, { blocked: undefined, conflicts: undefined, clearForDrawers: undefined }, entry)
        else parts.set(entry.id, { ...entry, progress: 0, start: 0, elapsed: 0, open: false })
      }
      for (const p of parts.values()) if (obstructed(p)) set(p, false, true)
      // Adding/replacing a leaf while a drawer is already out must not place a
      // closed panel through it. Preserve the drawer and start the new leaf open.
      for (const p of parts.values()) if (!p.pivot && (p.progress > 0 || p.open)) {
        for (const q of siblings(p)) if (q.pivot && (p.open || q.progress < 1)) set(q, true, p.progress > 0)
      }
      // A layout edit may bring two previously open sections together. Close
      // conflicting poses immediately while rebuilding, before the next frame.
      for (const p of parts.values()) if (p.progress > 0) for (const id of p.conflicts ?? []) {
        const q = parts.get(id)
        if (q && q.progress > 0) for (const sibling of siblings(q)) set(sibling, false, true)
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
      if (disposed || !p || !isVisible(p.node) || obstructed(p)) return
      request(p, !p.open); apply(); publish()
    },
    setAll(open: boolean, immediate = false) {
      if (disposed) return
      const accepted = new Set<string>()
      for (const p of parts.values()) {
        const required = !p.pivot ? [p, ...siblings(p).filter(q => q.pivot)] : [p]
        const allowed = open && !obstructed(p) && !required.some(q => (q.conflicts ?? []).some(id => accepted.has(id)))
        set(p, allowed, immediate)
        if (allowed) for (const q of required) accepted.add(q.id)
      }
      apply(); publish()
    },
    setReducedMotion(value: boolean) {
      reducedMotion = value
      if (value) { for (const p of parts.values()) set(p, p.open, true); apply() }
    },
    update(deltaSeconds: number) {
      if (disposed) return false
      let changed = false
      // Snapshot gating: never spend the same frame twice on a queued action.
      const waiting = new Set([...parts.values()].filter(blocked).map(p => p.id))
      for (const p of parts.values()) {
        const target = p.open ? 1 : 0
        if (p.progress === target || waiting.has(p.id)) continue
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
      for (const p of parts.values()) { p.node.position.z = 0; p.node.rotation.y = 0 }
      parts.clear()
    },
  }
}
