import type { FurnitureDefinition } from '../../furniture/types'

// Диаметр одинаково изменяет X и Z; основание не является потомком TableTop.
export const ROUND_FLUTED_PEDESTAL_TABLE_CONFIG = {
  id: 'table-05-round-fluted-pedestal',
  label: 'Круглый стол с рифлёной опорой',
  modelUrl: '/models/table-05-round-fluted-pedestal.glb',
  dimensions: {
    diameter: { label: 'Диаметр столешницы', base: 1.1, min: 1.1, max: 1.4, step: 0.01 },
  },
  dimensionOrder: ['diameter'],
  resizeRules: [
    { type: 'scale', target: 'TableTop', dimension: 'diameter', axis: 'x' },
    { type: 'scale', target: 'TableTop', dimension: 'diameter', axis: 'z' },
  ],
  textureAxes: {
    Stone_Top: { diameter: ['x', 'y'] },
    Stone_Bottom: { diameter: ['x', 'y'] },
    // U идёт вдоль окружности; V соответствует фиксированной толщине.
    Stone_Edge_Round: { diameter: 'x' },
  },
  materialSlots: {
    primaryTop: {
      label: 'Материал столешницы',
      targets: ['Stone_Top', 'Stone_Bottom', 'Stone_Edge_Round'],
      defaultFinish: 'marble-black-gold',
      allowedFinishes: ["oak-natural", "walnut-natural", "pine-coated", "ash-natural", "oak-grey", "oak-silver", "oak-black", "concrete-light", "marble-cream", "marble-white-gold", "marble-black-gold", "marble-duo-gold", "terrazzo-neutral"],
    },
    frameMetal: {
      label: 'Цвет основания',
      targets: ['Metal_Frame'],
      defaultFinish: 'metal-black-matte',
      allowedFinishes: ['metal-black-matte', 'metal-white-matte', 'metal-anthracite'],
    },
  },
} as const satisfies FurnitureDefinition
