import * as THREE from 'three'

export type SceneEnvironment = {
  ambientLight: THREE.AmbientLight
  keyLight: THREE.DirectionalLight
  floor: THREE.Mesh<
    THREE.PlaneGeometry,
    THREE.MeshStandardMaterial
  >

  dispose: () => void
}

export function createSceneEnvironment(
  scene: THREE.Scene,
): SceneEnvironment {
  /*
   * --------------------------------
   * AMBIENT LIGHT
   * --------------------------------
   */

  const ambientLight =
    new THREE.AmbientLight(
      0xffffff,
      1.2,
    )

  scene.add(
    ambientLight,
  )

  /*
   * --------------------------------
   * KEY LIGHT
   * --------------------------------
   */

  const keyLight =
    new THREE.DirectionalLight(
      0xffffff,
      3,
    )

  keyLight.position.set(
    2.5,
    4,
    2,
  )

  keyLight.castShadow =
    true

  keyLight.shadow.mapSize.set(
    2048,
    2048,
  )

  scene.add(
    keyLight,
  )

  /*
   * --------------------------------
   * FLOOR
   * --------------------------------
   */

  const floorGeometry =
    new THREE.PlaneGeometry(
      8,
      8,
    )

  const floorMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xb8b8b8,
      roughness: 0.9,
    })

  const floor =
    new THREE.Mesh(
      floorGeometry,
      floorMaterial,
    )

  floor.rotation.x =
    -Math.PI / 2

  floor.receiveShadow =
    true

  scene.add(
    floor,
  )

  /*
   * --------------------------------
   * CLEANUP
   * --------------------------------
   */

  const dispose =
    () => {
      scene.remove(
        ambientLight,
      )

      scene.remove(
        keyLight,
      )

      scene.remove(
        floor,
      )

      floorGeometry.dispose()

      floorMaterial.dispose()

      keyLight.dispose()
    }

  return {
    ambientLight,
    keyLight,
    floor,
    dispose,
  }
}