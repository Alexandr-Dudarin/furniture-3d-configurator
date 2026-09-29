import { MathUtils, Vector3, type PerspectiveCamera } from 'three'
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import type { FurnitureDefinition } from '../furniture/types'

type Frame = NonNullable<FurnitureDefinition['framing']>
type FramingControls = Pick<OrbitControls, 'target' | 'maxDistance' | 'minDistance' | 'zoomToCursor' | 'screenSpacePanning' | 'update'>

// A shared envelope gives comparable objects the same initial camera, regardless
// of which model is selected first. Catalogue metadata requires no GLB loading.
export function combineFurnitureFrames(frames: readonly (Frame | undefined)[]): Frame | undefined {
  let combined: Frame | undefined
  for (const frame of frames) {
    if (!frame) continue
    combined = combined ? {
      width: Math.max(combined.width, frame.width),
      height: Math.max(combined.height, frame.height),
      depth: Math.max(combined.depth, frame.depth),
    } : { ...frame }
  }
  return combined
}

// Fit the declared maximum envelope so dimensional edits never change the zoom.
export function fitFurnitureFrame(camera: PerspectiveCamera, controls: FramingControls, frame: Frame, centerY = frame.height / 2) {
  const direction = new Vector3(1.2, 0.6, 2.6).normalize()
  const right = new Vector3().crossVectors(new Vector3(0, 1, 0), direction).normalize()
  const up = new Vector3().crossVectors(direction, right)
  const target = new Vector3(0, centerY, 0)
  const tanV = Math.tan(MathUtils.degToRad(camera.fov) / 2)
  const tanH = tanV * camera.aspect
  let distance = 0
  for (const x of [-frame.width / 2, frame.width / 2]) {
    for (const y of [-frame.height / 2, frame.height / 2]) {
      for (const z of [-frame.depth / 2, frame.depth / 2]) {
        const point = new Vector3(x, y, z)
        distance = Math.max(distance, point.dot(direction) + Math.max(
          Math.abs(point.dot(right)) / (tanH * 0.82),
          Math.abs(point.dot(up)) / (tanV * 0.82)))
      }
    }
  }
  controls.maxDistance = Math.max(5, distance * 2)
  controls.target.copy(target)
  camera.position.copy(target).addScaledVector(direction, distance)
  camera.lookAt(target)
  controls.update()
}

// Each view owns its orbit/zoom/pan. Wardrobes share one view for comparison;
// dressers use a view per model with a target at the current body centre.
export function createFurnitureFraming(camera: PerspectiveCamera, controls: FramingControls) {
  const navigation = { minDistance: controls.minDistance, zoomToCursor: controls.zoomToCursor, screenSpacePanning: controls.screenSpacePanning }
  type View = { position: Vector3; target: Vector3; maxDistance: number; centerY: number }
  let key = 'tables', active: Frame | undefined, centerY = 0
  const views = new Map<string, View>()
  const capture = (): View => ({ position: camera.position.clone(), target: controls.target.clone(), maxDistance: controls.maxDistance, centerY })
  const moveCenter = (next: number) => {
    const dy = next - centerY
    camera.position.y += dy; controls.target.y += dy; centerY = next
    if (dy) { camera.lookAt(controls.target); controls.update() }
  }
  return {
    reset() {
      if (active) fitFurnitureFrame(camera, controls, active, centerY)
    },
    select(_id: string, frame?: Frame, viewKey = frame ? 'cabinets' : 'tables', targetY = frame?.height ? frame.height / 2 : 0) {
      // Close inspection belongs to the assembly view; other categories keep
      // their original navigation. Cursor zoom and vertical pan reach handles
      // anywhere in a long row without changing its initial framing.
      Object.assign(controls, viewKey === 'wardrobe-assembly'
        ? { minDistance: .35, zoomToCursor: true, screenSpacePanning: true } : navigation)
      if (viewKey === key) { active = frame; moveCenter(targetY); return }
      views.set(key, capture())
      key = viewKey; active = frame
      const saved = views.get(key)
      if (saved) {
        camera.position.copy(saved.position); controls.target.copy(saved.target)
        controls.maxDistance = saved.maxDistance; centerY = saved.centerY
        moveCenter(targetY); camera.lookAt(controls.target); controls.update()
      } else if (frame) {
        centerY = targetY
        fitFurnitureFrame(camera, controls, frame, centerY)
      }
    },
    resize() {
      // Cached projections belong to the old viewport. Refit other views when
      // revisited; keep the table view usable and fit the active category now.
      for (const cached of views.keys()) if (cached !== 'tables') views.delete(cached)
      if (active) fitFurnitureFrame(camera, controls, active, centerY)
    },
  }
}
