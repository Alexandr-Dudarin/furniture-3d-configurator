/// <reference types="node" />

import {
  readFile,
} from 'node:fs/promises'

import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import * as THREE from 'three'
import {
  GLTFLoader,
} from 'three/addons/loaders/GLTFLoader.js'

import {
  createFurnitureController,
} from '../../furniture/furnitureController'

import {
  disposeMaterialFinishCache,
} from '../../materials/createMaterial'

import {
  createFurnitureMaterialController,
} from '../../materials/materialController'

import {
  getMaterialFinish,
} from '../../materials/materialRegistry'

import {
  SLAT_PEDESTAL_TABLE_CONFIG,
} from './config'

const EPSILON_DIGITS = 6

afterEach(() => {
  disposeMaterialFinishCache()
  vi.unstubAllGlobals()
})

describe(
  'SLAT_PEDESTAL_TABLE_CONFIG',
  () => {
    it(
      'controls the production GLB across its complete configured range',
      async () => {
        stubImageElement()

        const model =
          await loadProductionModel(
            'public/models/table-03-slat-pedestal.glb',
          )

        const top =
          getRequiredObject(
            model,
            'TableTop',
          )

        const fixedNames = [
          'Base_Plinth',
          'Pedestal_Core',
          'Pedestal_TopPlate',
          'Pedestal_Slats_Front',
          'Pedestal_Slats_Back',
        ] as const

        const fixedNodes =
          fixedNames.map(
            (name) =>
              getRequiredObject(
                model,
                name,
              ),
          )

        const baseTopScale =
          top.scale.clone()

        const fixedTransforms =
          fixedNodes.map(
            captureTransform,
          )

        const tabletopMaterials = [
          'Wood_Top',
          'Wood_Bottom',
          'Wood_Edge_Long',
          'Wood_Edge_Short',
        ] as const

        const pedestalWoodMaterials = [
          'Wood_Slats',
          'Wood_Plinth',
        ] as const

        expect(
          SLAT_PEDESTAL_TABLE_CONFIG
            .materialSlots.primaryTop
            .targets,
        ).toEqual(tabletopMaterials)

        expect(
          SLAT_PEDESTAL_TABLE_CONFIG
            .materialSlots.pedestalWood
            .targets,
        ).toEqual(pedestalWoodMaterials)

        expectUniqueSlotTargets(
          SLAT_PEDESTAL_TABLE_CONFIG
            .materialSlots,
        )

        tabletopMaterials.forEach(
          (materialName) => {
            expect(
              getMaterialByName(
                model,
                materialName,
              ).userData
                .replaceableFinishGroup,
            ).toBe('PrimaryTop')

            expectMaterialHasUv(
              model,
              materialName,
            )
          },
        )

        pedestalWoodMaterials.forEach(
          (materialName) => {
            expect(
              getMaterialByName(
                model,
                materialName,
              ).userData
                .replaceableFinishGroup,
            ).toBe('PedestalWood')

            expectMaterialHasUv(
              model,
              materialName,
            )
          },
        )

        expect(
          getMaterialByName(
            model,
            'Dark_Pedestal',
          ).userData
            .replaceableFinishGroup,
        ).toBeUndefined()

        Object.values(
          SLAT_PEDESTAL_TABLE_CONFIG
            .materialSlots,
        ).forEach((slot) => {
          slot.allowedFinishes
            .forEach((finishId) => {
              expect(
                getMaterialFinish(
                  finishId,
                ).id,
              ).toBe(finishId)
            })
        })

        const controller =
          createFurnitureController(
            model,
            SLAT_PEDESTAL_TABLE_CONFIG,
          )

        const materialController =
          createFurnitureMaterialController(
            model,
            SLAT_PEDESTAL_TABLE_CONFIG,
            {
              maxAnisotropy: 16,
              onMaterialsChanged:
                controller.refreshTextures,
            },
          )

        await materialController
          .setFinishes(
            materialController
              .getSelections(),
          )

        tabletopMaterials.forEach(
          (materialName) => {
            expect(
              getMaterialByName(
                model,
                materialName,
              ).userData.finishId,
            ).toBe('oak-natural')
          },
        )

        pedestalWoodMaterials.forEach(
          (materialName) => {
            expect(
              getMaterialByName(
                model,
                materialName,
              ).userData.finishId,
            ).toBe('oak-natural')
          },
        )

        const topTexture =
          getMaterialMapByName(
            model,
            'Wood_Top',
          )

        const bottomTexture =
          getMaterialMapByName(
            model,
            'Wood_Bottom',
          )

        const longEdgeTexture =
          getMaterialMapByName(
            model,
            'Wood_Edge_Long',
          )

        const shortEdgeTexture =
          getMaterialMapByName(
            model,
            'Wood_Edge_Short',
          )

        const baseTopTexture =
          captureTextureTransform(
            topTexture,
          )

        const baseBottomTexture =
          captureTextureTransform(
            bottomTexture,
          )

        const baseLongEdgeTexture =
          captureTextureTransform(
            longEdgeTexture,
          )

        const baseShortEdgeTexture =
          captureTextureTransform(
            shortEdgeTexture,
          )

        expect(
          controller.getDimensions(),
        ).toEqual({
          length: 1.2,
          width: 0.75,
        })

        expectBounds(
          model,
          [1.2, 0.75, 0.75],
        )

        controller.setDimensions({
          length: 1.6,
          width: 1.15,
        })

        expectAxisValue(
          top.scale.x,
          baseTopScale.x *
            (1.6 / 1.2),
        )

        expectAxisValue(
          top.scale.y,
          baseTopScale.y,
        )

        expectAxisValue(
          top.scale.z,
          baseTopScale.z *
            (1.15 / 0.75),
        )

        fixedNodes.forEach(
          (node, index) => {
            expectTransform(
              node,
              fixedTransforms[index],
            )
          },
        )

        expectBounds(
          model,
          [1.6, 0.75, 1.15],
        )

        expectCenteredTextureScale(
          topTexture,
          baseTopTexture,
          1.6 / 1.2,
          1.15 / 0.75,
        )

        expectCenteredTextureScale(
          bottomTexture,
          baseBottomTexture,
          1.6 / 1.2,
          1.15 / 0.75,
        )

        expectCenteredTextureScale(
          longEdgeTexture,
          baseLongEdgeTexture,
          1.6 / 1.2,
          1,
        )

        expectCenteredTextureScale(
          shortEdgeTexture,
          baseShortEdgeTexture,
          1.15 / 0.75,
          1,
        )

        await materialController
          .setFinishes({
            primaryTop:
              'walnut-natural',
            pedestalWood:
              'ash-natural',
          })

        tabletopMaterials.forEach(
          (materialName) => {
            expect(
              getMaterialByName(
                model,
                materialName,
              ).userData.finishId,
            ).toBe('walnut-natural')
          },
        )

        pedestalWoodMaterials.forEach(
          (materialName) => {
            expect(
              getMaterialByName(
                model,
                materialName,
              ).userData.finishId,
            ).toBe('ash-natural')
          },
        )

        expect(
          getMaterialByName(
            model,
            'Dark_Pedestal',
          ).userData.finishId,
        ).toBeUndefined()

        expectAxisValue(
          getMaterialMapByName(
            model,
            'Wood_Top',
          ).repeat.x,
          1.6 / 1.2,
        )

        expectAxisValue(
          getMaterialMapByName(
            model,
            'Wood_Bottom',
          ).repeat.y,
          1.15 / 0.75,
        )

        expectAxisValue(
          getMaterialMapByName(
            model,
            'Wood_Edge_Long',
          ).repeat.x,
          1.6 / 1.2,
        )

        expectAxisValue(
          getMaterialMapByName(
            model,
            'Wood_Edge_Short',
          ).repeat.x,
          1.15 / 0.75,
        )

        controller.setDimensions({
          length: 1.37,
          width: 0.94,
        })

        controller.setDimensions({
          length: 1.2,
          width: 0.75,
        })

        expectVectorCloseTo(
          top.scale,
          baseTopScale,
        )

        fixedNodes.forEach(
          (node, index) => {
            expectTransform(
              node,
              fixedTransforms[index],
            )
          },
        )

        tabletopMaterials.forEach(
          (materialName) => {
            const texture =
              getMaterialMapByName(
                model,
                materialName,
              )

            expectTextureTransform(
              texture,
              1,
              1,
              0,
              0,
            )
          },
        )
      },
    )
  },
)

