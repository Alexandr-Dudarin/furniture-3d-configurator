import type { FurnitureDefinition, FurnitureDimensionConfig, FurnitureResizeRule } from '../../three/furniture/types'

export const TOP_SHAPES = [
  { id: 'rectangle', label: 'Прямоугольник' },
  { id: 'rounded-rectangle', label: 'Скруглённые углы' },
  { id: 'chamfered', label: 'Небольшие срезы углов' },
  { id: 'wide-chamfered', label: 'Широкие срезы углов' },
  { id: 'circle', label: 'Круг' },
  { id: 'ellipse', label: 'Эллипс' },
  { id: 'capsule', label: 'Овал с прямыми сторонами' },
] as const
export type TopShape = typeof TOP_SHAPES[number]['id']

export const TOP_FINISHES = ['oak-natural', 'walnut-natural', 'pine-coated', 'ash-natural', 'oak-grey', 'oak-silver', 'oak-black', 'concrete-light', 'marble-cream', 'marble-white-gold', 'marble-black-gold', 'marble-duo-gold', 'terrazzo-neutral']
const WOOD_FINISHES = TOP_FINISHES.slice(0, 7)
const METAL_FINISHES = ['metal-black-matte', 'metal-white-matte', 'metal-anthracite']

export const ADJUSTABLE_BASE_HEIGHT = { min: 0.64, max: 0.84, step: 0.01 } as const

export type TableBaseDefinition = {
  id: string
  label: string
  modelUrl: string
  compatibleShapes: readonly TopShape[]
  attachment: string
  // Фактическая высота attachment в исходном GLB; не округлять вместе с UI.
  sourceHeight: number
  length: FurnitureDimensionConfig
  width: FurnitureDimensionConfig
  diameter?: FurnitureDimensionConfig
  height: FurnitureDimensionConfig
  heightMode: 'fixed' | 'stretch-column' | 'stretch-legs'
  cornerLegs?: {
    targets: readonly string[]
    insetByShape: Partial<Record<TopShape, number>>
    endBand: number
  }
  resizeRules: readonly FurnitureResizeRule[]
  materialTargets: readonly string[]
  allowedFinishes: readonly string[]
  defaultFinish: string
}

