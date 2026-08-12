import type {
  FurnitureDefinition,
} from '../three/furniture/types'

export type ConfiguratorDimensions =
  Record<string, number>

/*
 * Создаёт начальные размеры
 * на основании конфигурации модели.
 *
 * Никаких:
 *
 * length = 1.2
 * width = 0.6
 *
 * здесь нет.
 *
 * Если будущая модель содержит:
 *
 * diameter
 *
 * функция автоматически создаст:
 *
 * {
 *   diameter: baseValue
 * }
 */
export function createInitialDimensions(
  definition: FurnitureDefinition,
): ConfiguratorDimensions {
  const dimensions:
    ConfiguratorDimensions = {}

  definition.dimensionOrder.forEach(
    (dimension) => {
      const config =
        definition.dimensions[
          dimension
        ]

      if (!config) {
        throw new Error(
          `[${definition.id}] Dimension "${dimension}" is listed in dimensionOrder but is missing from dimensions.`,
        )
      }

      dimensions[dimension] =
        config.base
    },
  )

  return dimensions
}

/*
 * Возвращает новое состояние
 * с изменённым одним размером.
 *
 * Исходный объект не мутируется,
 * что важно для React.
 */
export function updateDimension(
  dimensions:
    ConfiguratorDimensions,

  dimension:
    string,

  value:
    number,
): ConfiguratorDimensions {
  return {
    ...dimensions,

    [dimension]:
      value,
  }
}