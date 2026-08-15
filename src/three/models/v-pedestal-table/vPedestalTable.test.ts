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
  V_PEDESTAL_TABLE_CONFIG,
} from './config'

const EPSILON_DIGITS = 7

afterEach(() => {
  disposeMaterialFinishCache()
  vi.unstubAllGlobals()
})

describe(
  'V_PEDESTAL_TABLE_CONFIG',
  () => {
    it(
      'preserves the rounded top profile and fixed support while resizing the production GLB',
      async () => {
        stubImageElement()

        const model =
          await loadProductionModel(
            'public/models/table-04-v-pedestal.glb',
          )

        const center =
          getRequiredObject(
            model,
            'Top_Center',
          )

        const frontEdge =
          getRequiredObject(
            model,
            'Top_Edge_Front',
          )

        const leftEdge =
          getRequiredObject(
            model,
            'Top_Edge_Left',
          )

        const frontRightCorner =
          getRequiredObject(
            model,
            'Top_Corner_FrontRight',
          )

        const supportNames = [
          'Support_Frame',
          'Base_Plinth',
          'UnderTop_Mount',
          'Support_Left_Front',
          'Support_Left_Back',
          'Support_Right_Front',
          'Support_Right_Back',
        ] as const

        const supportNodes =
          supportNames.map(
            (name) =>
              getRequiredObject(
                model,
                name,
              ),
          )

        const supportTransforms =
          supportNodes.map(
            captureTransform,
          )

        const supportBeams = [
          'Support_Left_Front',
          'Support_Left_Back',
          'Support_Right_Front',
          'Support_Right_Back',
        ].map((name) =>
          getRequiredObject(
            model,
            name,
          ),
        )

        const basePlinth =
          getRequiredObject(
            model,
            'Base_Plinth',
          )

        const underTopMount =
          getRequiredObject(
            model,
            'UnderTop_Mount',
          )

        const baseCenterScale =
          center.scale.clone()

        const baseFrontEdge =
          captureTransform(frontEdge)

        const baseLeftEdge =
          captureTransform(leftEdge)

        const baseCorner =
          captureTransform(
            frontRightCorner,
          )

        const tabletopMaterials = [
          'Stone_Top_Center',
          'Stone_Bottom_Center',
          'Stone_Top_LongSegment',
          'Stone_Bottom_LongSegment',
          'Stone_Top_ShortSegment',
          'Stone_Bottom_ShortSegment',
          'Stone_Top_Corner',
          'Stone_Bottom_Corner',
          'Stone_Edge_Long',
          'Stone_Edge_Short',
          'Stone_Edge_Corner',
        ] as const

        expect(
          V_PEDESTAL_TABLE_CONFIG
            .materialSlots.primaryTop
            .targets,
        ).toEqual(tabletopMaterials)

        expect(
          V_PEDESTAL_TABLE_CONFIG
            .materialSlots.frameMetal
            .targets,
        ).toEqual([
          'Metal_Support',
          'Metal_Base',
        ])

        expectUniqueSlotTargets(
          V_PEDESTAL_TABLE_CONFIG
            .materialSlots,
        )

        tabletopMaterials.forEach(
          (materialName) => {
            expectFinishGroup(
              model,
              materialName,
              'PrimaryTop',
            )

            expectMaterialHasUv(
              model,
              materialName,
            )
          },
        )

        expectFinishGroup(
          model,
          'Metal_Support',
          'FrameMetal',
        )

        expectFinishGroup(
          model,
          'Metal_Base',
          'FrameMetal',
        )

        Object.values(
          V_PEDESTAL_TABLE_CONFIG
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

        expectMaterialNamesUnderObject(
          center,
          [
            'Stone_Top_Center',
            'Stone_Bottom_Center',
          ],
        )

        expectMaterialNamesUnderObject(
          frontEdge,
          [
            'Stone_Top_LongSegment',
            'Stone_Bottom_LongSegment',
            'Stone_Edge_Long',
          ],
        )

        expectMaterialNamesUnderObject(
          leftEdge,
          [
            'Stone_Top_ShortSegment',
            'Stone_Bottom_ShortSegment',
            'Stone_Edge_Short',
          ],
        )

        expectMaterialNamesUnderObject(
          frontRightCorner,
          [
            'Stone_Top_Corner',
            'Stone_Bottom_Corner',
            'Stone_Edge_Corner',
          ],
        )

        const controller =
          createFurnitureController(
            model,
            V_PEDESTAL_TABLE_CONFIG,
          )

        const materialController =
          createFurnitureMaterialController(
            model,
            V_PEDESTAL_TABLE_CONFIG,
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
            ).toBe('marble-cream')
          },
        )

        expect(
          getMaterialByName(
            model,
            'Metal_Support',
          ).userData.finishId,
        ).toBe('metal-black-matte')

        const baseTextureTransforms =
          Object.fromEntries(
            tabletopMaterials.map(
              (materialName) => [
                materialName,
                captureTextureTransform(
                  getMaterialMapByName(
                    model,
                    materialName,
                  ),
                ),
              ],
            ),
          )

        expect(
          controller.getDimensions(),
        ).toEqual({
          length: 1.2,
          width: 0.8,
        })

        expectBounds(
          model,
          [1.2, 0.76, 0.8],
        )

        expectSupportConnections(
          supportBeams,
          basePlinth,
          underTopMount,
        )

        controller.setDimensions({
          length: 1.6,
          width: 1.2,
        })

        expectAxisValue(
          center.scale.x,
          baseCenterScale.x *
            (1.55 / 1.15),
        )

        expectAxisValue(
          center.scale.y,
          baseCenterScale.y,
        )

        expectAxisValue(
          center.scale.z,
          baseCenterScale.z *
            (1.15 / 0.75),
        )

        expectAxisValue(
          frontEdge.position.z,
          baseFrontEdge.position.z +
            0.2,
        )

        expectAxisValue(
          frontEdge.scale.x,
          baseFrontEdge.scale.x *
            (1.55 / 1.15),
        )

        expectAxisValue(
          leftEdge.position.x,
          baseLeftEdge.position.x -
            0.2,
        )

        expectAxisValue(
          leftEdge.scale.z,
          baseLeftEdge.scale.z *
            (1.15 / 0.75),
        )

        expectAxisValue(
          frontRightCorner.position.x,
          baseCorner.position.x +
            0.2,
        )

        expectAxisValue(
          frontRightCorner.position.z,
          baseCorner.position.z +
            0.2,
        )

        expectVectorCloseTo(
          frontRightCorner.scale,
          baseCorner.scale,
        )

        supportNodes.forEach(
          (node, index) => {
            expectTransform(
              node,
              supportTransforms[index],
            )
          },
        )

        expectBounds(
          model,
          [1.6, 0.76, 1.2],
        )

        const textureFactors = {
          Stone_Top_Center:
            [1.6 / 1.2, 1.2 / 0.8],
          Stone_Bottom_Center:
            [1.6 / 1.2, 1.2 / 0.8],
          Stone_Top_LongSegment:
            [1.6 / 1.2, 1],
          Stone_Bottom_LongSegment:
            [1.6 / 1.2, 1],
          Stone_Top_ShortSegment:
            [1, 1.2 / 0.8],
          Stone_Bottom_ShortSegment:
            [1, 1.2 / 0.8],
          Stone_Top_Corner:
            [1, 1],
          Stone_Bottom_Corner:
            [1, 1],
          Stone_Edge_Long:
            [1.6 / 1.2, 1],
          Stone_Edge_Short:
            [1.2 / 0.8, 1],
          Stone_Edge_Corner:
            [1, 1],
        } as const

        tabletopMaterials.forEach(
          (materialName) => {
            const [factorX, factorY] =
              textureFactors[
                materialName
              ]

            expectCenteredTextureScale(
              getMaterialMapByName(
                model,
                materialName,
              ),
              baseTextureTransforms[
                materialName
              ],
              factorX,
              factorY,
            )
          },
        )

        await materialController
          .setFinishes({
            primaryTop:
              'walnut-natural',
            frameMetal:
              'metal-white-matte',
          })

        tabletopMaterials.forEach(
          (materialName) => {
            expect(
              getMaterialByName(
                model,
                materialName,
              ).userData.finishId,
            ).toBe('walnut-natural')

            const [factorX, factorY] =
              textureFactors[
                materialName
              ]

            expectCenteredTextureScale(
              getMaterialMapByName(
                model,
                materialName,
              ),
              {
                repeatX: 1,
                repeatY: 1,
                offsetX: 0,
                offsetY: 0,
              },
              factorX,
              factorY,
            )
          },
        )

        expect(
          getMaterialByName(
            model,
            'Metal_Support',
          ).userData.finishId,
        ).toBe('metal-white-matte')

        expectSupportConnections(
          supportBeams,
          basePlinth,
          underTopMount,
        )

        controller.setDimensions({
          length: 1.43,
          width: 0.97,
        })

        controller.setDimensions({
          length: 1.2,
          width: 0.8,
        })

        expectVectorCloseTo(
          center.scale,
          baseCenterScale,
        )

        expectTransform(
          frontEdge,
          baseFrontEdge,
        )

        expectTransform(
          leftEdge,
          baseLeftEdge,
        )

        expectTransform(
          frontRightCorner,
          baseCorner,
        )

        supportNodes.forEach(
          (node, index) => {
            expectTransform(
              node,
              supportTransforms[index],
            )
          },
        )

        tabletopMaterials.forEach(
          (materialName) => {
            expectTextureTransform(
              getMaterialMapByName(
                model,
                materialName,
              ),
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

function expectFinishGroup(
  model: THREE.Object3D,
  materialName: string,
  finishGroup: string,
): void {
  expect(
    getMaterialByName(
      model,
      materialName,
    ).userData
      .replaceableFinishGroup,
  ).toBe(finishGroup)
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

function expectMaterialNamesUnderObject(
  object: THREE.Object3D,
  expected: readonly string[],
): void {
  const names = new Set<string>()

  object.traverse((descendant) => {
    if (!(descendant instanceof THREE.Mesh)) {
      return
    }

    const materials =
      Array.isArray(
        descendant.material,
      )
        ? descendant.material
        : [descendant.material]

    materials.forEach((material) => {
      names.add(material.name)
    })
  })

  expect([...names]).toEqual(expected)
}

function expectSupportConnections(
  supports: THREE.Object3D[],
  basePlinth: THREE.Object3D,
  underTopMount: THREE.Object3D,
): void {
  const lowerTargetBounds =
    new THREE.Box3()
      .setFromObject(basePlinth)

  const upperTargetBounds =
    new THREE.Box3()
      .setFromObject(underTopMount)

  supports.forEach((support) => {
    expect(support).toBeInstanceOf(
      THREE.Mesh,
    )

    const mesh = support as THREE.Mesh
    mesh.geometry.computeBoundingBox()

    const localBounds =
      mesh.geometry.boundingBox

    if (!localBounds) {
      throw new Error(
        `Expected bounds for ${support.name}.`,
      )
    }

    const lowerPoint =
      mesh.localToWorld(
        new THREE.Vector3(
          0,
          localBounds.min.y,
          0,
        ),
      )

    const upperPoint =
      mesh.localToWorld(
        new THREE.Vector3(
          0,
          localBounds.max.y,
          0,
        ),
      )

    expectVectorCloseTo(
      lowerPoint,
      new THREE.Vector3(
        ...support.userData
          .lowerAnchor,
      ),
    )

    expectVectorCloseTo(
      upperPoint,
      new THREE.Vector3(
        ...support.userData
          .upperAnchor,
      ),
    )

    expectAxisValue(
      lowerPoint.y,
      0.020,
    )

    expectAxisValue(
      upperPoint.y,
      0.731,
    )

    expect(
      lowerTargetBounds
        .containsPoint(lowerPoint),
    ).toBe(true)

    expect(
      upperTargetBounds
        .containsPoint(upperPoint),
    ).toBe(true)

    const supportBounds =
      new THREE.Box3()
        .setFromObject(support)

    expect(
      supportBounds
        .intersectsBox(
          lowerTargetBounds,
        ),
    ).toBe(true)

    expect(
      supportBounds
        .intersectsBox(
          upperTargetBounds,
        ),
    ).toBe(true)
  })
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
