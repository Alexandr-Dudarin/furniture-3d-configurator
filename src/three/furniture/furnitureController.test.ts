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
  FIRST_TABLE_CONFIG,
} from '../models/first-table/config'

import {
  createFurnitureController,
} from './furnitureController'

import type {
  FurnitureDefinition,
} from './types'

const EPSILON_DIGITS = 12

afterEach(
  () => {
    vi.unstubAllGlobals()
  },
)

describe(
  'createFurnitureController',
  () => {
    it(
      'applies the first-table config to the production GLB without regressions',
      async () => {
        stubImageElement()

        const file =
          await readFile(
            'public/models/first-table.glb',
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

        const legs = [
          'Leg_01',
          'Leg_02',
          'Leg_03',
          'Leg_04',
        ].map(
          (name) =>
            getRequiredObject(
              model,
              name,
            ),
        )

        const baseTopScale =
          top.scale.clone()

        const baseLegPositions =
          legs.map(
            (leg) =>
              leg.position.clone(),
          )

        const baseLegScales =
          legs.map(
            (leg) =>
              leg.scale.clone(),
          )

        const controller =
          createFurnitureController(
            model,
            FIRST_TABLE_CONFIG,
          )

        const texture =
          getMaterialMapByName(
            top,
            'Wood_Top',
          )

        const baseRepeat =
          texture.repeat.clone()

        const baseOffset =
          texture.offset.clone()

        controller.setDimensions({
          length: 2,
          width: 1,
        })

        expectAxisValue(
          top.scale.x,
          baseTopScale.x *
            (2 / 1.2),
        )

        expectAxisValue(
          top.scale.y,
          baseTopScale.y,
        )

        expectAxisValue(
          top.scale.z,
          baseTopScale.z *
            (1 / 0.6),
        )

        legs.forEach(
          (leg, index) => {
            expectVectorCloseTo(
              leg.scale,
              baseLegScales[index],
            )

            const basePosition =
              baseLegPositions[index]

            const expectedX =
              basePosition.x +
              Math.sign(
                basePosition.x,
              ) *
                0.4

            const expectedZ =
              basePosition.z +
              Math.sign(
                basePosition.z,
              ) *
                0.2

            expectAxisValue(
              leg.position.x,
              expectedX,
            )

            expectAxisValue(
              leg.position.z,
              expectedZ,
            )
          },
        )

        expectTextureTransform(
          texture,
          baseRepeat.x *
            (2 / 1.2),
          baseRepeat.y *
            (1 / 0.6),
          baseOffset.x +
            (
              baseRepeat.x *
              (1 - 2 / 1.2)
            ) /
              2,
          baseOffset.y +
            (
              baseRepeat.y *
              (1 - 1 / 0.6)
            ) /
              2,
        )

        controller.setDimensions({
          length: 1.2,
          width: 0.6,
        })

        expectVectorCloseTo(
          top.scale,
          baseTopScale,
        )

        legs.forEach(
          (leg, index) => {
            expectVectorCloseTo(
              leg.position,
              baseLegPositions[index],
            )

            expectVectorCloseTo(
              leg.scale,
              baseLegScales[index],
            )
          },
        )

        expectTextureTransform(
          texture,
          baseRepeat.x,
          baseRepeat.y,
          baseOffset.x,
          baseOffset.y,
        )
      },
    )

    it(
      'preserves the existing first-table scale, edge-anchor and texture behavior',
      () => {
        const {
          model,
          top,
          legs,
        } = createFirstTableFixture()

        const controller =
          createFurnitureController(
            model,
            FIRST_TABLE_CONFIG,
          )

        expect(
          controller.getDimensions(),
        ).toEqual({
          length: 1.2,
          width: 0.6,
        })

        expectScale(
          top,
          1,
          1,
          1,
        )

        expectLegPositions(
          legs,
          0.53,
          0.23,
        )

        const texture =
          getRequiredMap(top)

        expectTextureTransform(
          texture,
          2,
          3,
          0.1,
          0.2,
        )

        controller.setDimensions({
          length: 2,
          width: 1,
        })

        expectScale(
          top,
          2 / 1.2,
          1,
          1 / 0.6,
        )

        legs.forEach(
          (leg) => {
            expectScale(
              leg,
              1,
              1,
              1,
            )
          },
        )

        expectLegPositions(
          legs,
          0.93,
          0.43,
        )

        expectTextureTransform(
          texture,
          2 * (2 / 1.2),
          3 * (1 / 0.6),
          0.1 +
            (
              2 *
              (1 - 2 / 1.2)
            ) /
              2,
          0.2 +
            (
              3 *
              (1 - 1 / 0.6)
            ) /
              2,
        )

        controller.setDimensions({
          length: 1.4,
          width: 0.8,
        })

        controller.setDimensions({
          length: 1.2,
          width: 0.6,
        })

        expectScale(
          top,
          1,
          1,
          1,
        )

        expectLegPositions(
          legs,
          0.53,
          0.23,
        )

        expectTextureTransform(
          texture,
          2,
          3,
          0.1,
          0.2,
        )
      },
    )

    it(
      'moves delta targets from their base positions with independent signed factors',
      () => {
        const model =
          new THREE.Group()

        const leftSupport =
          new THREE.Object3D()

        leftSupport.name =
          'Support_Left'

        leftSupport.position.x =
          -0.1

        const rightSupport =
          new THREE.Object3D()

        rightSupport.name =
          'Support_Right'

        rightSupport.position.x =
          0.2

        model.add(
          leftSupport,
          rightSupport,
        )

        const controller =
          createFurnitureController(
            model,
            DELTA_MOVE_DEFINITION,
          )

        expectAxisValue(
          leftSupport.position.x,
          -0.1,
        )

        expectAxisValue(
          rightSupport.position.x,
          0.2,
        )

        controller.setDimension(
          'span',
          1.8,
        )

        expectAxisValue(
          leftSupport.position.x,
          -0.4,
        )

        expectAxisValue(
          rightSupport.position.x,
          0.35,
        )

        controller.setDimension(
          'span',
          1.2,
        )

        expectAxisValue(
          leftSupport.position.x,
          -0.1,
        )

        expectAxisValue(
          rightSupport.position.x,
          0.2,
        )

        ;[
          1.8,
          1.4,
          2,
          1.2,
        ].forEach(
          (value) => {
            controller.setDimension(
              'span',
              value,
            )
          },
        )

        expectAxisValue(
          leftSupport.position.x,
          -0.1,
        )

        expectAxisValue(
          rightSupport.position.x,
          0.2,
        )
      },
    )

    it(
      'stretches only the configured local axis and preserves rotation',
      () => {
        const model =
          new THREE.Group()

        const segment =
          new THREE.Object3D()

        segment.name =
          'Rotated_Rail'

        segment.scale.set(
          2,
          3,
          4,
        )

        segment.rotation.set(
          0.25,
          0.5,
          0.75,
        )

        const baseRotation =
          segment.rotation
            .clone()

        model.add(segment)

        const controller =
          createFurnitureController(
            model,
            STRETCH_SEGMENT_DEFINITION,
          )

        expectScale(
          segment,
          2,
          3,
          4,
        )

        controller.setDimension(
          'span',
          1.8,
        )

        expectScale(
          segment,
          2,
          4.5,
          4,
        )

        expectRotation(
          segment,
          baseRotation,
        )

        controller.setDimension(
          'span',
          0.8,
        )

        expectScale(
          segment,
          2,
          2,
          4,
        )

        ;[
          1.4,
          2,
          1,
          1.2,
        ].forEach(
          (value) => {
            controller.setDimension(
              'span',
              value,
            )
          },
        )

        expectScale(
          segment,
          2,
          3,
          4,
        )

        expectRotation(
          segment,
          baseRotation,
        )
      },
    )
  },
)

const DELTA_MOVE_DEFINITION = {
  id: 'delta-move-fixture',
  label: 'Delta Move Fixture',
  modelUrl: '/unused.glb',
  dimensions: {
    span: {
      label: 'Span',
      base: 1.2,
      min: 1.2,
      max: 2,
      step: 0.1,
    },
  },
  dimensionOrder: [
    'span',
  ],
  resizeRules: [
    {
      type: 'delta-move',
      dimension: 'span',
      axis: 'x',
      targets: [
        {
          target:
            'Support_Left',
          factor: -0.5,
        },
        {
          target:
            'Support_Right',
          factor: 0.25,
        },
      ],
    },
  ],
  textureAxes: {},
} as const satisfies FurnitureDefinition

const STRETCH_SEGMENT_DEFINITION = {
  id: 'stretch-segment-fixture',
  label: 'Stretch Segment Fixture',
  modelUrl: '/unused.glb',
  dimensions: {
    span: {
      label: 'Span',
      base: 1.2,
      min: 0.8,
      max: 2,
      step: 0.1,
    },
  },
  dimensionOrder: [
    'span',
  ],
  resizeRules: [
    {
      type: 'stretch-segment',
      target: 'Rotated_Rail',
      dimension: 'span',
      axis: 'y',
      baseLength: 0.9,
      factor: 0.75,
    },
  ],
  textureAxes: {},
} as const satisfies FurnitureDefinition

type FirstTableFixture = {
  model: THREE.Group
  top: THREE.Mesh
  legs: readonly THREE.Object3D[]
}

function createFirstTableFixture():
  FirstTableFixture {
  const model =
    new THREE.Group()

  const texture =
    new THREE.Texture()

  texture.repeat.set(
    2,
    3,
  )

  texture.offset.set(
    0.1,
    0.2,
  )

  const material =
    new THREE.MeshStandardMaterial({
      map: texture,
    })

  material.name =
    'Wood_Top'

  const top =
    new THREE.Mesh(
      new THREE.BoxGeometry(),
      material,
    )

  top.name = 'TableTop'

  const positions = [
    [0.53, -0.23],
    [-0.53, -0.23],
    [-0.53, 0.23],
    [0.53, 0.23],
  ] as const

  const legs =
    positions.map(
      ([x, z], index) => {
        const leg =
          new THREE.Object3D()

        leg.name =
          `Leg_0${index + 1}`

        leg.position.set(
          x,
          0.355,
          z,
        )

        return leg
      },
    )

  model.add(
    top,
    ...legs,
  )

  return {
    model,
    top,
    legs,
  }
}

function getRequiredMap(
  mesh: THREE.Mesh,
): THREE.Texture {
  const material =
    mesh.material

  if (
    Array.isArray(material) ||
    !(
      material instanceof
      THREE.MeshStandardMaterial
    ) ||
    !material.map
  ) {
    throw new Error(
      'Expected a MeshStandardMaterial with a map.',
    )
  }

  return material.map
}

function getMaterialMapByName(
  object: THREE.Object3D,
  materialName: string,
): THREE.Texture {
  let result:
    THREE.Texture | null = null

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

      const material =
        materials.find(
          (candidate) =>
            candidate.name ===
            materialName,
        )

      if (
        material instanceof
          THREE.MeshStandardMaterial &&
        material.map
      ) {
        result = material.map
      }
    },
  )

  if (!result) {
    throw new Error(
      `Expected material "${materialName}" to have a map.`,
    )
  }

  return result
}

