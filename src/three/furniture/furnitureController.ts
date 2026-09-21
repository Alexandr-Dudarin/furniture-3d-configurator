import * as THREE from 'three'
import { affineTextureTransform, validateTextureTransforms } from './affineTexture'

import type {
  AffineTextureBindings,
  DimensionName,
  FurnitureDefinition,
  MaterialTextureAxisBinding,
  ModelAxis,
  TextureAxis,
} from './types'

type DimensionValues =
  Record<DimensionName, number>

type ScaleState = {
  object: THREE.Object3D
  dimension: DimensionName
  axis: ModelAxis
  baseScale: number
}

type EdgeAnchorState = {
  object: THREE.Object3D
  dimension: DimensionName
  axis: ModelAxis
  center: number
  side: -1 | 1
  insetFromEdge: number
}

type DeltaMoveState = {
  object: THREE.Object3D
  dimension: DimensionName
  axis: ModelAxis
  basePosition: number
  factor: number
}

type StretchSegmentState = {
  object: THREE.Object3D
  dimension: DimensionName
  axis: ModelAxis
  baseScale: number
  baseLength: number
  factor: number
}

type TextureState = {
  transforms?: AffineTextureBindings
  texture: THREE.Texture

  baseRepeatX: number
  baseRepeatY: number

  baseOffsetX: number
  baseOffsetY: number

  axes:
    Readonly<
      Record<
        DimensionName,
        readonly TextureAxis[]
      >
    >
}

export type FurnitureController = {
  readonly model: THREE.Group

  readonly definition:
    FurnitureDefinition

  getDimensions: () =>
    DimensionValues

  setDimension: (
    dimension: DimensionName,
    value: number,
  ) => void

  setDimensions: (
    values: Partial<DimensionValues>,
  ) => void

  /*
   * Rebuilds texture bindings after a generic
   * material controller replaces materials.
   * Current physical dimensions are reapplied
   * immediately, so UV compensation is kept.
   */
  refreshTextures: () => void
}

