import { MathUtils, Vector3, type PerspectiveCamera } from 'three'
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import type { FurnitureDefinition } from '../furniture/types'

type Frame = NonNullable<FurnitureDefinition['framing']>

// Fit the declared maximum envelope so dimensional edits never move the camera.
export function fitFurnitureFrame(camera: PerspectiveCamera, controls: Pick<OrbitControls, 'target' | 'maxDistance' | 'update'>, frame: Frame) {
  const direction = new Vector3(1.2, 0.6, 2.6).normalize()
  const right = new Vector3().crossVectors(new Vector3(0, 1, 0), direction).normalize()
  const up = new Vector3().crossVectors(direction, right)
  const target = new Vector3(0, frame.height / 2, 0)
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

export function createFurnitureFraming(camera: PerspectiveCamera, controls: OrbitControls) {
  let active: Frame | undefined
  let previousId = ''
  let tableView = { position: camera.position.clone(), target: controls.target.clone(), maxDistance: controls.maxDistance }
  return {
    select(id: string, frame?: Frame) {
      if (previousId === id) return
      previousId = id
      if (frame) {
        if (!active) tableView = { position: camera.position.clone(), target: controls.target.clone(), maxDistance: controls.maxDistance }
        active = frame
        fitFurnitureFrame(camera, controls, frame)
      } else if (active) {
        active = undefined
        camera.position.copy(tableView.position)
        controls.target.copy(tableView.target)
        controls.maxDistance = tableView.maxDistance
        camera.lookAt(controls.target)
        controls.update()
      }
    },
    resize() { if (active) fitFurnitureFrame(camera, controls, active) },
  }
}
