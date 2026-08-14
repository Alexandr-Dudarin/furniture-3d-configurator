import * as THREE from 'three'

import {
  getMaterialFinish,
} from './materialRegistry'

const textureLoader =
  new THREE.TextureLoader()

const textureTemplatePromises =
  new Map<
    string,
    Promise<THREE.Texture>
  >()

export async function createFinishMaterial(
  finishId: string,
  maxAnisotropy = 1,
): Promise<THREE.MeshStandardMaterial> {
  const finish =
    getMaterialFinish(
      finishId,
    )

  if (
    finish.kind ===
    'procedural'
  ) {
    return new THREE.MeshStandardMaterial({
      color: finish.color,
      metalness:
        finish.metalness,
      roughness:
        finish.roughness,
    })
  }

  const [
    colorTemplate,
    roughnessTemplate,
    normalTemplate,
  ] = await Promise.all([
    loadTextureTemplate(
      finish.maps.color,
      THREE.SRGBColorSpace,
    ),
    loadTextureTemplate(
      finish.maps.roughness,
      THREE.NoColorSpace,
    ),
    loadTextureTemplate(
      finish.maps.normal,
      THREE.NoColorSpace,
    ),
  ])

  const map =
    cloneTextureForMaterial(
      colorTemplate,
      maxAnisotropy,
    )

  const roughnessMap =
    cloneTextureForMaterial(
      roughnessTemplate,
      maxAnisotropy,
    )

  const normalMap =
    cloneTextureForMaterial(
      normalTemplate,
      maxAnisotropy,
    )

  const normalScale =
    finish.normalScale ?? 1

  return new THREE.MeshStandardMaterial({
    color:
      finish.color ??
      0xffffff,
    map,
    roughnessMap,
    normalMap,
    normalScale:
      new THREE.Vector2(
        normalScale,
        normalScale,
      ),
    metalness:
      finish.metalness,
    roughness:
      finish.roughness,
  })
}

function loadTextureTemplate(
  url: string,
  colorSpace:
    THREE.ColorSpace,
): Promise<THREE.Texture> {
  const cached =
    textureTemplatePromises.get(
      url,
    )

  if (cached) {
    return cached
  }

  const loading =
    textureLoader
      .loadAsync(url)
      .then(
        (texture) => {
          texture.colorSpace =
            colorSpace

          texture.wrapS =
            THREE.RepeatWrapping

          texture.wrapT =
            THREE.RepeatWrapping

          texture.needsUpdate =
            true

          return texture
        },
      )
      .catch(
        (error) => {
          textureTemplatePromises.delete(
            url,
          )

          throw error
        },
      )

  textureTemplatePromises.set(
    url,
    loading,
  )

  return loading
}

function cloneTextureForMaterial(
  template: THREE.Texture,
  maxAnisotropy: number,
): THREE.Texture {
  const texture =
    template.clone()

  texture.anisotropy =
    Math.max(
      1,
      Math.min(
        maxAnisotropy,
        8,
      ),
    )

  texture.wrapS =
    THREE.RepeatWrapping

  texture.wrapT =
    THREE.RepeatWrapping

  texture.needsUpdate =
    true

  return texture
}

export function disposeMaterialFinishCache(): void {
  textureTemplatePromises.forEach(
    (loading) => {
      void loading.then(
        (texture) => {
          texture.dispose()
        },
        () => {},
      )
    },
  )

  textureTemplatePromises.clear()
}
