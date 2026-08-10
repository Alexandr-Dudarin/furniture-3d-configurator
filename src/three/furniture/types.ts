export type ModelAxis =
  | 'x'
  | 'y'
  | 'z'

export type TextureAxis =
  | 'x'
  | 'y'

export type DimensionName =
  string

export type FurnitureDimensionConfig = {
  label: string
  base: number
  min: number
  max: number
  step: number
}

/*
 * Геометрия масштабируется
 * по конкретной оси.
 *
 * Для круглого стола можно будет
 * создать две scale-rule:
 *
 * diameter -> X
 * diameter -> Z
 */
export type ScaleResizeRule = {
  type: 'scale'

  target: string

  dimension: DimensionName

  axis: ModelAxis
}

/*
 * Объект не растягивается,
 * а перемещается вместе с краем.
 *
 * center по умолчанию = 0.
 *
 * Это позволяет использовать
 * центральное якорение, но не
 * прибивает архитектуру навсегда
 * именно к мировому нулю.
 */
export type EdgeAnchorResizeRule = {
  type: 'edge-anchor'

  targets: readonly string[]

  dimension: DimensionName

  axis: ModelAxis

  center?: number
}

export type FurnitureResizeRule =
  | ScaleResizeRule
  | EdgeAnchorResizeRule

/*
 * Одна физическая размерность
 * может влиять на одну
 * или несколько UV-осей.
 *
 * Например:
 *
 * length: 'x'
 *
 * или для диаметра:
 *
 * diameter: ['x', 'y']
 */
export type MaterialTextureAxisBinding =
  | TextureAxis
  | readonly TextureAxis[]

export type MaterialTextureAxes =
  Readonly<
    Record<
      DimensionName,
      | MaterialTextureAxisBinding
      | undefined
    >
  >

export type FurnitureMaterialTextureConfig =
  Readonly<
    Record<
      string,
      MaterialTextureAxes
    >
  >

export type FurnitureDefinition = {
  id: string

  label: string

  modelUrl: string

  dimensions:
    Readonly<
      Record<
        DimensionName,
        FurnitureDimensionConfig
      >
    >

  dimensionOrder:
    readonly DimensionName[]

  resizeRules:
    readonly FurnitureResizeRule[]

  textureAxes:
    FurnitureMaterialTextureConfig
}