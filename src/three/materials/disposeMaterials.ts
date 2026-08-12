import * as THREE from 'three'

export function disposeMaterialResources(
  material: THREE.Material,
): void {
  const textures =
    new Set<THREE.Texture>()

  Object.values(
    material,
  ).forEach(
    (value) => {
      if (
        value instanceof
        THREE.Texture
      ) {
        textures.add(
          value,
        )
      }
    },
  )

  textures.forEach(
    (texture) => {
      texture.dispose()
    },
  )

  material.dispose()
}

