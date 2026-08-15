import type {
  FurnitureDefinition,
} from '../../furniture/types'

const TABLE_TOP_NAME =
  'TableTop'

export const SLAT_PEDESTAL_TABLE_CONFIG = {
  id: 'table-03-slat-pedestal',

  label: 'Slat Pedestal Table',

  modelUrl:
    '/models/table-03-slat-pedestal.glb',

  dimensions: {
    length: {
      label: 'Длина стола',
      base: 1.2,
      min: 1.2,
      max: 1.6,
      step: 0.01,
    },

    width: {
      label: 'Ширина стола',
      base: 0.75,
      min: 0.75,
      max: 1.15,
      step: 0.01,
    },
  },

  dimensionOrder: [
    'length',
    'width',
  ],

  resizeRules: [
    {
      type: 'scale',
      target: TABLE_TOP_NAME,
      dimension: 'length',
      axis: 'x',
    },

    {
      type: 'scale',
      target: TABLE_TOP_NAME,
      dimension: 'width',
      axis: 'z',
    },
  ],

  textureAxes: {
    Wood_Top: {
      length: 'x',
      width: 'y',
    },

    Wood_Bottom: {
      length: 'x',
      width: 'y',
    },

    Wood_Edge_Long: {
      length: 'x',
    },

    Wood_Edge_Short: {
      width: 'x',
    },
  },

  materialSlots: {
    primaryTop: {
      label: 'Материал столешницы',
      targets: [
        'Wood_Top',
        'Wood_Bottom',
        'Wood_Edge_Long',
        'Wood_Edge_Short',
      ],
      defaultFinish:
        'oak-natural',
      allowedFinishes: [
        'oak-natural',
        'walnut-natural',
        'pine-coated',
        'ash-natural',
        'concrete-light',
        'marble-cream',
      ],
    },

    pedestalWood: {
      label: 'Материал деревянных элементов основания',
      targets: [
        'Wood_Slats',
        'Wood_Plinth',
      ],
      defaultFinish:
        'oak-natural',
      allowedFinishes: [
        'oak-natural',
        'walnut-natural',
        'pine-coated',
        'ash-natural',
      ],
    },
  },
} as const satisfies FurnitureDefinition
