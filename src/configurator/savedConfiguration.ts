import type { FacadeStyleId } from '../three/facades/types'
import type { FurnitureDefinition } from '../three/furniture/types'
import type { MaterialSelections } from '../three/materials/types'
import { createInitialDimensions, type ConfiguratorDimensions } from './configuratorState'
import { DEFAULT_FURNITURE_ID, getFurnitureDefinitions } from './furnitureRegistry'
import { DEFAULT_EDGE_PROFILE } from './tableAssembly/catalog'

import { createDefaultAssembly, normalizeTableAssembly, updateTableAssembly, type TableAssemblyConfiguration } from './tableAssembly/state'

export const CONFIGURATION_VERSION = 3
export const CONFIGURATION_STORAGE_KEY = 'furniture-3d-configurator:configuration:v3'
export const PREVIOUS_CONFIGURATION_STORAGE_KEY = 'furniture-3d-configurator:configuration:v2'
export const LEGACY_CONFIGURATION_STORAGE_KEY = 'furniture-3d-configurator:configuration:v1'
export const CONFIGURATION_QUERY_KEY = 'config'

export type ModelConfiguration = {
  dimensions: ConfiguratorDimensions
  materials: MaterialSelections
  facadeStyle?: FacadeStyleId
}

export type ConfiguratorSession = {
  version: typeof CONFIGURATION_VERSION
  selectedModelId: string
  models: Record<string, ModelConfiguration>
  mode: 'catalog' | 'builder'
  assembly: TableAssemblyConfiguration
}

