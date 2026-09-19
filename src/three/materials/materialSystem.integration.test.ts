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
} from '../furniture/furnitureController'

import {
  FIRST_TABLE_CONFIG,
} from '../models/first-table/config'

import {
  U_FRAME_TABLE_CONFIG,
} from '../models/u-frame-table/config'

import {
  SLAT_PEDESTAL_TABLE_CONFIG,
} from '../models/slat-pedestal-table/config'

import {
  V_PEDESTAL_TABLE_CONFIG,
} from '../models/v-pedestal-table/config'

import {
  disposeMaterialFinishCache,
} from './createMaterial'

import {
  createFurnitureMaterialController,
} from './materialController'

import {
  getMaterialFinish,
  getMaterialFinishes,
} from './materialRegistry'

afterEach(
  () => {
    disposeMaterialFinishCache()
    vi.unstubAllGlobals()
  },
)

describe(
  'production furniture material system',
  () => {
    const cases = [
      {
        path:
          'public/models/first-table.glb',
        definition:
          FIRST_TABLE_CONFIG,
        topMaterial:
          'Wood_Top',
        frameMaterial:
          'Metal_Graphite',
        expectedDefaultTop:
          'oak-natural',
        expectedDefaultFrame:
          'metal-anthracite',
        maxDimensions: {
          length: 2,
          width: 1,
        },
      },
      {
        path:
          'public/models/table-02-u-frame.glb',
        definition:
          U_FRAME_TABLE_CONFIG,
        topMaterial:
          'Top_Primary',
        frameMaterial:
          'Metal_Frame',
        expectedDefaultTop:
          'concrete-light',
        expectedDefaultFrame:
          'metal-black-matte',
        maxDimensions: {
          length: 1.65,
          width: 0.8,
        },
      },
    ] as const

    cases.forEach(
      ({
        path,
        definition,
        topMaterial,
        frameMaterial,
        expectedDefaultTop,
        expectedDefaultFrame,
        maxDimensions,
      }) => {
        it(
          `applies and switches declared finishes in ${definition.id}`,
          async () => {
            stubImageElement()

            const model =
              await loadProductionModel(
                path,
              )

            const furnitureController =
              createFurnitureController(
                model,
                definition,
              )

            const materialController =
              createFurnitureMaterialController(
                model,
                definition,
                {
                  maxAnisotropy: 16,
                  onMaterialsChanged:
                    furnitureController.refreshTextures,
                },
              )

            await materialController
              .setFinishes(
                materialController
                  .getSelections(),
              )

            expect(
              getMaterialByName(
                model,
                topMaterial,
              ).userData.finishId,
            ).toBe(
              expectedDefaultTop,
            )

            expect(
              getMaterialByName(
                model,
                frameMaterial,
              ).userData.finishId,
            ).toBe(
              expectedDefaultFrame,
            )

            furnitureController
              .setDimensions(
                maxDimensions,
              )

            const baseLength =
              definition.dimensions
                .length.base

            const baseWidth =
              definition.dimensions
                .width.base

            expect(
              getMaterialMapByName(
                model,
                topMaterial,
              ).repeat.x,
            ).toBeCloseTo(
              maxDimensions.length /
                baseLength,
            )

            expect(
              getMaterialMapByName(
                model,
                topMaterial,
              ).repeat.y,
            ).toBeCloseTo(
              maxDimensions.width /
                baseWidth,
            )

            await materialController
              .setFinishes({
                primaryTop:
                  'walnut-natural',
                frameMetal:
                  'metal-white-matte',
              })

            const switchedTop =
              getMaterialByName(
                model,
                topMaterial,
              )

            const switchedFrame =
              getMaterialByName(
                model,
                frameMaterial,
              )

            expect(
              switchedTop.userData
                .finishId,
            ).toBe(
              'walnut-natural',
            )

            expect(
              switchedFrame.userData
                .finishId,
            ).toBe(
              'metal-white-matte',
            )

            expect(
              getMaterialMapByName(
                model,
                topMaterial,
              ).repeat.x,
            ).toBeCloseTo(
              maxDimensions.length /
                baseLength,
            )

            expect(
              getMaterialMapByName(
                model,
                topMaterial,
              ).repeat.y,
            ).toBeCloseTo(
              maxDimensions.width /
                baseWidth,
            )

            expect(
              getMaterialMapByName(
                model,
                topMaterial,
              ).anisotropy,
            ).toBe(8)

            expect(
              switchedFrame,
            ).toBeInstanceOf(
              THREE.MeshStandardMaterial,
            )

            if (
              switchedFrame instanceof
              THREE.MeshStandardMaterial
            ) {
              expect(
                switchedFrame.metalness,
              ).toBeCloseTo(0.04)

              expect(
                switchedFrame.roughness,
              ).toBeCloseTo(0.32)
            }

            furnitureController
              .setDimensions(
                Object.fromEntries(
                  Object.entries(
                    definition.dimensions,
                  ).map(
                    ([name, config]) => [
                      name,
                      config.base,
                    ],
                  ),
                ),
              )

            expect(
              getMaterialMapByName(
                model,
                topMaterial,
              ).repeat.x,
            ).toBeCloseTo(1)

            expect(
              getMaterialMapByName(
                model,
                topMaterial,
              ).repeat.y,
            ).toBeCloseTo(1)
          },
        )
      },
    )

    it(
      'ships every registered texture map as a non-empty JPEG',
      async () => {
        const textureFinishes =
          getMaterialFinishes()
            .filter(
              (finish) =>
                finish.kind ===
                'texture',
            )

        expect(
          textureFinishes,
        ).toHaveLength(13)

        for (
          const finish of
          textureFinishes
        ) {
          for (
            const url of
            Object.values(
              finish.maps,
            )
          ) {
            const bytes =
              await readFile(
                `public${url}`,
              )

            expect(
              bytes.byteLength,
            ).toBeGreaterThan(
              100_000,
            )

            expect(
              Array.from(
                bytes.subarray(
                  0,
                  3,
                ),
              ),
            ).toEqual([
              0xff,
              0xd8,
              0xff,
            ])
          }
        }
      },
    )

    it(
      'resolves every finish declared by every production model config',
      () => {
        const definitions = [
          FIRST_TABLE_CONFIG,
          U_FRAME_TABLE_CONFIG,
          SLAT_PEDESTAL_TABLE_CONFIG,
          V_PEDESTAL_TABLE_CONFIG,
        ]

        definitions.forEach(
          (definition) => {
            Object.values(
              definition.materialSlots,
            ).forEach(
              (slot) => {
                expect(
                  slot.allowedFinishes,
                ).toContain(
                  slot.defaultFinish,
                )

                slot.allowedFinishes
                  .forEach(
                    (
                      finishId:
                        string,
                    ) => {
                      expect(
                        getMaterialFinish(
                          finishId,
                        ).id,
                      ).toBe(
                        finishId,
                      )
                    },
                  )
              },
            )
          },
        )
      },
    )

    it(
      'keeps custom finishes non-metallic and model availability declarative',
      () => {
        const goldMarbles = [
          'marble-white-gold',
          'marble-black-gold',
          'marble-duo-gold',
        ] as const

        goldMarbles.forEach(
          (finishId) => {
            const finish =
              getMaterialFinish(
                finishId,
              )

            expect(
              finish.category,
            ).toBe('stone')

            expect(
              finish.metalness,
            ).toBe(0)
          },
        )

        expect(
          SLAT_PEDESTAL_TABLE_CONFIG
            .materialSlots.pedestalWood
            .allowedFinishes,
        ).toEqual(
          expect.arrayContaining([
            'oak-grey',
            'oak-silver',
            'oak-black',
          ]),
        )

        expect(
          SLAT_PEDESTAL_TABLE_CONFIG
            .materialSlots.pedestalWood
            .allowedFinishes,
        ).not.toContain(
          'marble-white-gold',
        )

        expect(
          V_PEDESTAL_TABLE_CONFIG
            .materialSlots.primaryTop
            .allowedFinishes,
        ).toEqual(
          expect.arrayContaining([
            ...goldMarbles,
            'terrazzo-neutral',
          ]),
        )

        expect(
          V_PEDESTAL_TABLE_CONFIG
            .materialSlots.primaryTop
            .allowedFinishes,
        ).not.toContain(
          'oak-grey',
        )
      },
    )
  },
)

