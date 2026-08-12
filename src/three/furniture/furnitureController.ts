import * as THREE from 'three'

import type {
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

          state.texture.needsUpdate =
            true
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
  model:
    THREE.Object3D,

  definition:
    FurnitureDefinition,

  textureStates:
    TextureState[],

  cloneResources:
    boolean,
): void {
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

      /*
       * GLB может содержать Mesh
       * как с одним материалом,
       * так и с массивом материалов.
       */

      if (
        Array.isArray(
          object.material,
        )
      ) {
        object.material =
          object.material.map(
            (material) =>
              prepareMaterial(
                material,
                definition,
                textureStates,
                cloneResources,
              ),
          )

        return
      }

      object.material =
        prepareMaterial(
          object.material,
          definition,
          textureStates,
          cloneResources,
        )
    },
  )
}

function prepareMaterial(
  originalMaterial:
    THREE.Material,

  definition:
    FurnitureDefinition,

  textureStates:
    TextureState[],

  cloneResources:
    boolean,
): THREE.Material {
  const textureConfig =
    definition.textureAxes[
      originalMaterial.name
    ]

  /*
   * Этот материал не участвует
   * в динамическом texture tiling.
   *
   * Например металл ножек.
   */
  if (!textureConfig) {
    return originalMaterial
  }

  if (
    !(
      originalMaterial instanceof
      THREE.MeshStandardMaterial
    )
  ) {
    return originalMaterial
  }

  /*
   * Материал клонируем,
   * потому что runtime-transform
   * текстур должен принадлежать
   * именно этой модели.
   */

  const material =
    cloneResources
      ? originalMaterial.clone()
      : originalMaterial

  if (cloneResources) {
    material.map =
      cloneTexture(
        originalMaterial.map,
      )

    material.normalMap =
      cloneTexture(
        originalMaterial.normalMap,
      )

    material.roughnessMap =
      cloneTexture(
        originalMaterial
          .roughnessMap,
      )

    material.metalnessMap =
      cloneTexture(
        originalMaterial
          .metalnessMap,
      )

    material.aoMap =
      cloneTexture(
        originalMaterial.aoMap,
      )

    material.bumpMap =
      cloneTexture(
        originalMaterial.bumpMap,
      )
  }

  const textures = [
    material.map,
    material.normalMap,
    material.roughnessMap,
    material.metalnessMap,
    material.aoMap,
    material.bumpMap,
  ]

  const uniqueTextures =
    new Set(
      textures.filter(
        (
          texture,
        ): texture is THREE.Texture =>
          texture !== null,
      ),
    )

  const axes =
    normalizeMaterialAxes(
      textureConfig,
    )

  uniqueTextures.forEach(
    (texture) => {
      enableTextureWrapping(
        texture,
        axes,
      )

      textureStates.push({
        texture,

        baseRepeatX:
          texture.repeat.x,

        baseRepeatY:
          texture.repeat.y,

        baseOffsetX:
          texture.offset.x,

        baseOffsetY:
          texture.offset.y,

        axes,
      })
    },
  )

  return material
}

function cloneTexture(
  texture:
    | THREE.Texture
    | null,
):
  | THREE.Texture
  | null {
  if (!texture) {
    return null
  }

  const clone =
    texture.clone()

  clone.needsUpdate =
    true

  return clone
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
