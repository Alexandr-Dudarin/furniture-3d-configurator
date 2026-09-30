import { DOOR_HANDLES, HARDWARE_HANDLES, type CatalogHandle } from '../handles'
import { isWardrobeDrawerFacade, type WardrobeDrawerFacade } from './drawerFacades'

export const MAX_DOOR_WIDTH = .6
export const DOOR_THICKNESS = .016
export const DOOR_REVEAL = .002
export const DOOR_BODY_GAP = .002
export const DOOR_OPEN_ANGLE = Math.PI / 2
export const WARDROBE_DOOR_HANDLES = DOOR_HANDLES.filter(option => option.value !== 'original')
export type WardrobeDoorHandle = Exclude<CatalogHandle, 'original'>
export type WardrobeDoors = {
  count: 1 | 2
  hinge: 'left' | 'right'
  facadeStyle: WardrobeDrawerFacade
  handle: WardrobeDoorHandle
  finish?: string
}
export function normalizeWardrobeDoors(input: unknown, width: number, finishes: readonly string[]): WardrobeDoors | undefined {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return undefined
  const raw = input as Record<string, unknown>
  if (raw.count !== 1 && raw.count !== 2) return undefined
  return { count: width > MAX_DOOR_WIDTH ? 2 : raw.count,
    hinge: raw.hinge === 'right' ? 'right' : 'left',
    facadeStyle: isWardrobeDrawerFacade(raw.facadeStyle) ? raw.facadeStyle : 'smooth',
    handle: WARDROBE_DOOR_HANDLES.some(h => h.value === raw.handle) ? raw.handle as WardrobeDoorHandle : 'bar',
    ...(typeof raw.finish === 'string' && finishes.includes(raw.finish) ? { finish: raw.finish } : {}),
  }
}
export function wardrobeDoorWidth(width: number, count: 1 | 2) {
  return (width - 2 * DOOR_REVEAL - (count - 1) * 2 * DOOR_REVEAL) / count
}
export function wardrobeDoorsLabel(doors?: WardrobeDoors) {
  return !doors ? 'Без дверей' : doors.count === 2 ? 'Две дверцы' : `Одна дверца · петли ${doors.hinge === 'left' ? 'слева' : 'справа'}`
}
export function wardrobeDoorHandleProjection(handle: WardrobeDoorHandle) {
  return handle === 'none' ? 0 : handle === 'long-bar' ? .028 : HARDWARE_HANDLES.find(h => h.value === handle)!.projection
}
