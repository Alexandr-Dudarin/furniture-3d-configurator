import type {
  FurnitureDefinition,
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
 * Полное описание первой
 * конфигурируемой модели.
 *
 * Этот файл знает устройство
 * именно этого стола.
 *
 * Универсальный furniture engine
 * устройство конкретной модели
 * знать не должен.
 */

export const TABLE_CONFIG = {
  /*
   * Стабильный ID.
   *
   * Позже он сможет использоваться
   * в localStorage, URL и сохранённых
   * конфигурациях:
   *
   * ?model=table-01
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
   * Порядок параметров
   * в будущем универсальном UI.
   */

  dimensionOrder: [
    'length',
    'width',
  ],

  /*
   * --------------------------------
   * GEOMETRY RESIZE RULES
   * --------------------------------
   */

  resizeRules: [
    /*
     * ДЛИНА
     *
     * Столешница физически
     * масштабируется по X.
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
     * ШИРИНА
     *
     * Столешница физически
     * масштабируется по Z.
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
     * ДЛИНА
     *
     * Ножки не растягиваются.
     *
     * Они перемещаются вслед
     * за левым/правым краем
     * столешницы по X.
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
     * ШИРИНА
     *
     * Аналогично перемещаем
     * ножки по Z.
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
   * Здесь описываем связь:
   *
   * физический размер
   *       ↓
   * UV-ось текстуры
   *
   * Благодаря этому изменение
   * размеров поверхности увеличивает
   * количество повторений древесины,
   * а не растягивает рисунок.
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