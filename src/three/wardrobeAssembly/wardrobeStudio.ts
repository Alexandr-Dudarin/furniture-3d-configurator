import { DirectionalLight, Fog, type Scene } from 'three'

// A six-metre row needs a larger shadow and fog envelope, especially on phones.
// No change to light intensity, surface colour or the accepted catalogue studio.
export function configureWardrobeStudio(scene: Scene) {
  const fog = scene.fog instanceof Fog ? scene.fog : null
  const oldFog = fog ? [fog.near, fog.far] : null
  if (fog) { fog.near = 45; fog.far = 90 }
  const light = scene.getObjectByName('Studio_Key')
  const camera = light instanceof DirectionalLight ? light.shadow.camera : null
  const oldShadow = camera ? { left: camera.left, right: camera.right, top: camera.top, bottom: camera.bottom } : null
  if (camera) { Object.assign(camera, { left: -5, right: 5, top: 4, bottom: -4 }); camera.updateProjectionMatrix() }
  return () => {
    if (fog && oldFog) [fog.near, fog.far] = oldFog
    if (camera && oldShadow) { Object.assign(camera, oldShadow); camera.updateProjectionMatrix() }
  }
}