type CapturedTransform = {
  position: THREE.Vector3
  rotation: THREE.Euler
  scale: THREE.Vector3
}

function captureTransform(
  object: THREE.Object3D,
): CapturedTransform {
  return {
    position: object.position.clone(),
    rotation: object.rotation.clone(),
    scale: object.scale.clone(),
  }
}

function expectTransform(
  object: THREE.Object3D,
  expected: CapturedTransform,
): void {
  expectVectorCloseTo(
    object.position,
    expected.position,
  )

  expectAxisValue(
    object.rotation.x,
    expected.rotation.x,
  )

  expectAxisValue(
    object.rotation.y,
    expected.rotation.y,
  )

  expectAxisValue(
    object.rotation.z,
    expected.rotation.z,
  )

  expectVectorCloseTo(
    object.scale,
    expected.scale,
  )
}

async function loadProductionModel(
  path: string,
): Promise<THREE.Group> {
  const file = await readFile(path)
  const gltf =
    await new GLTFLoader()
      .parseAsync(
        Uint8Array.from(file).buffer,
        '',
      )

  return gltf.scene
}

function getRequiredObject(
  model: THREE.Object3D,
  name: string,
): THREE.Object3D {
  const object =
    model.getObjectByName(name)

  if (!object) {
    throw new Error(
      `Expected object "${name}" in the production GLB.`,
    )
  }

  return object
}

