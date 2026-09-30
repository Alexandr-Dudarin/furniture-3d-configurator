import { Box3, MathUtils, Ray, Vector3, type PerspectiveCamera } from 'three'
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js'

export const CAMERA_CLEARANCE = .20
type Obstacles = () => readonly Box3[]

// Coarse filled volumes keep the camera outside both a carcass and the EMPTY
// inside of an open drawer. No triangle raycasts or new geometry per frame.
export function createCameraClearance(camera: PerspectiveCamera, controls: Pick<OrbitControls, 'target'>) {
  let provider: Obstacles | undefined
  const previous = camera.position.clone(), wanted = new Vector3(), start = new Vector3()
  const direction = new Vector3(), hit = new Vector3(), correction = new Vector3()
  const ray = new Ray(), expanded: Box3[] = []
  const epsilon = .00001
  const reset = () => previous.copy(camera.position)
  return {
    // A deliberate fit/restore is a teleport, not a drag through the model.
    reset,
    attach(next: Obstacles) {
      provider = next; reset()
      return () => { if (provider === next) { provider = undefined; expanded.length = 0; reset() } }
    },
    update() {
      const boxes = provider?.()
      if (!boxes?.length) { reset(); return false }
      // The entire near plane must stay clear, including wide viewports.
      const halfHeight = camera.near * Math.tan(MathUtils.degToRad(camera.getEffectiveFOV()) / 2)
      const padding = Math.max(CAMERA_CLEARANCE, Math.hypot(camera.near, halfHeight, halfHeight * camera.aspect) + .02)
      expanded.length = boxes.length
      for (let i = 0; i < boxes.length; i++) (expanded[i] ??= new Box3()).copy(boxes[i]).expandByScalar(padding)
      wanted.copy(camera.position); start.copy(previous)
      direction.subVectors(camera.position, controls.target).normalize()
      if (direction.lengthSq() === 0) direction.set(0, 0, 1)
      // Opening a drawer/resizing can surround the former safe position.
      // Move out towards the viewer, not into another part of the furniture.
      for (let pass = 0; pass <= expanded.length; pass++) {
        const containing = expanded.find(box => box.containsPoint(start))
        if (!containing) break
        ray.set(start, direction)
        ray.intersectBox(containing, hit)
        start.copy(hit).addScaledVector(direction, epsilon)
      }
      direction.subVectors(wanted, start)
      const length = direction.length()
      if (length > epsilon) {
        direction.divideScalar(length); ray.set(start, direction)
        let allowed = length
        for (const box of expanded) if (ray.intersectBox(box, hit)) {
          const distance = hit.distanceTo(start)
          if (distance <= allowed) allowed = Math.max(0, distance - epsilon)
        }
        start.addScaledVector(direction, allowed)
      }
      correction.subVectors(start, wanted)
      const changed = correction.lengthSq() > 1e-16
      if (changed) {
        camera.position.copy(start)
        // Keep the viewing direction stable when zoom-to-cursor or pan hits
        // an obstacle. OrbitControls reads this corrected pose next frame.
        controls.target.add(correction)
        camera.updateMatrixWorld()
      }
      reset()
      return changed
    },
  }
}
