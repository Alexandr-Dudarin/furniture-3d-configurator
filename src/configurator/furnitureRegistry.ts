import type {
  FurnitureDefinition,
} from '../three/furniture/types'

import {
  FIRST_TABLE_CONFIG,
} from '../three/models/first-table/config'

import {
  U_FRAME_TABLE_CONFIG,
} from '../three/models/u-frame-table/config'

import {
  SLAT_PEDESTAL_TABLE_CONFIG,
} from '../three/models/slat-pedestal-table/config'

import {
  V_PEDESTAL_TABLE_CONFIG,
} from '../three/models/v-pedestal-table/config'

/*
 * --------------------------------
 * FURNITURE REGISTRY
 * --------------------------------
 *
 * Единый каталог моделей,
 * доступных конфигуратору.
 *
 * Новая модель регистрируется
 * именно здесь.
 */

const furnitureRegistry =
  new Map<
    string,
    FurnitureDefinition
  >([
    [
      FIRST_TABLE_CONFIG.id,
      FIRST_TABLE_CONFIG,
    ],
    [
      U_FRAME_TABLE_CONFIG.id,
      U_FRAME_TABLE_CONFIG,
    ],
    [
      SLAT_PEDESTAL_TABLE_CONFIG.id,
      SLAT_PEDESTAL_TABLE_CONFIG,
    ],
    [
      V_PEDESTAL_TABLE_CONFIG.id,
      V_PEDESTAL_TABLE_CONFIG,
    ],
  ])

/*
 * Модель по умолчанию.
 */

export const DEFAULT_FURNITURE_ID =
  FIRST_TABLE_CONFIG.id

/*
 * Получить конкретную модель
 * по стабильному ID.
 */

export function getFurnitureDefinition(
  furnitureId: string,
): FurnitureDefinition {
  const definition =
    furnitureRegistry.get(
      furnitureId,
    )

  if (!definition) {
    throw new Error(
      `Furniture "${furnitureId}" is not registered.`,
    )
  }

  return definition
}

/*
 * Получить список всех
 * зарегистрированных моделей.
 *
 * Используется, например,
 * для CustomSelect.
 */

export function getFurnitureDefinitions():
  FurnitureDefinition[] {
  return Array.from(
    furnitureRegistry.values(),
  )
}
