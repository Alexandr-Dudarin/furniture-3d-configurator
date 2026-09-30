import type { FacadeStyleId } from '../../three/facades/types'
import { getFacadeStyle } from '../facades/catalog'

export const DRAWER_FACADE_STYLES = ['smooth', 'frame', 'fluted', 'fluted-wide'] as const satisfies readonly FacadeStyleId[]
export type WardrobeDrawerFacade = typeof DRAWER_FACADE_STYLES[number]
export function isWardrobeDrawerFacade(value: unknown): value is WardrobeDrawerFacade {
  return DRAWER_FACADE_STYLES.some(style => style === value)
}
// Omitted value retains the accepted smooth geometry and old saved state.
export function getWardrobeDrawerFacade(value?: WardrobeDrawerFacade) {
  return getFacadeStyle(value ?? 'smooth')
}