function getMaterialByName(
  model: THREE.Object3D,
  name: string,
): THREE.Material {
  let result:
    THREE.Material | null = null

  model.traverse((object) => {
    if (
      result ||
      !(object instanceof THREE.Mesh)
    ) {
      return
    }

    const materials =
      Array.isArray(object.material)
        ? object.material
        : [object.material]

    result =
      materials.find(
        (material) =>
          material.name === name,
      ) ?? null
  })

  if (!result) {
    throw new Error(
      `Expected material "${name}" in the production GLB.`,
    )
  }

  return result
}

function getMaterialMapByName(
  model: THREE.Object3D,
  name: string,
): THREE.Texture {
  const material =
    getMaterialByName(
      model,
      name,
    )

  if (
    !(
      material instanceof
      THREE.MeshStandardMaterial
    ) ||
    !material.map
  ) {
    throw new Error(
      `Expected material "${name}" to have a map.`,
    )
  }

  return material.map
}

function expectMaterialHasUv(
  model: THREE.Object3D,
  materialName: string,
): void {
  let found = false

  model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) {
      return
    }

    const materials =
      Array.isArray(object.material)
        ? object.material
        : [object.material]

    if (
      materials.some(
        (material) =>
          material.name ===
          materialName,
      )
    ) {
      found = Boolean(
        object.geometry
          .getAttribute('uv'),
      )
    }
  })

  expect(found).toBe(true)
}

function expectUniqueSlotTargets(
  slots: Readonly<
    Record<
      string,
      {
        targets:
          readonly string[]
      }
    >
  >,
): void {
  const targets =
    Object.values(slots)
      .flatMap(
        (slot) => [
          ...slot.targets,
        ],
      )

  expect(
    new Set(targets).size,
  ).toBe(targets.length)
}

function expectBounds(
  model: THREE.Object3D,
  expected: readonly [
    number,
    number,
    number,
  ],
): void {
  model.updateMatrixWorld(true)

  const size =
    new THREE.Box3()
      .setFromObject(model)
      .getSize(new THREE.Vector3())

  expectAxisValue(size.x, expected[0])
  expectAxisValue(size.y, expected[1])
  expectAxisValue(size.z, expected[2])
}

function expectTextureTransform(
  texture: THREE.Texture,
  repeatX: number,
  repeatY: number,
  offsetX: number,
  offsetY: number,
): void {
  expectAxisValue(texture.repeat.x, repeatX)
  expectAxisValue(texture.repeat.y, repeatY)
  expectAxisValue(texture.offset.x, offsetX)
  expectAxisValue(texture.offset.y, offsetY)
}

type TextureTransform = {
  repeatX: number
  repeatY: number
  offsetX: number
  offsetY: number
}

function captureTextureTransform(
  texture: THREE.Texture,
): TextureTransform {
  return {
    repeatX: texture.repeat.x,
    repeatY: texture.repeat.y,
    offsetX: texture.offset.x,
    offsetY: texture.offset.y,
  }
}

function expectCenteredTextureScale(
  texture: THREE.Texture,
  base: TextureTransform,
  factorX: number,
  factorY: number,
): void {
  expectTextureTransform(
    texture,
    base.repeatX * factorX,
    base.repeatY * factorY,
    base.offsetX +
      base.repeatX *
        (1 - factorX) /
        2,
    base.offsetY +
      base.repeatY *
        (1 - factorY) /
        2,
  )
}

function expectVectorCloseTo(
  actual: THREE.Vector3,
  expected: THREE.Vector3,
): void {
  expectAxisValue(actual.x, expected.x)
  expectAxisValue(actual.y, expected.y)
  expectAxisValue(actual.z, expected.z)
}

function expectAxisValue(
  actual: number,
  expected: number,
): void {
  expect(actual).toBeCloseTo(
    expected,
    EPSILON_DIGITS,
  )
}

class MockImageElement {
  complete = false
  width = 1
  height = 1
  crossOrigin: string | null = null
  private source = ''
  private readonly listeners =
    new Map<
      string,
      Set<
        EventListenerOrEventListenerObject
      >
    >()

  addEventListener(
    type: string,
    listener:
      EventListenerOrEventListenerObject,
  ): void {
    const listeners =
      this.listeners.get(type) ??
      new Set()

    listeners.add(listener)
    this.listeners.set(type, listeners)
  }

  removeEventListener(
    type: string,
    listener:
      EventListenerOrEventListenerObject,
  ): void {
    this.listeners.get(type)?.delete(listener)
  }

  set src(value: string) {
    this.source = value
    this.complete = true

    queueMicrotask(() => {
      const event = new Event('load')

      this.listeners
        .get('load')
        ?.forEach((listener) => {
          if (typeof listener === 'function') {
            listener.call(this, event)
            return
          }

          listener.handleEvent(event)
        })
    })
  }

  get src(): string {
    return this.source
  }
}

function stubImageElement(): void {
  vi.stubGlobal('self', globalThis)
  vi.stubGlobal('document', {
    createElementNS: () =>
      new MockImageElement(),
  })
}
