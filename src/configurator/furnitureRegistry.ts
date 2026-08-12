import type {
  FurnitureDefinition,
} from '../three/furniture/types'

import {
  TABLE_CONFIG,
} from '../three/table/tableConfig'

/*
 * --------------------------------
 * FURNITURE REGISTRY
 * --------------------------------
 *
 * Единый каталог всех моделей,
 * доступных конфигуратору.
 *
 * Сейчас модель одна.
 *
 * Позже здесь могут появиться:
 *
 * table-02
 * round-table-01
 * wardrobe-01
 * dresser-01
 */

const furnitureRegistry =
  new Map<
    string,
    FurnitureDefinition
  >([
    [
      TABLE_CONFIG.id,
      TABLE_CONFIG,
    ],
  ])

/*
 * ID модели, которую открываем
 * по умолчанию.
 *
 * Позже вместо этого значения
 * мы сможем получить ID:
 *
 * из URL,
 * localStorage,
 * каталога,
 * карточки товара.
 */

export const DEFAULT_FURNITURE_ID =
  TABLE_CONFIG.id

/*
 * Получить описание модели
 * по её стабильному ID.
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
 * Получить все зарегистрированные
 * модели.
 *
 * Позже эта функция пригодится
 * для выбора товара в интерфейсе.
 */

export function getFurnitureDefinitions():
  FurnitureDefinition[] {
  return Array.from(
    furnitureRegistry.values(),
  )
}