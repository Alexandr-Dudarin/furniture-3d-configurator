import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

/*
 * --------------------------------
 * LOAD FURNITURE MODEL
 * --------------------------------
 */

export async function loadFurnitureModel(
  url: string,
): Promise<THREE.Group> {
  const loader =
    new GLTFLoader()

  const gltf =
    await loader.loadAsync(
      url,
    )

  const model =
    gltf.scene

  /*
   * Тени включаем для всех Mesh
   * независимо от конкретной модели.
   */

  model.traverse(
    (object) => {
      if (
        !(
          object instanceof
          THREE.Mesh
        )
      ) {
        return
      }

      object.castShadow =
        true

      object.receiveShadow =
        true
    },
  )

  return model
}

/*
 * --------------------------------
 * DISPOSE FURNITURE MODEL
 * --------------------------------
 *
 * При переключении мебели недостаточно
 * просто сделать:
 *
 * scene.remove(model)
 *
 * Иначе геометрия, материалы и текстуры
 * могут продолжить занимать GPU-память.
 */

export function disposeFurnitureModel(
  model: THREE.Object3D,
): void {
  const geometries =
    new Set<THREE.BufferGeometry>()

  const materials =
    new Set<THREE.Material>()

  const textures =
    new Set<THREE.Texture>()

  model.traverse(
    (object) => {
      if (
        !(
          object instanceof
          THREE.Mesh
        )
      ) {
        return
      }

      geometries.add(
        object.geometry,
      )

      const objectMaterials =
        Array.isArray(
          object.material,
        )
          ? object.material
          : [
              object.material,
            ]

      objectMaterials.forEach(
        (material) => {
          materials.add(
            material,
          )

          /*
           * Собираем Texture,
           * находящиеся в материале.
           *
           * Сюда попадут:
           *
           * map
           * normalMap
           * roughnessMap
           * aoMap
           * metalnessMap
           * bumpMap
           * и т.д.
           */

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
        },
      )
    },
  )

  textures.forEach(
    (texture) => {
      texture.dispose()
    },
  )

  materials.forEach(
    (material) => {
      material.dispose()
    },
  )

  geometries.forEach(
    (geometry) => {
      geometry.dispose()
    },
  )
}