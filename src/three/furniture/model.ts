import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export async function loadFurnitureModel(
  url: string,
): Promise<THREE.Group> {
  const loader = new GLTFLoader()

  const gltf = await loader.loadAsync(url)

  const model = gltf.scene

  model.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true
      object.receiveShadow = true
    }
  })

  return model
}