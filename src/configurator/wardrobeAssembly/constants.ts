import type { FurnitureDimensionConfig } from '../../three/furniture/types'

// Prototype ranges. These are configurator limits, not production approval.
export const SECTION_DIMENSIONS: Record<'width' | 'height' | 'depth', FurnitureDimensionConfig> = {
  width: { label: 'Ширина секции', base: 0.6, min: 0.4, max: 1, step: 0.05 },
  height: { label: 'Высота секции', base: 2.2, min: 0.8, max: 2.8, step: 0.1 },
  depth: { label: 'Глубина корпуса', base: 0.55, min: 0.4, max: 0.8, step: 0.05 },
}

export const RECESSED_DRAWER_INSET = 0.029

export const DRAWER_PLACEMENTS = [
  { value: 'recessed', label: 'Утопленные' },
  { value: 'flush', label: 'Вровень с корпусом' },
] as const

export const MAX_SECTIONS = 7

export const BODY_FINISHES = [
  'board-white-matte',
  'board-cashmere-body',
  'board-grey-neutral',
  'board-graphite-matte',
  'oak-natural',
  'oak-grey',
  'oak-silver',
  'oak-black',
  'board-muted-green',
  'board-powder-beige',
]

export const HARDWARE_FINISHES = [
  'metal-black-matte',
  'metal-white-matte',
  'metal-anthracite',
  'metal-brass-satin',
]

export const SECTION_PRESETS = [
  { id: 'shelves', label: 'С полками' },
  { id: 'hanging', label: 'Со штангой' },
  { id: 'empty', label: 'Пустая секция' },
] as const
