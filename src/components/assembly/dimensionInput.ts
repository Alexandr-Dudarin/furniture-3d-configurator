import type { FurnitureDimensionConfig } from '../../three/furniture/types'

// Ввод заканчивается по Enter/blur; незаконченная строка не меняет модель.
export function commitDimensionInput(text: string, current: number, config: FurnitureDimensionConfig, multiplier: number) {
  const value = text.trim().replace(',', '.')
  if (!value) return { value: current, notice: '' }
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value) || !Number.isFinite(Number(value))) {
    return { value: current, notice: 'Введите число. Прежнее значение сохранено.' }
  }
  const requested = Number(value) / multiplier
  const bounded = Math.max(config.min, Math.min(config.max, requested))
  const result = Number(Math.min(config.max, config.min + Math.round((bounded - config.min) / config.step + 1e-8) * config.step).toFixed(8))
  return { value: result, notice: Math.abs(result - requested) > 1e-8 ? 'Значение приведено к допустимому диапазону и шагу.' : '' }
}
