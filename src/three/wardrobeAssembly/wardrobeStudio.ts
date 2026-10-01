import { DirectionalLight, Fog, Vector3, type Scene } from 'three'

// A six-metre row needs a larger shadow and fog envelope, especially on phones.
// No change to light intensity, surface colour or the accepted catalogue studio.
export function configureWardrobeStudio(scene: Scene) {
  const fog = scene.fog instanceof Fog ? scene.fog : null
  const oldFog = fog ? [fog.near, fog.far] : null
  if (fog) { fog.near = 45; fog.far = 90 }
  const light = scene.getObjectByName('Studio_Key')
  const camera = light instanceof DirectionalLight ? light.shadow.camera : null
  const oldShadow = camera ? { left: camera.left, right: camera.right, top: camera.top, bottom: camera.bottom, near: camera.near, far: camera.far } : null
  if (camera) { Object.assign(camera, { left: -5, right: 5, top: 4, bottom: -4 }); camera.updateProjectionMatrix() }
  const oldPosition = light instanceof DirectionalLight ? light.position.clone() : null
  const restore = () => {
    if (fog && oldFog) [fog.near, fog.far] = oldFog
    if (light instanceof DirectionalLight && oldPosition) light.position.copy(oldPosition)
    if (camera && oldShadow) { Object.assign(camera, oldShadow); camera.updateProjectionMatrix() }
  }
  return Object.assign(restore, { update(bounds: { width: number; height: number; depth: number }, corner: boolean) {
    if (!corner) {
      if (fog) { fog.near = 45; fog.far = 90 }
      if (light instanceof DirectionalLight && oldPosition) light.position.copy(oldPosition)
      if (camera && oldShadow) { Object.assign(camera, { left: -5, right: 5, top: 4, bottom: -4, near: oldShadow.near, far: oldShadow.far }); camera.updateProjectionMatrix() }
      return
    }
    const radius = Math.hypot(bounds.width, bounds.depth, bounds.height) / 2 + 2
    if (fog) { fog.near = Math.max(45, radius * 12); fog.far = fog.near * 2 }
    if (camera && light instanceof DirectionalLight && oldPosition) {
      const direction = new Vector3().subVectors(oldPosition, light.target.position).normalize()
      const distance = Math.max(oldPosition.distanceTo(light.target.position), radius * 1.5)
      light.position.copy(light.target.position).addScaledVector(direction, distance)
      Object.assign(camera, { left: -radius, right: radius, top: radius, bottom: -radius, near: .5, far: distance + radius * 2 })
      camera.updateProjectionMatrix()
    }
  } })
}
