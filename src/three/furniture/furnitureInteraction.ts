import { Mesh, Raycaster, Vector2, type Camera, type Object3D } from 'three'
import type { FurnitureMotion } from './furnitureMotion'

// Shared by mouse and touch; any drag or second finger cancels the whole tap.
export function createTapGesture() {
  const pointers = new Set<number>()
  let tap: { id: number; x: number; y: number; time: number; part: string } | null = null
  return {
    down(id: number, x: number, y: number, time: number, part: string | null, button: number) {
      pointers.add(id)
      tap = pointers.size === 1 && button === 0 && part ? { id, x, y, time, part } : null
    },
    move(id: number, x: number, y: number) {
      if (tap?.id === id && Math.hypot(x - tap.x, y - tap.y) > 8) tap = null
    },
    up(id: number, x: number, y: number, time: number, part: string | null) {
      const result = tap?.id === id && part === tap.part && time - tap.time < 700 &&
        Math.hypot(x - tap.x, y - tap.y) <= 8 ? part : null
      tap = null; pointers.delete(id)
      return result
    },
    cancel(id: number) { tap = null; pointers.delete(id) },
    reset() { tap = null; pointers.clear() },
    active: () => pointers.size > 0,
  }
}

export function bindFurnitureInteraction(canvas: HTMLCanvasElement, camera: Camera, root: Object3D, motion: Pick<FurnitureMotion, 'findPart' | 'toggle'>) {
  const raycaster = new Raycaster(), point = new Vector2(), gesture = createTapGesture()
  const previousCursor = canvas.style.cursor
  const capture = { capture: true }
  function hit(x: number, y: number) {
    const rect = canvas.getBoundingClientRect()
    if (!rect.width || !rect.height || x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) return null
    point.set((x - rect.left) / rect.width * 2 - 1, -(y - rect.top) / rect.height * 2 + 1)
    root.updateMatrixWorld(true); camera.updateMatrixWorld()
    raycaster.setFromCamera(point, camera)
    const visible: Object3D[] = []
    root.traverseVisible(node => { if (node instanceof Mesh) visible.push(node) })
    const nearest = raycaster.intersectObjects(visible, false)[0]
    return nearest ? motion.findPart(nearest.object) : null
  }
  const down = (e: PointerEvent) => gesture.down(e.pointerId, e.clientX, e.clientY, e.timeStamp, hit(e.clientX, e.clientY), e.button)
  const move = (e: PointerEvent) => {
    gesture.move(e.pointerId, e.clientX, e.clientY)
    if (e.target === canvas && e.pointerType === 'mouse' && !gesture.active())
      canvas.style.cursor = hit(e.clientX, e.clientY) ? 'pointer' : previousCursor
  }
  const up = (e: PointerEvent) => {
    const id = gesture.up(e.pointerId, e.clientX, e.clientY, e.timeStamp, hit(e.clientX, e.clientY))
    if (id) motion.toggle(id)
  }
  const cancel = (e: PointerEvent) => gesture.cancel(e.pointerId)
  const leave = () => { canvas.style.cursor = previousCursor }
  const blur = () => { gesture.reset(); leave() }
  canvas.addEventListener('pointerdown', down, capture)
  canvas.addEventListener('pointerleave', leave)
  window.addEventListener('pointermove', move, capture)
  window.addEventListener('pointerup', up, capture)
  window.addEventListener('pointercancel', cancel, capture)
  window.addEventListener('blur', blur)
  return () => {
    canvas.removeEventListener('pointerdown', down, capture)
    canvas.removeEventListener('pointerleave', leave)
    window.removeEventListener('pointermove', move, capture)
    window.removeEventListener('pointerup', up, capture)
    window.removeEventListener('pointercancel', cancel, capture)
    window.removeEventListener('blur', blur)
    blur()
  }
}
