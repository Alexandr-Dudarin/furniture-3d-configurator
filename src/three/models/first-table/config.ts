import type {
  FurnitureDefinition,
} from '../../furniture/types'

const TABLE_TOP_NAME =
  'TableTop'

const TABLE_LEG_NAMES = [
  'Leg_01',
  'Leg_02',
  'Leg_03',
  'Leg_04',
] as const

/*
 * Полное декларативное описание
 * первой модели мебели.
 *
 * Этот файл знает устройство
 * только first-table.glb.
 *
 * Универсальный FurnitureController
 * никаких специальных знаний
 * об этом столе не содержит.
 */

export const FIRST_TABLE_CONFIG = {
  /*
   * Стабильный ID модели.
   *
   * Его можно будет использовать:
   *
   * model=table-01
   * localStorage
   * сохранённые конфигурации
   * заказы
   */

  id: 'table-01',

  label: 'First Table',

  modelUrl:
    '/models/first-table.glb',

  /*
   * --------------------------------
   * DIMENSIONS
   * --------------------------------
   */

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

  /*
   * Порядок отображения
   * размерных контролов в UI.
   */

  dimensionOrder: [
    'length',
    'width',
  ],

  /*
   * --------------------------------
   * RESIZE RULES
   * --------------------------------
   */

  resizeRules: [
    /*
     * Столешница:
     *
     * длина -> X
     */

    {
      type: 'scale',
      target:
        TABLE_TOP_NAME,
      dimension:
        'length',
      axis: 'x',
    },

    /*
     * Столешница:
     *
     * ширина -> Z
     */

    {
      type: 'scale',
      target:
        TABLE_TOP_NAME,
      dimension:
        'width',
      axis: 'z',
    },

    /*
     * Ножки сохраняют свои размеры,
     * но перемещаются вслед
     * за краями по длине.
     */

    {
      type: 'edge-anchor',
      targets:
        TABLE_LEG_NAMES,
      dimension:
        'length',
      axis: 'x',
    },

    /*
     * То же самое по ширине.
     */

    {
      type: 'edge-anchor',
      targets:
        TABLE_LEG_NAMES,
      dimension:
        'width',
      axis: 'z',
    },
  ],

  /*
   * --------------------------------
   * TEXTURE TILING
   * --------------------------------
   *
   * Связываем физический размер
   * поверхности с UV-осью.
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
        'Metal_Graphite',
      ],
      defaultFinish:
        'metal-anthracite',
      allowedFinishes: [
        'metal-black-matte',
        'metal-white-matte',
        'metal-anthracite',
      ],
    },
  },
} as const satisfies FurnitureDefinition
