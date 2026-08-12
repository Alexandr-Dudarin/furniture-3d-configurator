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
  U_FRAME_TABLE_CONFIG,
} from './config'

const EPSILON_DIGITS = 10

afterEach(
  () => {
    vi.unstubAllGlobals()
  },
)

describe(
  'U_FRAME_TABLE_CONFIG',
  () => {
    it(
      'controls the production GLB across its complete configured range',
      async () => {
        stubImageElement()

        const file =
          await readFile(
            'public/models/table-02-u-frame.glb',
          )

        const gltf =
          await new GLTFLoader()
            .parseAsync(
              Uint8Array.from(
                file,
              ).buffer,
              '',
            )

        const model =
          gltf.scene

        const top =
          getRequiredObject(
            model,
            'TableTop',
          )

        const leftFrame =
          getRequiredObject(
            model,
            'Frame_Left',
          )

        const rightFrame =
          getRequiredObject(
            model,
            'Frame_Right',
          )

        const posts = [
          'Frame_Left_Post_Front',
          'Frame_Left_Post_Back',
          'Frame_Right_Post_Front',
          'Frame_Right_Post_Back',
        ].map(
          (name) =>
            getRequiredObject(
              model,
              name,
            ),
        )

        const rails = [
          'Frame_Left_BottomRail',
          'Frame_Right_BottomRail',
        ].map(
          (name) =>
            getRequiredObject(
              model,
              name,
            ),
        )

        const baseTopScale =
          top.scale.clone()

        const basePostScales =
          posts.map(
            (post) =>
              post.scale.clone(),
          )

        const controller =
          createFurnitureController(
            model,
            U_FRAME_TABLE_CONFIG,
          )

        const topMaterial =
          getMaterialByName(
            top,
            'Top_Primary',
          )

        const frameMaterial =
          getMaterialByName(
            leftFrame,
            'Metal_Frame',
          )

        expect(
          topMaterial.userData
            .replaceableFinishGroup,
        ).toBe('PrimaryTop')

        expect(
          frameMaterial.userData
            .replaceableFinishGroup,
        ).toBe('FrameMetal')

        expect(
          frameMaterial,
        ).toBeInstanceOf(
          THREE.MeshStandardMaterial,
        )

        if (
          frameMaterial instanceof
          THREE.MeshStandardMaterial
        ) {
          expectAxisValue(
            frameMaterial.metalness,
            0.04,
          )

          expectAxisValue(
            frameMaterial.roughness,
            0.29,
          )
        }

        const topTexture =
          getMaterialMapByName(
            top,
            'Top_Primary',
          )

        const baseRepeat =
          topTexture.repeat.clone()

        const baseOffset =
          topTexture.offset.clone()

        expect(
          controller.getDimensions(),
        ).toEqual({
          length: 0.95,
          width: 0.55,
        })

        controller.setDimensions({
          length: 1.65,
          width: 0.8,
        })

        expectAxisValue(
          top.scale.x,
          baseTopScale.x *
            (1.65 / 0.95),
        )

        expectAxisValue(
          top.scale.y,
          baseTopScale.y,
        )

        expectAxisValue(
          top.scale.z,
          baseTopScale.z *
            (0.8 / 0.55),
        )

        expectAxisValue(
          leftFrame.position.x,
          -0.7875,
        )

        expectAxisValue(
          rightFrame.position.x,
          0.7875,
        )

        posts.forEach(
          (post, index) => {
            const side =
              post.position.z < 0
                ? -1
                : 1

            expectAxisValue(
              post.position.z,
              side * 0.3675,
            )

            expectVectorCloseTo(
              post.scale,
              basePostScales[index],
            )
          },
        )

        rails.forEach(
          (rail) => {
            expectAxisValue(
              rail.scale.x,
              1,
            )

            expectAxisValue(
              rail.scale.y,
              1,
            )

            expectAxisValue(
              rail.scale.z,
              0.76 / 0.51,
            )
          },
        )

        expectAxisValue(
          topTexture.repeat.x,
          baseRepeat.x *
            (1.65 / 0.95),
        )

        expectAxisValue(
          topTexture.repeat.y,
          baseRepeat.y *
            (0.8 / 0.55),
        )

        controller.setDimensions({
          length: 1.2,
          width: 0.65,
        })

        controller.setDimensions({
          length: 0.95,
          width: 0.55,
        })

        expectVectorCloseTo(
          top.scale,
          baseTopScale,
        )

        expectAxisValue(
          leftFrame.position.x,
          -0.4375,
        )

        expectAxisValue(
          rightFrame.position.x,
          0.4375,
        )

        posts.forEach(
          (post, index) => {
            const side =
              post.position.z < 0
                ? -1
                : 1

            expectAxisValue(
              post.position.z,
              side * 0.2425,
            )

            expectVectorCloseTo(
              post.scale,
              basePostScales[index],
            )
          },
        )

        rails.forEach(
          (rail) => {
            expectVectorCloseTo(
              rail.scale,
              new THREE.Vector3(
                1,
                1,
                1,
              ),
            )
          },
        )

        expectAxisValue(
          topTexture.repeat.x,
          baseRepeat.x,
        )

        expectAxisValue(
          topTexture.repeat.y,
          baseRepeat.y,
        )

        expectAxisValue(
          topTexture.offset.x,
          baseOffset.x,
        )

        expectAxisValue(
          topTexture.offset.y,
          baseOffset.y,
        )
      },
    )
  },
)

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

function getMaterialByName(
  object: THREE.Object3D,
  materialName: string,
): THREE.Material {
  let result:
    THREE.Material | null = null

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
          (candidate) =>
            candidate.name ===
            materialName,
        ) ?? null
    },
  )

  if (!result) {
    throw new Error(
      `Expected material "${materialName}" in the production GLB.`,
    )
  }

  return result
}

function expectVectorCloseTo(
  actual: THREE.Vector3,
  expected: THREE.Vector3,
): void {
  expectAxisValue(
    actual.x,
    expected.x,
  )

  expectAxisValue(
    actual.y,
    expected.y,
  )

  expectAxisValue(
    actual.z,
    expected.z,
  )
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
