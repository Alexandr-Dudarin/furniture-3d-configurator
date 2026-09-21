import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { createResourceCache } from '../core/resourceCache'

// Cache bytes only. Each parse owns its geometry and materials independently.
const modelSources = createResourceCache<ArrayBuffer>({
  maxEntries: 4, maxBytes: 24 * 1024 * 1024,
  sizeOf: (data) => data.byteLength, dispose: () => {},
})

// GLTFLoader creates ImageBitmaps for embedded maps. Keep ownership even when
// finish replacement detaches the original material before model disposal.
const ownedImages = new WeakMap<THREE.Object3D, Set<ImageBitmap>>()

export function disposeFurnitureSourceCache(): void { modelSources.clear() }


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

  const data = await modelSources.get(url, async () => {
    const fileLoader = new THREE.FileLoader().setResponseType('arraybuffer')
    return await fileLoader.loadAsync(url) as ArrayBuffer
  })
  let gltf
  try {
    gltf = await loader.parseAsync(data, THREE.LoaderUtils.extractUrlBase(url))
  } catch (error) {
    modelSources.invalidate(url, data)
    throw error
  }

  const model =
    gltf.scene

  const images = new Set<ImageBitmap>()
  model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    const materials = Array.isArray(object.material) ? object.material : [object.material]
    for (const material of materials) for (const value of Object.values(material)) {
      if (value instanceof THREE.Texture && typeof ImageBitmap !== 'undefined' && value.image instanceof ImageBitmap) images.add(value.image)
    }
  })
  ownedImages.set(model, images)

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
  model.traverse((object) => {
    ownedImages.get(object)?.forEach((image) => image.close())
    ownedImages.delete(object)
  })
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