function getRequiredObject(
  model: THREE.Object3D,
  name: string,
): THREE.Object3D {
  const object =
    model.getObjectByName(name)

  if (!object) {
    throw new Error(
      `Expected object "${name}" in the fixture.`,
    )
  }

  return object
}

function expectLegPositions(
  legs:
    readonly THREE.Object3D[],
  absoluteX: number,
  absoluteZ: number,
): void {
  const expected = [
    [absoluteX, -absoluteZ],
    [-absoluteX, -absoluteZ],
    [-absoluteX, absoluteZ],
    [absoluteX, absoluteZ],
  ] as const

  legs.forEach(
    (leg, index) => {
      const position =
        expected[index]

      expectAxisValue(
        leg.position.x,
        position[0],
      )

      expectAxisValue(
        leg.position.z,
        position[1],
      )
    },
  )
}

function expectScale(
  object: THREE.Object3D,
  x: number,
  y: number,
  z: number,
): void {
  expectAxisValue(
    object.scale.x,
    x,
  )

  expectAxisValue(
    object.scale.y,
    y,
  )

  expectAxisValue(
    object.scale.z,
    z,
  )
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

function expectRotation(
  object: THREE.Object3D,
  expected: THREE.Euler,
): void {
  expectAxisValue(
    object.rotation.x,
    expected.x,
  )

  expectAxisValue(
    object.rotation.y,
    expected.y,
  )

  expectAxisValue(
    object.rotation.z,
    expected.z,
  )
}

function expectTextureTransform(
  texture: THREE.Texture,
  repeatX: number,
  repeatY: number,
  offsetX: number,
  offsetY: number,
): void {
  expectAxisValue(
    texture.repeat.x,
    repeatX,
  )

  expectAxisValue(
    texture.repeat.y,
    repeatY,
  )

  expectAxisValue(
    texture.offset.x,
    offsetX,
  )

  expectAxisValue(
    texture.offset.y,
    offsetY,
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
