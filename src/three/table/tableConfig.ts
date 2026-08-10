import type {
  FurnitureDefinition,
  TextureAxis,
} from '../furniture/types'

export const TABLE_TOP_NAME =
  'TableTop'

export const TABLE_LEG_NAMES = [
  'Leg_01',
  'Leg_02',
  'Leg_03',
  'Leg_04',
] as const

/*
 * Главное описание первого стола.
 *
 * Именно этот объект постепенно
 * становится единственным источником
 * знаний о конкретной модели.
 */
export const TABLE_CONFIG = {
  id: 'table-01',

  label: 'First Table',

  modelUrl:
    '/models/first-table.glb',

  dimensions: {
    length: {
      label: 'Длина стола',

      base: 1.2,
      min: 1.2,
      max: 2.0,
      step: 0.01,
    },

    width: {
      label: 'Ширина стола',

      base: 0.6,
      min: 0.6,
      max: 1.0,
      step: 0.01,
    },
  },

  dimensionOrder: [
    'length',
    'width',
  ],

  /*
   * Правила изменения геометрии.
   */

  resizeRules: [
    /*
     * Столешница увеличивается
     * по длине.
     */
    {
      type: 'scale',
      target: TABLE_TOP_NAME,
      dimension: 'length',
      axis: 'x',
    },

    /*
     * Столешница увеличивается
     * по ширине.
     */
    {
      type: 'scale',
      target: TABLE_TOP_NAME,
      dimension: 'width',
      axis: 'z',
    },

    /*
     * Ножки перемещаются
     * вместе с краями по длине.
     */
    {
      type: 'edge-anchor',
      targets: TABLE_LEG_NAMES,
      dimension: 'length',
      axis: 'x',
    },

    /*
     * Ножки перемещаются
     * вместе с краями по ширине.
     */
    {
      type: 'edge-anchor',
      targets: TABLE_LEG_NAMES,
      dimension: 'width',
      axis: 'z',
    },
  ],

  /*
   * Физический размер
   * -> UV-ось материала.
   */

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
} as const satisfies FurnitureDefinition

/*
 * ------------------------------------------------
 * ВРЕМЕННАЯ ОБРАТНАЯ СОВМЕСТИМОСТЬ
 * ------------------------------------------------
 *
 * App.tsx пока использует старые exports.
 *
 * Мы сохраняем их на этом промежуточном шаге,
 * чтобы не ломать работающий конструктор.
 *
 * На следующем этапе они постепенно исчезнут,
 * и App.tsx будет работать с TABLE_CONFIG.
 */

export const TABLE_MODEL_URL =
  TABLE_CONFIG.modelUrl

export const TABLE_DIMENSIONS =
  TABLE_CONFIG.dimensions

export const MATERIAL_TEXTURE_AXES:
  Record<
    string,
    {
      lengthAxis?: TextureAxis
      widthAxis?: TextureAxis
    }
  > = {
    Wood_Top: {
      lengthAxis: 'x',
      widthAxis: 'y',
    },

    Wood_Bottom: {
      lengthAxis: 'x',
      widthAxis: 'y',
    },

    Wood_Edge_Long: {
      lengthAxis: 'x',
    },

    Wood_Edge_Short: {
      widthAxis: 'x',
    },
  }