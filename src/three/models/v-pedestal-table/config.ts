import type {
  FurnitureDefinition,
} from '../../furniture/types'

const CENTER_LENGTH =
  1.15

const CENTER_WIDTH =
  0.75

const LONG_EDGE_NAMES = [
  'Top_Edge_Front',
  'Top_Edge_Back',
] as const

const SHORT_EDGE_NAMES = [
  'Top_Edge_Left',
  'Top_Edge_Right',
] as const

const LENGTH_MOVE_TARGETS = [
  {
    target: 'Top_Edge_Left',
    factor: -0.5,
  },
  {
    target: 'Top_Edge_Right',
    factor: 0.5,
  },
  {
    target: 'Top_Corner_FrontLeft',
    factor: -0.5,
  },
  {
    target: 'Top_Corner_BackLeft',
    factor: -0.5,
  },
  {
    target: 'Top_Corner_FrontRight',
    factor: 0.5,
  },
  {
    target: 'Top_Corner_BackRight',
    factor: 0.5,
  },
] as const

const WIDTH_MOVE_TARGETS = [
  {
    target: 'Top_Edge_Front',
    factor: 0.5,
  },
  {
    target: 'Top_Edge_Back',
    factor: -0.5,
  },
  {
    target: 'Top_Corner_FrontLeft',
    factor: 0.5,
  },
  {
    target: 'Top_Corner_FrontRight',
    factor: 0.5,
  },
  {
    target: 'Top_Corner_BackLeft',
    factor: -0.5,
  },
  {
    target: 'Top_Corner_BackRight',
    factor: -0.5,
  },
] as const

export const V_PEDESTAL_TABLE_CONFIG = {
  id: 'table-04-v-pedestal',

  label: 'V-Pedestal Table',

  modelUrl:
    '/models/table-04-v-pedestal.glb',

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
      base: 0.8,
      min: 0.8,
      max: 1.2,
      step: 0.01,
    },
  },

  dimensionOrder: [
    'length',
    'width',
  ],

  resizeRules: [
    {
      type: 'stretch-segment',
      target: 'Top_Center',
      dimension: 'length',
      axis: 'x',
      baseLength: CENTER_LENGTH,
    },

    {
      type: 'stretch-segment',
      target: 'Top_Center',
      dimension: 'width',
      axis: 'z',
      baseLength: CENTER_WIDTH,
    },

    ...LONG_EDGE_NAMES.map(
      (target) => ({
        type:
          'stretch-segment' as const,
        target,
        dimension: 'length',
        axis: 'x' as const,
        baseLength: CENTER_LENGTH,
      }),
    ),

    ...SHORT_EDGE_NAMES.map(
      (target) => ({
        type:
          'stretch-segment' as const,
        target,
        dimension: 'width',
        axis: 'z' as const,
        baseLength: CENTER_WIDTH,
      }),
    ),

    {
      type: 'delta-move',
      dimension: 'length',
      axis: 'x',
      targets:
        LENGTH_MOVE_TARGETS,
    },

    {
      type: 'delta-move',
      dimension: 'width',
      axis: 'z',
      targets:
        WIDTH_MOVE_TARGETS,
    },
  ],

  textureAxes: {
    Stone_Top_Center: {
      length: 'x',
      width: 'y',
    },

    Stone_Bottom_Center: {
      length: 'x',
      width: 'y',
    },

    Stone_Top_LongSegment: {
      length: 'x',
      width: 'y',
    },

    Stone_Bottom_LongSegment: {
      length: 'x',
      width: 'y',
    },

    Stone_Edge_Long: {
      length: 'x',
    },

    Stone_Top_ShortSegment: {
      length: 'x',
      width: 'y',
    },

    Stone_Bottom_ShortSegment: {
      length: 'x',
      width: 'y',
    },

    Stone_Top_Corner: {
      length: 'x',
      width: 'y',
    },

    Stone_Bottom_Corner: {
      length: 'x',
      width: 'y',
    },

    Stone_Edge_Short: {
      width: 'x',
    },
  },

  materialSlots: {
    primaryTop: {
      label: 'Материал столешницы',
      targets: [
        'Stone_Top_Center',
        'Stone_Bottom_Center',
        'Stone_Top_LongSegment',
        'Stone_Bottom_LongSegment',
        'Stone_Top_ShortSegment',
        'Stone_Bottom_ShortSegment',
        'Stone_Top_Corner',
        'Stone_Bottom_Corner',
        'Stone_Edge_Long',
        'Stone_Edge_Short',
        'Stone_Edge_Corner',
      ],
      defaultFinish:
        'marble-duo-gold',
      allowedFinishes: [
        'oak-natural',
        'walnut-natural',
        'pine-coated',
        'ash-natural',
        'concrete-light',
        'marble-cream',
        'marble-white-gold',
        'marble-black-gold',
        'marble-duo-gold',
        'terrazzo-neutral',
      ],
    },

    frameMetal: {
      label: 'Цвет каркаса',
      targets: [
        'Metal_Support',
        'Metal_Base',
      ],
      defaultFinish:
        'metal-black-matte',
      allowedFinishes: [
        'metal-black-matte',
        'metal-white-matte',
        'metal-anthracite',
      ],
    },
  },
} as const satisfies FurnitureDefinition