export const TABLE_BASES: readonly TableBaseDefinition[] = [
  {
    id: 'four-legs', label: 'Четыре прямые ножки', modelUrl: '/modules/bases/four-legs.glb',
    compatibleShapes: ['rectangle', 'rounded-rectangle', 'chamfered', 'wide-chamfered'],
    attachment: 'Attachment_Tabletop', sourceHeight: 0.71,
    length: { label: 'Длина', base: 1.2, min: 1.2, max: 2, step: 0.01 },
    width: { label: 'Ширина', base: 0.6, min: 0.6, max: 1, step: 0.01 },
    height: { label: 'Высота основания', base: 0.71, ...ADJUSTABLE_BASE_HEIGHT },
    heightMode: 'stretch-legs',
    cornerLegs: {
      targets: ['Leg_01', 'Leg_02', 'Leg_03', 'Leg_04'],
      insetByShape: { rectangle: 0.07, 'rounded-rectangle': 0.07, chamfered: 0.1, 'wide-chamfered': 0.16 },
      endBand: 0.01,
    },
    resizeRules: [
      { type: 'delta-move', targets: [{ target: 'Attachment_Tabletop', factor: 1 }], dimension: 'baseHeight', axis: 'y' },
    ],
    materialTargets: ['Metal_Graphite'], allowedFinishes: METAL_FINISHES, defaultFinish: 'metal-anthracite',
  },
  {
    id: 'slat-pedestal', label: 'Реечное основание', modelUrl: '/modules/bases/slat-pedestal.glb',
    compatibleShapes: ['rectangle', 'rounded-rectangle', 'chamfered', 'wide-chamfered', 'ellipse', 'capsule'],
    attachment: 'Attachment_Tabletop', sourceHeight: 0.728,
    length: { label: 'Длина', base: 1.2, min: 1.2, max: 1.6, step: 0.01 },
    width: { label: 'Ширина', base: 0.8, min: 0.75, max: 1.15, step: 0.01 },
    height: { label: 'Высота основания', base: 0.728, min: 0.728, max: 0.728, step: 0.001 },
    heightMode: 'fixed', resizeRules: [],
    materialTargets: ['Wood_Slats', 'Wood_Plinth'], allowedFinishes: WOOD_FINISHES, defaultFinish: 'oak-natural',
  },
  {
    id: 'round-fluted', label: 'Круглая рифлёная опора', modelUrl: '/modules/bases/round-fluted.glb',
    compatibleShapes: TOP_SHAPES.map((shape) => shape.id), attachment: 'Attachment_Tabletop', sourceHeight: 0.738,
    length: { label: 'Длина', base: 1.2, min: 1.1, max: 1.4, step: 0.01 },
    width: { label: 'Ширина', base: 0.9, min: 0.8, max: 1.1, step: 0.01 },
    diameter: { label: 'Диаметр', base: 1.1, min: 1.1, max: 1.4, step: 0.01 },
    height: { label: 'Высота основания', base: 0.74, ...ADJUSTABLE_BASE_HEIGHT },
    heightMode: 'stretch-column',
    resizeRules: [
      { type: 'stretch-segment', target: 'Fluted_Column', dimension: 'baseHeight', axis: 'y', baseLength: 0.71 },
      // Колонна начинается на Y=0.022: компенсируем scale, оставляя её нижнюю кромку на месте.
      { type: 'delta-move', targets: [{ target: 'Fluted_Column', factor: -0.022 / 0.71 }], dimension: 'baseHeight', axis: 'y' },
      { type: 'delta-move', targets: [{ target: 'Top_Mount', factor: 1 }, { target: 'Attachment_Tabletop', factor: 1 }], dimension: 'baseHeight', axis: 'y' },
    ],
    materialTargets: ['Metal_Frame'], allowedFinishes: METAL_FINISHES, defaultFinish: 'metal-black-matte',
  },
]

export const TOP_THICKNESS: FurnitureDimensionConfig = { label: 'Толщина столешницы', base: 0.022, min: 0.02, max: 0.05, step: 0.001 }

// Различие размеров сохраняет вытянутую форму, в том числе после открытия старой ссылки.
export const OVAL_MIN_LENGTH_DIFFERENCE = 0.2

export function getTabletopWidthConfig(base: TableBaseDefinition, shape: TopShape, length: number): FurnitureDimensionConfig {
  const difference = shape === 'ellipse' || shape === 'capsule' ? OVAL_MIN_LENGTH_DIFFERENCE : 0
  const limit = Math.min(base.width.max, length - difference)
  const steps = Math.floor((limit - base.width.min + 1e-8) / base.width.step)
  const max = Number((base.width.min + steps * base.width.step).toFixed(8))
  return { ...base.width, max, base: Math.min(base.width.base, max) }
}

export function getTableBase(id: string) {
  const base = TABLE_BASES.find((entry) => entry.id === id)
  if (!base) throw new Error(`Unknown table base: ${id}`)
  return base
}

export function getBaseRuntimeDefinition(base: TableBaseDefinition): FurnitureDefinition {
  return {
    id: base.id, label: base.label, modelUrl: base.modelUrl,
    dimensions: { baseHeight: { ...base.height, base: base.sourceHeight } }, dimensionOrder: ['baseHeight'],
    resizeRules: base.resizeRules, textureAxes: {},
  }
}

export function getAssemblyMaterialDefinition(base: TableBaseDefinition): FurnitureDefinition {
  return {
    ...getBaseRuntimeDefinition(base), resizeRules: [],
    materialSlots: {
      primaryTop: { label: 'Материал столешницы', targets: ['Top_Surface', 'Top_Bottom', 'Top_Edge'], defaultFinish: 'oak-natural', allowedFinishes: TOP_FINISHES },
      baseFinish: { label: 'Материал основания', targets: base.materialTargets, defaultFinish: base.defaultFinish, allowedFinishes: base.allowedFinishes },
    },
  }
}
