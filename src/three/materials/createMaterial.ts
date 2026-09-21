import * as THREE from 'three'
import { createResourceCache } from '../core/resourceCache'

import {
  getMaterialFinish,
} from './materialRegistry'

const textureLoader =
  new THREE.TextureLoader()

// Budget for decoded source images retained for reuse, not total process/GPU memory.
// Active material clones can keep their own image references after eviction.
const textureTemplates = createResourceCache<THREE.Texture>({
  maxEntries: 12,
  maxBytes: 96 * 1024 * 1024,
  sizeOf: (texture) => {
    const image = texture.image as { width?: number; height?: number } | undefined
    return (image?.width ?? 2048) * (image?.height ?? 2048) * 4
  },
  // Do not close shared images: active clones may still use them.
  dispose: (texture) => texture.dispose(),
})

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
  return textureTemplates.get(`${colorSpace}:${url}`, async () => {
    const texture = await textureLoader.loadAsync(url)
    texture.colorSpace = colorSpace
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.needsUpdate = true
    return texture
  })
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
  textureTemplates.clear()
}