async function loadProductionModel(
  path: string,
): Promise<THREE.Group> {
  const file =
    await readFile(path)

  const gltf =
    await new GLTFLoader()
      .parseAsync(
        Uint8Array.from(
          file,
        ).buffer,
        '',
      )

  return gltf.scene
}

function getMaterialByName(
  object: THREE.Object3D,
  materialName: string,
): THREE.Material {
  let result:
    THREE.Material | null =
      null

  object.traverse(
    (descendant) => {
      if (
        result ||
        !(
          descendant instanceof
          THREE.Mesh
        )
      ) {
        return
      }

      const materials =
        Array.isArray(
          descendant.material,
        )
          ? descendant.material
          : [descendant.material]

      result =
        materials.find(
          (material) =>
            material.name ===
            materialName,
        ) ?? null
    },
  )

  if (!result) {
    throw new Error(
      `Expected material "${materialName}".`,
    )
  }

  return result
}

function getMaterialMapByName(
  object: THREE.Object3D,
  materialName: string,
): THREE.Texture {
  const material =
    getMaterialByName(
      object,
      materialName,
    )

  if (
    !(
      material instanceof
      THREE.MeshStandardMaterial
    ) ||
    !material.map
  ) {
    throw new Error(
      `Expected material "${materialName}" to have a map.`,
    )
  }

  return material.map
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

    this.listeners.set(
      type,
      listeners,
    )
  }

  removeEventListener(
    type: string,
    listener:
      EventListenerOrEventListenerObject,
  ): void {
    this.listeners
      .get(type)
      ?.delete(listener)
  }

  set src(value: string) {
    this.source = value
    this.complete = true

    queueMicrotask(
      () => {
        const event =
          new Event('load')

        this.listeners
          .get('load')
          ?.forEach(
            (listener) => {
              if (
                typeof listener ===
                'function'
              ) {
                listener.call(
                  this,
                  event,
                )

                return
              }

              listener.handleEvent(
                event,
              )
            },
          )
      },
    )
  }

  get src(): string {
    return this.source
  }
}

function stubImageElement(): void {
  vi.stubGlobal(
    'self',
    globalThis,
  )

  vi.stubGlobal(
    'document',
    {
      createElementNS: () =>
        new MockImageElement(),
    },
  )
}
