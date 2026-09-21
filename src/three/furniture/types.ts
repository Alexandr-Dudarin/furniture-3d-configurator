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
  displayUnit?: 'cm' | 'mm'
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

/*
 * Объект сохраняет собственные размеры,
 * но перемещается на заданную долю
 * изменения физической размерности.
 *
 * Знак factor задаёт направление.
 */
export type DeltaMoveTarget = {
  target: string

  factor: number
}

export type DeltaMoveResizeRule = {
  type: 'delta-move'

  targets:
    readonly DeltaMoveTarget[]

  dimension: DimensionName

  axis: ModelAxis
}

/*
 * Сегмент растягивается только
 * вдоль заданной локальной оси.
 *
 * baseLength — физическая длина
 * сегмента при base dimension.
 */
export type StretchSegmentResizeRule = {
  type: 'stretch-segment'

  target: string

  dimension: DimensionName

  axis: ModelAxis

  baseLength: number

  factor?: number
}

export type FurnitureResizeRule =
  | ScaleResizeRule
  | EdgeAnchorResizeRule
  | DeltaMoveResizeRule
  | StretchSegmentResizeRule

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

export type MaterialSlotName =
  string

export type MaterialFinishId =
  string

/*
 * Semantic material names exported by the GLB
 * are grouped into a user-facing finish slot.
 *
 * A finish can only be selected when it is
 * explicitly allowed by the model definition.
 */
export type FurnitureMaterialSlotConfig = {
  label: string

  targets: readonly string[]

  defaultFinish:
    MaterialFinishId

  allowedFinishes:
    readonly MaterialFinishId[]

  // The same shared maps can represent a smoother surface on a particular part.
  // Applied to the owned material instance, never to the registry or cached maps.
  finishOverrides?: Readonly<Record<MaterialFinishId, { normalScale?: number }>>
}

export type FurnitureMaterialSlots =
  Readonly<
    Record<
      MaterialSlotName,
      FurnitureMaterialSlotConfig
    >
  >

// UV anchor is in exported UV units; geometric lengths are in metres.
export type AffineTextureBinding = {
  dimension: DimensionName
  baseLength: number
  stretchFactor: number
  translationFactor: number
  anchor: number
  uvUnitsPerMeter: number
}

export type AffineTextureBindings = Readonly<{
  u?: AffineTextureBinding
  v?: AffineTextureBinding
}>

export type FurnitureDefinition = {
  category?: 'tables' | 'wardrobes' | 'dressers'
  framing?: { width: number; height: number; depth: number }
  description?: string
  // Presentation only: these assemblies are hidden to inspect the interior.
  interiorView?: { hiddenNodes: readonly string[] }
  // Lightweight catalogue entries defer geometry rules and UV contracts.
  loadRuntime?: () => Promise<FurnitureDefinition>
  textureTransforms?: Readonly<Record<string, AffineTextureBindings>>

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

  materialSlots?:
    FurnitureMaterialSlots
}