type SharedConfiguration = ModelConfiguration & {
  version: 1 | 2 | 3
  modelId: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function findFurnitureDefinition(id: string) {
  return getFurnitureDefinitions().find((definition) => definition.id === id)
}

export function createModelConfiguration(definition: FurnitureDefinition): ModelConfiguration {
  return {
    dimensions: createInitialDimensions(definition),
    ...(definition.facades ? { facadeStyle: definition.facades.defaultStyle } : {}),
    materials: Object.fromEntries(
      Object.entries(definition.materialSlots ?? {}).map(([name, slot]) => [name, slot.defaultFinish]),
    ),
  }
}

export function createDefaultSession(): ConfiguratorSession {
  return {
    version: CONFIGURATION_VERSION,
    selectedModelId: DEFAULT_FURNITURE_ID,
    mode: 'catalog',
    assembly: createDefaultAssembly(),
    models: Object.fromEntries(
      getFurnitureDefinitions().map((definition) => [definition.id, createModelConfiguration(definition)]),
    ),
  }
}

// Values from storage and links are untrusted. Only the model contract defines
// available dimensions, their limits and the finishes allowed in each slot.
export function normalizeModelConfiguration(definition: FurnitureDefinition, input: unknown) {
  const configuration = createModelConfiguration(definition)
  const source = isRecord(input) ? input : {}
  const dimensions = isRecord(source.dimensions) ? source.dimensions : {}
  const materials = isRecord(source.materials) ? source.materials : {}

  for (const name of definition.dimensionOrder) {
    const value = Object.hasOwn(dimensions, name) ? dimensions[name] : undefined
    if (typeof value !== 'number' || !Number.isFinite(value)) continue
    const { min, max, step } = definition.dimensions[name]
    const bounded = Math.min(max, Math.max(min, value))
    const snapped = min + Math.round((bounded - min) / step) * step
    configuration.dimensions[name] = Number(Math.min(max, Math.max(min, snapped)).toFixed(8))
  }

  for (const [name, slot] of Object.entries(definition.materialSlots ?? {})) {
    const value = Object.hasOwn(materials, name) ? materials[name] : undefined
    if (typeof value === 'string' && slot.allowedFinishes.includes(value)) {
      configuration.materials[name] = value
    }
  }
  if (definition.facades && typeof source.facadeStyle === 'string' && definition.facades.styles.includes(source.facadeStyle as FacadeStyleId)) {
    configuration.facadeStyle = source.facadeStyle as FacadeStyleId
  } else if (definition.facades && typeof source.facadeStyle === 'string') {
    const aliases = definition.facades.styleFallbacks
    const fallback = aliases && Object.hasOwn(aliases, source.facadeStyle)
      ? aliases[source.facadeStyle as FacadeStyleId] : undefined
    if (fallback && definition.facades.styles.includes(fallback)) configuration.facadeStyle = fallback
  }
  return configuration
}

export function readSavedSession(raw: string | null): { session: ConfiguratorSession; notice: string | null } {
  const session = createDefaultSession()
  if (raw === null) return { session, notice: null }
  try {
    const input: unknown = JSON.parse(raw)
    if (!isRecord(input) || typeof input.version !== 'number' || ![1, 2, CONFIGURATION_VERSION].includes(Number(input.version)) || !isRecord(input.models)) {
      throw new Error('Unsupported saved configuration')
    }
    for (const definition of getFurnitureDefinitions()) {
      session.models[definition.id] = normalizeModelConfiguration(definition, input.models[definition.id])
    }
    if (typeof input.selectedModelId === 'string' && findFurnitureDefinition(input.selectedModelId)) {
      session.selectedModelId = input.selectedModelId
    }
    if (input.version >= 2) {
      session.mode = input.mode === 'builder' ? 'builder' : 'catalog'
      session.assembly = normalizeTableAssembly(input.assembly)
    }
    return { session, notice: null }
  } catch {
    return { session, notice: 'Сохранённые настройки не удалось прочитать. Открыты начальные параметры.' }
  }
}

type SharedConfigurationResult = {
  status: 'absent' | 'invalid' | 'valid' | 'adjusted'
  configuration?: SharedConfiguration
  assembly?: TableAssemblyConfiguration
}

export function readSharedConfiguration(href: string): SharedConfigurationResult {
  const params = new URL(href).searchParams
  const raw = params.get(CONFIGURATION_QUERY_KEY)
  if (raw === null) return { status: 'absent' }
  if (raw.length > 16000 || params.getAll(CONFIGURATION_QUERY_KEY).length !== 1) return { status: 'invalid' }
  try {
    const input: unknown = JSON.parse(raw)
    if (!isRecord(input) || typeof input.version !== 'number' || ![1, 2, CONFIGURATION_VERSION].includes(input.version)) return { status: 'invalid' }
    if (input.kind === 'table-assembly' && (input.version === 2 || input.version === CONFIGURATION_VERSION)) {
      if (!isRecord(input.assembly)) return { status: 'invalid' }
      const assembly = normalizeTableAssembly(input.assembly)
      // Ссылки до выбора кромки уже описывали фаску 1 мм. Добавление этого
      // значения сохраняет внешний вид и не требует сообщения о коррекции.
      const rawAssembly: Record<string, unknown> = { edgeProfile: DEFAULT_EDGE_PROFILE, ...input.assembly }
      const complete = Object.keys(rawAssembly).length === Object.keys(assembly).length &&
        Object.entries(assembly).every(([key, value]) => Object.hasOwn(rawAssembly, key) && rawAssembly[key] === value)
      return { status: complete ? 'valid' : 'adjusted', assembly }
    }
    if (input.kind !== undefined || typeof input.modelId !== 'string') return { status: 'invalid' }
    const definition = findFurnitureDefinition(input.modelId)
    if (!definition) return { status: 'invalid' }
    const normalized = normalizeModelConfiguration(definition, input)
    // Generated links always specify every dimension and material slot. Partial
    // or outdated links use defaults, never the recipient's saved settings.
    const complete = (source: unknown, target: Record<string, string | number>) =>
      isRecord(source) && Object.keys(source).length === Object.keys(target).length &&
      Object.entries(target).every(([key, value]) => Object.hasOwn(source, key) && source[key] === value)
    return {
      status: complete(input.dimensions, normalized.dimensions) && complete(input.materials, normalized.materials) &&
        (input.facadeStyle === normalized.facadeStyle || input.facadeStyle === undefined)
        ? 'valid' : 'adjusted',
      configuration: { version: CONFIGURATION_VERSION, modelId: definition.id, ...normalized },
    }
  } catch {
    return { status: 'invalid' }
  }
}

export function applySharedConfiguration(session: ConfiguratorSession, configuration: SharedConfiguration): ConfiguratorSession {
  return {
    ...session,
    selectedModelId: configuration.modelId,
    mode: 'catalog',
    models: {
      ...session.models,
      [configuration.modelId]: { dimensions: configuration.dimensions, materials: configuration.materials,
        ...(configuration.facadeStyle ? { facadeStyle: configuration.facadeStyle } : {}) },
    },
  }
}

export function createConfigurationUrl(href: string, session: ConfiguratorSession): string {
  const url = new URL(href)
  const configuration = session.mode === 'builder' ? {
    version: 2, kind: 'table-assembly', assembly: session.assembly,
  } : {
    version: session.models[session.selectedModelId].facadeStyle ? CONFIGURATION_VERSION : 1,
    modelId: session.selectedModelId,
    ...session.models[session.selectedModelId],
  }
  url.searchParams.set(CONFIGURATION_QUERY_KEY, JSON.stringify(configuration))
  return url.href
}

export type ConfigurationAction =
  | { type: 'set-mode'; mode: 'catalog' | 'builder' }
  | { type: 'update-assembly'; patch: Partial<TableAssemblyConfiguration> }
  | { type: 'select-model'; modelId: string }
  | { type: 'set-dimension'; name: string; value: number }
  | { type: 'set-material'; slot: string; finishId: string }
  | { type: 'set-facade-style'; style: string }
  | { type: 'reset-model' }

export function updateSession(session: ConfiguratorSession, action: ConfigurationAction): ConfiguratorSession {
  if (action.type === 'set-mode') return action.mode === session.mode ? session : { ...session, mode: action.mode }
  if (action.type === 'update-assembly') {
    const { configuration: assembly } = updateTableAssembly(session.assembly, action.patch)
    return JSON.stringify(assembly) === JSON.stringify(session.assembly) ? session : { ...session, assembly }
  }
  if (action.type === 'reset-model' && session.mode === 'builder') {
    const assembly = createDefaultAssembly()
    return JSON.stringify(assembly) === JSON.stringify(session.assembly) ? session : { ...session, assembly }
  }
  if (action.type === 'select-model') {
    return action.modelId !== session.selectedModelId && findFurnitureDefinition(action.modelId)
      ? { ...session, selectedModelId: action.modelId, mode: 'catalog' } : session
  }
  const definition = findFurnitureDefinition(session.selectedModelId)!
  const current = session.models[definition.id]
  let next: ModelConfiguration
  if (action.type === 'reset-model') {
    next = createModelConfiguration(definition)
  } else if (action.type === 'set-facade-style') {
    if (!definition.facades?.styles.includes(action.style as FacadeStyleId)) return session
    next = { ...current, facadeStyle: action.style as FacadeStyleId }
  } else if (action.type === 'set-dimension') {
    if (!definition.dimensionOrder.includes(action.name) || !Number.isFinite(action.value)) return session
    const dimensions = normalizeModelConfiguration(definition, {
      ...current, dimensions: { ...current.dimensions, [action.name]: action.value },
    }).dimensions
    next = { ...current, dimensions }
  } else {
    const slot = definition.materialSlots?.[action.slot]
    if (!slot?.allowedFinishes?.includes(action.finishId)) return session
    next = { ...current, materials: { ...current.materials, [action.slot]: action.finishId } }
  }
  if (JSON.stringify(next) === JSON.stringify(current)) return session
  return { ...session, models: { ...session.models, [definition.id]: next } }
}
