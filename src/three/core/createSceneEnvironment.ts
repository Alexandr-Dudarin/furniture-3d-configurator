import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

export type SceneEnvironment = {
  fillLight: THREE.HemisphereLight
  keyLight: THREE.DirectionalLight
  rimLight: THREE.DirectionalLight
  floor: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>
  dispose: () => void
}

/** One studio per renderer, shared by catalog models and modular assemblies. */
export function createSceneEnvironment(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
): SceneEnvironment {
  const previousEnvironment = scene.environment
  const previousIntensity = scene.environmentIntensity
  const previousFog = scene.fog

  // Local geometry generates the studio reflections; no HDR download is needed.
  // Only the filtered render target lives for the lifetime of the main scene.
  const room = new RoomEnvironment()
  const generator = new THREE.PMREMGenerator(renderer)
  let environmentTarget: THREE.WebGLRenderTarget
  try {
    environmentTarget = generator.fromScene(room, 0.04, 0.1, 100, { size: 256 })
  } finally {
    room.dispose()
    generator.dispose()
  }
  scene.environment = environmentTarget.texture
  // Leave headroom on white finishes: too much unshadowed studio light pushes
  // both the flat face and the profile highlights into tone-map compression.
  scene.environmentIntensity = 0.32

  const background = scene.background instanceof THREE.Color ? scene.background : new THREE.Color(0xeef0f3)
  const fog = new THREE.Fog(background, 9, 22)
  scene.fog = fog

  const fillLight = new THREE.HemisphereLight(0xffffff, 0xbcc2cc, 0.2)
  fillLight.name = 'Studio_Fill'

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.6)
  keyLight.name = 'Studio_Key'
  keyLight.position.set(-3.8, 4.5, 3)
  keyLight.target.position.set(0, 0.45, 0)
  keyLight.castShadow = true
  keyLight.shadow.mapSize.set(2048, 2048)
  // A wide filter and the former 8 mm normal offset erased small contact
  // shadows. Keep a modest offset for acne and a tighter filter for profiles.
  keyLight.shadow.radius = 2
  keyLight.shadow.bias = -0.0001
  keyLight.shadow.normalBias = 0.002
  Object.assign(keyLight.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 0.5, far: 12 })
  keyLight.shadow.camera.updateProjectionMatrix()

  const rimLight = new THREE.DirectionalLight(0xffffff, 0.6)
  rimLight.name = 'Studio_Rim'
  rimLight.position.set(3, 3, -4)
  // A single shadow map avoids multiple competing silhouettes on the floor.
  rimLight.castShadow = false

  const floorGeometry = new THREE.PlaneGeometry(100, 100)
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xc8ccd1, roughness: 0.94, metalness: 0 })
  const floor = new THREE.Mesh(floorGeometry, floorMaterial)
  floor.name = 'Studio_Floor'
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -0.001
  floor.receiveShadow = true

  scene.add(fillLight, keyLight, keyLight.target, rimLight, floor)

  let disposed = false
  const dispose = () => {
    if (disposed) return
    disposed = true
    scene.remove(fillLight, keyLight, keyLight.target, rimLight, floor)
    // Do not overwrite an environment installed by another owner during teardown.
    if (scene.environment === environmentTarget.texture) {
      scene.environment = previousEnvironment
      scene.environmentIntensity = previousIntensity
    }
    if (scene.fog === fog) scene.fog = previousFog
    environmentTarget.dispose()
    floorGeometry.dispose()
    floorMaterial.dispose()
    keyLight.dispose()
    rimLight.dispose()
    fillLight.dispose()
  }

  return { fillLight, keyLight, rimLight, floor, dispose }
}