export function createFurnitureController(
  model: THREE.Group,
  definition: FurnitureDefinition,
): FurnitureController {
  /*
   * --------------------------------
   * CURRENT DIMENSIONS
   * --------------------------------
   */

  const dimensions:
    DimensionValues = {}

  Object.entries(
    definition.dimensions,
  ).forEach(
    ([dimension, config]) => {
      dimensions[dimension] =
        config.base
    },
  )

  /*
   * --------------------------------
   * GEOMETRY RULES
   * --------------------------------
   */

  const scaleStates:
    ScaleState[] = []

  const edgeAnchorStates:
    EdgeAnchorState[] = []

  const deltaMoveStates:
    DeltaMoveState[] = []

  const stretchSegmentStates:
    StretchSegmentState[] = []

  definition.resizeRules.forEach(
    (rule) => {
      const dimensionConfig =
        definition.dimensions[
          rule.dimension
        ]

      if (!dimensionConfig) {
        throw new Error(
          `[${definition.id}] Unknown dimension "${rule.dimension}".`,
        )
      }

      /*
       * SCALE RULE
       */

      if (rule.type === 'scale') {
        const object =
          getRequiredObject(
            model,
            rule.target,
            definition.id,
          )

        scaleStates.push({
          object,
          dimension:
            rule.dimension,
          axis: rule.axis,
          baseScale:
            object.scale[
              rule.axis
            ],
        })

        return
      }

      /*
       * EDGE ANCHOR RULE
       */

      if (
        rule.type ===
        'edge-anchor'
      ) {
        const center =
          rule.center ?? 0

        const baseHalfSize =
          dimensionConfig.base / 2

        rule.targets.forEach(
          (targetName) => {
            const object =
              getRequiredObject(
                model,
                targetName,
                definition.id,
              )

            const basePosition =
              object.position[
                rule.axis
              ]

            const deltaFromCenter =
              basePosition - center

            /*
             * Edge-anchor объект должен
             * находиться по одну из сторон
             * от центра.
             *
             * Центральная опора просто
             * не должна получать такое
             * resize-rule.
             */
            if (
              Math.abs(
                deltaFromCenter,
              ) < 1e-6
            ) {
              throw new Error(
                `[${definition.id}] Object "${targetName}" cannot use edge-anchor on axis "${rule.axis}" because it is positioned at the anchor center.`,
              )
            }

            const side:
              -1 | 1 =
                deltaFromCenter < 0
                  ? -1
                  : 1

            const insetFromEdge =
              baseHalfSize -
              Math.abs(
                deltaFromCenter,
              )

            edgeAnchorStates.push({
              object,
              dimension:
                rule.dimension,
              axis: rule.axis,
              center,
              side,
              insetFromEdge,
            })
          },
        )

        return
      }

      /*
       * DELTA MOVE RULE
       */

      if (
        rule.type ===
        'delta-move'
      ) {
        rule.targets.forEach(
          ({
            target,
            factor,
          }) => {
            assertFiniteRuleNumber(
              factor,
              'factor',
              target,
              definition.id,
              rule.type,
            )

            const object =
              getRequiredObject(
                model,
                target,
                definition.id,
              )

            deltaMoveStates.push({
              object,
              dimension:
                rule.dimension,
              axis: rule.axis,
              basePosition:
                object.position[
                  rule.axis
                ],
              factor,
            })
          },
        )

        return
      }

      /*
       * STRETCH SEGMENT RULE
       */

      const factor =
        rule.factor ?? 1

      assertPositiveRuleNumber(
        rule.baseLength,
        'baseLength',
        rule.target,
        definition.id,
        rule.type,
      )

      assertFiniteRuleNumber(
        factor,
        'factor',
        rule.target,
        definition.id,
        rule.type,
      )

      const object =
        getRequiredObject(
          model,
          rule.target,
          definition.id,
        )

      stretchSegmentStates.push({
        object,
        dimension:
          rule.dimension,
        axis: rule.axis,
        baseScale:
          object.scale[
            rule.axis
          ],
        baseLength:
          rule.baseLength,
        factor,
      })
    },
  )

  /*
   * --------------------------------
   * TEXTURE RULES
   * --------------------------------
   */

  if (definition.loadRuntime) throw new Error('Load the furniture runtime definition before creating its controller.')
  validateTextureTransforms(definition)

  const textureStates:
    TextureState[] = []

  prepareMaterialsAndTextures(
    model,
    definition,
    textureStates,
    true,
  )

  /*
   * --------------------------------
   * APPLY DIMENSIONS
   * --------------------------------
   */

  const applyDimensions =
    () => {
      /*
       * SCALE
       */

      scaleStates.forEach(
        ({
          object,
          dimension,
          axis,
          baseScale,
        }) => {
          const config =
            definition.dimensions[
              dimension
            ]

          const value =
            dimensions[
              dimension
            ]

          const factor =
            value /
            config.base

          object.scale[axis] =
            baseScale *
            factor
        },
      )

      /*
       * EDGE ANCHOR
       */

      edgeAnchorStates.forEach(
        ({
          object,
          dimension,
          axis,
          center,
          side,
          insetFromEdge,
        }) => {
          const value =
            dimensions[
              dimension
            ]

          const newHalfSize =
            value / 2

          object.position[axis] =
            center +
            side *
              (
                newHalfSize -
                insetFromEdge
              )
        },
      )

      /*
       * DELTA MOVE
       */

      deltaMoveStates.forEach(
        ({
          object,
          dimension,
          axis,
          basePosition,
          factor,
        }) => {
          const config =
            definition.dimensions[
              dimension
            ]

          const dimensionDelta =
            dimensions[dimension] -
            config.base

          object.position[axis] =
            basePosition +
            dimensionDelta *
              factor
        },
      )

      /*
       * STRETCH SEGMENT
       */

      stretchSegmentStates.forEach(
        ({
          object,
          dimension,
          axis,
          baseScale,
          baseLength,
          factor,
        }) => {
          const config =
            definition.dimensions[
              dimension
            ]

          const dimensionDelta =
            dimensions[dimension] -
            config.base

          const newLength =
            baseLength +
            dimensionDelta *
              factor

          if (newLength <= 0) {
            throw new Error(
              `[${definition.id}] stretch-segment calculated a non-positive length for object "${object.name}".`,
            )
          }

          object.scale[axis] =
            baseScale *
            (
              newLength /
              baseLength
            )
        },
      )

      /*
       * TEXTURES
       */

      textureStates.forEach(
        (state) => {
          resetTexture(state)
          if (state.transforms) {
            for (const [uvAxis, binding] of Object.entries(state.transforms)) {
              const axis = uvAxis === 'u' ? 'x' : 'y'
              const { repeat, offset } = affineTextureTransform(binding,
                dimensions[binding.dimension] - definition.dimensions[binding.dimension].base,
                axis === 'x' ? state.baseRepeatX : state.baseRepeatY,
                axis === 'x' ? state.baseOffsetX : state.baseOffsetY)
              state.texture.repeat[axis] = repeat
              state.texture.offset[axis] = offset
            }
            return
          }

          Object.entries(
            state.axes,
          ).forEach(
            ([
              dimension,
              axes,
            ]) => {
              const config =
                definition
                  .dimensions[
                    dimension
                  ]

              if (!config) {
                return
              }

              const value =
                dimensions[
                  dimension
                ]

              const factor =
                value /
                config.base

              axes.forEach(
                (axis) => {
                  applyTextureAxis(
                    state,
                    axis,
                    factor,
                  )
                },
              )
            },
          )
        },
      )

      model.updateMatrixWorld(
        true,
      )
    }

  /*
   * Начальное состояние.
   */

  applyDimensions()

  return {
    model,

    definition,

    getDimensions() {
      return {
        ...dimensions,
      }
    },

    setDimension(
      dimension,
      value,
    ) {
      setDimensionValue(
        dimensions,
        definition,
        dimension,
        value,
      )

      applyDimensions()
    },

    setDimensions(values) {
      Object.entries(
        values,
      ).forEach(
        ([dimension, value]) => {
          if (
            value === undefined
          ) {
            return
          }

          setDimensionValue(
            dimensions,
            definition,
            dimension,
            value,
          )
        },
      )

      applyDimensions()
    },

    refreshTextures() {
      // У неизменённых текстур repeat/offset уже учитывают текущий размер.
      // Вернём исходные значения перед захватом, чтобы смена другого slot
      // не применяла компенсацию повторно. Новые текстуры ещё не затронуты.
      textureStates.forEach(resetTexture)
      textureStates.length = 0

      prepareMaterialsAndTextures(
        model,
        definition,
        textureStates,
        false,
      )

      applyDimensions()
    },
  }
}

