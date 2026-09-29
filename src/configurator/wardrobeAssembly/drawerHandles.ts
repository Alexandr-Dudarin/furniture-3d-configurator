import { HARDWARE_HANDLES } from '../handles'
// Physical metres. Geometry and closed dimensions use the same handle sizes.
export const DRAWER_BAR_HANDLE = { radius: .004, length: .136, mountLength: .02, mountSpacing: .128 } as const
export const DRAWER_KNOB_HANDLE = { radius: .014, thickness: .008, mountRadius: .004, mountLength: .012 } as const
export const DRAWER_HANDLES = [
  ...HARDWARE_HANDLES,
  { value: 'top-grip', label: 'Захват сверху · 4 см', projection: 0 },
  { value: 'finger-notch', label: 'Полуовальная выемка', projection: 0 },
  { value: 'none', label: 'Без ручек', projection: 0 },
] as const
export type WardrobeDrawerHandle = typeof DRAWER_HANDLES[number]['value']
export const TOP_GRIP_CUT = .038 // Existing 2 mm top reveal + 38 mm cut = 40 mm.
export function drawerBoxHeightReduction(value?: WardrobeDrawerHandle) { return value === 'top-grip' ? .022 : 0 }
export function drawerInnerHeight(height: number, value?: WardrobeDrawerHandle) { return height - .044 - drawerBoxHeightReduction(value) }
export function isWardrobeDrawerHandle(value: unknown): value is WardrobeDrawerHandle {
  return DRAWER_HANDLES.some(handle => handle.value === value)
}
// Omitted value is the original bar; old sessions retain their exact geometry.
export function getWardrobeDrawerHandle(value?: WardrobeDrawerHandle) {
  return DRAWER_HANDLES.find(handle => handle.value === value) ?? DRAWER_HANDLES[0]
}
