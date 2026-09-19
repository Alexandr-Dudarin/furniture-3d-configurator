import type { FurnitureDimensionConfig } from '../../three/furniture/types'
import { getTableBase, getTabletopWidthConfig, TABLE_BASES, TOP_FINISHES, TOP_SHAPES, TOP_THICKNESS, type TopShape } from './catalog'

export type TableAssemblyConfiguration = {
  shape: TopShape
  baseId: string
  length: number
  width: number
  thickness: number
  baseHeight: number
  topFinish: string
  baseFinish: string
}

function size(value: unknown, config: FurnitureDimensionConfig) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return config.base
  const bounded = Math.min(config.max, Math.max(config.min, value))
  // Компенсируем погрешность double на половине шага: 73.5 см округляется до 74.
  return Number(Math.min(config.max, config.min + Math.round((bounded - config.min) / config.step + 1e-8) * config.step).toFixed(8))
}

export function normalizeTableAssembly(input: unknown): TableAssemblyConfiguration {
  const raw = typeof input === 'object' && input !== null && !Array.isArray(input) ? input as Record<string, unknown> : {}
  const shape = TOP_SHAPES.find((entry) => entry.id === raw.shape)?.id ?? 'rounded-rectangle'
  const requestedBase = TABLE_BASES.find((entry) => entry.id === raw.baseId)
  // Реечное основание остаётся исходным и резервным для некруглых столешниц.
  const fallback = getTableBase(shape === 'circle' ? 'round-fluted' : 'slat-pedestal')
  const base = requestedBase?.compatibleShapes.includes(shape) ? requestedBase : fallback
  const length = size(raw.length, shape === 'circle' ? base.diameter! : base.length)
  const width = shape === 'circle' ? length : size(raw.width, getTabletopWidthConfig(base, shape, length))
  return {
    shape, baseId: base.id, length, width,
    thickness: size(raw.thickness, TOP_THICKNESS), baseHeight: size(raw.baseHeight, base.height),
    topFinish: typeof raw.topFinish === 'string' && TOP_FINISHES.includes(raw.topFinish) ? raw.topFinish : 'oak-natural',
    baseFinish: typeof raw.baseFinish === 'string' && base.allowedFinishes.includes(raw.baseFinish) ? raw.baseFinish : base.defaultFinish,
  }
}

export function createDefaultAssembly() { return normalizeTableAssembly(null) }

export function updateTableAssembly(current: TableAssemblyConfiguration, patch: Partial<TableAssemblyConfiguration>) {
  const next = normalizeTableAssembly({ ...current, ...patch })
  const notices: string[] = []
  if (next.baseId !== (patch.baseId ?? current.baseId)) notices.push(`Для этой формы выбрано основание «${getTableBase(next.baseId).label}».`)
  if (next.baseHeight !== (patch.baseHeight ?? current.baseHeight)) notices.push('Высота приведена к допустимому значению выбранного основания.')
  if (next.baseFinish !== (patch.baseFinish ?? current.baseFinish)) notices.push('Покрытие основания заменено на совместимое.')
  if (next.length !== (patch.length ?? current.length) || (next.shape !== 'circle' && next.width !== (patch.width ?? current.width))) {
    notices.push(next.shape === 'ellipse' || next.shape === 'capsule'
      ? 'Размеры скорректированы: у овальной столешницы длина больше ширины минимум на 20 см.'
      : 'Размеры приведены к диапазону выбранного основания.')
  }
  return { configuration: next, notice: notices.length ? notices.join(' ') : null }
}