/*
 * ==================================
 * OBJECT HELPERS
 * ==================================
 */

function getRequiredObject(
  model: THREE.Object3D,
  name: string,
  furnitureId: string,
): THREE.Object3D {
  const object =
    model.getObjectByName(
      name,
    )

  if (!object) {
    throw new Error(
      `[${furnitureId}] Required object "${name}" was not found in the GLB.`,
    )
  }

  return object
}

function assertFiniteRuleNumber(
  value: number,
  field: string,
  target: string,
  furnitureId: string,
  ruleType: string,
): void {
  if (Number.isFinite(value)) {
    return
  }

  throw new Error(
    `[${furnitureId}] ${ruleType} requires a finite ${field} for object "${target}".`,
  )
}

function assertPositiveRuleNumber(
  value: number,
  field: string,
  target: string,
  furnitureId: string,
  ruleType: string,
): void {
  assertFiniteRuleNumber(
    value,
    field,
    target,
    furnitureId,
    ruleType,
  )

  if (value > 0) {
    return
  }

  throw new Error(
    `[${furnitureId}] ${ruleType} requires ${field} to be greater than zero for object "${target}".`,
  )
}

/*
 * ==================================
 * DIMENSIONS
 * ==================================
 */

function setDimensionValue(
  dimensions:
    DimensionValues,

  definition:
    FurnitureDefinition,

  dimension:
    DimensionName,

  value:
    number,
): void {
  const config =
    definition.dimensions[
      dimension
    ]

  if (!config) {
    throw new Error(
      `[${definition.id}] Unknown dimension "${dimension}".`,
    )
  }

  dimensions[dimension] =
    THREE.MathUtils.clamp(
      value,
      config.min,
      config.max,
    )
}

/*
 * ==================================
 * MATERIALS / TEXTURES
 * ==================================
 */

