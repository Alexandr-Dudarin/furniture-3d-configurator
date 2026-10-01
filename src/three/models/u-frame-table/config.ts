import type {
  FurnitureDefinition,
} from '../../furniture/types'

const TABLE_TOP_NAME =
  'TableTop'

const FRAME_NAMES = {
  left: 'Frame_Left',
  right: 'Frame_Right',
} as const

const FRAME_POST_NAMES = [
  'Frame_Left_Post_Front',
  'Frame_Left_Post_Back',
  'Frame_Right_Post_Front',
  'Frame_Right_Post_Back',
] as const

const BOTTOM_RAIL_NAMES = [
  'Frame_Left_BottomRail',
  'Frame_Right_BottomRail',
] as const

const BASE_RAIL_LENGTH =
  0.51

/*
 * Constructor-ready стол с двумя
 * торцевыми U-образными рамами.
 *
 * Столешница меняет длину и ширину.
 * Рамы расходятся по длине целиком,
 * вертикальные стойки перемещаются
 * по ширине без изменения сечения,
 * нижние поперечины растягиваются
 * только вдоль своей local Z axis.
 */
export const U_FRAME_TABLE_CONFIG = {
  id: 'table-02-u-frame',

  label: 'U-Frame Table',

  modelUrl:
    '/models/table-02-u-frame.glb',

  dimensions: {
    length: {
      label: 'Длина стола',
      base: 0.95,
      min: 0.95,
      max: 1.65,
      step: 0.01,
    },

    width: {
      label: 'Ширина стола',
      base: 0.55,
      min: 0.55,
      max: 0.8,
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

    {
      type: 'delta-move',
      dimension: 'length',
      axis: 'x',
      targets: [
        {
          target:
            FRAME_NAMES.left,
          factor: -0.5,
        },
        {
          target:
            FRAME_NAMES.right,
          factor: 0.5,
        },
      ],
    },

    {
      type: 'edge-anchor',
      targets: FRAME_POST_NAMES,
      dimension: 'width',
      axis: 'z',
    },

    ...BOTTOM_RAIL_NAMES.map(
      (target) => ({
        type:
          'stretch-segment' as const,
        target,
        dimension:
          'width',
        axis: 'z' as const,
        baseLength:
          BASE_RAIL_LENGTH,
      }),
    ),
  ],

  textureAxes: {
    Top_Primary: {
      length: 'x',
      width: 'y',
    },
    Top_Bottom: {
      length: 'x',
      width: 'y',
    },
    Top_Edge_Long: {
      length: 'x',
    },
    Top_Edge_Short: {
      width: 'x',
    },
  },

  materialSlots: {
    primaryTop: {
      label: 'Материал столешницы',
      targets: [
        'Top_Primary',
        'Top_Bottom',
        'Top_Edge_Long',
        'Top_Edge_Short',
      ],
      defaultFinish:
        'ash-natural',
      allowedFinishes: [
        'oak-natural',
        'walnut-natural',
        'pine-coated',
        'ash-natural',
        'oak-grey',
        'oak-silver',
        'oak-black',
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
        'Metal_Frame',
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