function prepareMaterialsAndTextures(
  model: THREE.Object3D, definition: FurnitureDefinition,
  textureStates: TextureState[], cloneResources: boolean,
): void {
  const prepared = new Map<THREE.Material, THREE.Material>()
  const seenTextures = new Set<THREE.Texture>()
  const prepare = (original: THREE.Material): THREE.Material => {
    const cached = prepared.get(original)
    if (cached) return cached
    const textureConfig = definition.textureAxes[original.name]
    const transforms = definition.textureTransforms?.[original.name]
    if ((!textureConfig && !transforms) || !(original instanceof THREE.MeshStandardMaterial)) return original
    const material = cloneResources ? original.clone() : original
    prepared.set(original, material)
    const textureClones = new Map<THREE.Texture, THREE.Texture>()
    // Includes every texture map supported by the material, not only colour.
    for (const key of Object.keys(material) as (keyof THREE.MeshStandardMaterial)[]) {
      const source = original[key]
      if (cloneResources && source instanceof THREE.Texture) {
        let clone = textureClones.get(source)
        if (!clone) { clone = source.clone(); textureClones.set(source, clone) }
        Object.assign(material, { [key]: clone })
      }
    }
    const axes = normalizeMaterialAxes(textureConfig ?? {})
    for (const texture of Object.values(material)) {
      if (!(texture instanceof THREE.Texture) || seenTextures.has(texture)) continue
      seenTextures.add(texture)
      if (transforms) {
        if (transforms.u) texture.wrapS = THREE.RepeatWrapping
        if (transforms.v) texture.wrapT = THREE.RepeatWrapping
        texture.needsUpdate = true
      } else enableTextureWrapping(texture, axes)
      textureStates.push({ texture, transforms, axes,
        baseRepeatX: texture.repeat.x, baseRepeatY: texture.repeat.y,
        baseOffsetX: texture.offset.x, baseOffsetY: texture.offset.y })
    }
    return material
  }
  model.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return
    object.material = Array.isArray(object.material) ? object.material.map(prepare) : prepare(object.material)
  })
}

function normalizeMaterialAxes(
  config:
    Readonly<
      Record<
        DimensionName,
        | MaterialTextureAxisBinding
        | undefined
      >
    >,
):
  Readonly<
    Record<
      DimensionName,
      readonly TextureAxis[]
    >
  > {
  const result:
    Record<
      DimensionName,
      readonly TextureAxis[]
    > = {}

  Object.entries(
    config,
  ).forEach(
    ([
      dimension,
      binding,
    ]) => {
      if (!binding) {
        return
      }

      result[dimension] =
        Array.isArray(binding)
          ? binding
          : [binding]
    },
  )

  return result
}

function enableTextureWrapping(
  texture:
    THREE.Texture,

  axes:
    Readonly<
      Record<
        DimensionName,
        readonly TextureAxis[]
      >
    >,
): void {
  const allAxes =
    new Set<TextureAxis>()

  Object.values(
    axes,
  ).forEach(
    (textureAxes) => {
      textureAxes.forEach(
        (axis) => {
          allAxes.add(axis)
        },
      )
    },
  )

  if (
    allAxes.has('x')
  ) {
    texture.wrapS =
      THREE.RepeatWrapping
  }

  if (
    allAxes.has('y')
  ) {
    texture.wrapT =
      THREE.RepeatWrapping
  }

  texture.needsUpdate =
    true
}

/*
 * ==================================
 * TEXTURE TRANSFORMS
 * ==================================
 */

function resetTexture(
  state:
    TextureState,
): void {
  state.texture.repeat.x =
    state.baseRepeatX

  state.texture.repeat.y =
    state.baseRepeatY

  state.texture.offset.x =
    state.baseOffsetX

  state.texture.offset.y =
    state.baseOffsetY
}

function applyTextureAxis(
  state:
    TextureState,

  axis:
    TextureAxis,

  factor:
    number,
): void {
  if (axis === 'x') {
    state.texture.repeat.x =
      state.baseRepeatX *
      factor

    state.texture.offset.x =
      state.baseOffsetX +
      (
        state.baseRepeatX *
        (1 - factor)
      ) /
        2

    return
  }

  state.texture.repeat.y =
    state.baseRepeatY *
    factor

  state.texture.offset.y =
    state.baseOffsetY +
    (
      state.baseRepeatY *
      (1 - factor)
    ) /
      2
}
