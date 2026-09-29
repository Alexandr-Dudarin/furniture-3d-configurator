// Physical metres. Geometry and closed dimensions use the same handle sizes.
export const DRAWER_BAR_HANDLE = { radius: .004, length: .136, mountLength: .02, mountSpacing: .128 } as const
export const DRAWER_KNOB_HANDLE = { radius: .014, thickness: .008, mountRadius: .004, mountLength: .012 } as const
export const DRAWER_HANDLES = [
  { value: 'bar', label: 'Скоба', projection: DRAWER_BAR_HANDLE.mountLength + 2 * DRAWER_BAR_HANDLE.radius },
  { value: 'knob', label: 'Круглая кнопка', projection: DRAWER_KNOB_HANDLE.mountLength + DRAWER_KNOB_HANDLE.thickness },
  { value: 'none', label: 'Без ручек', projection: 0 },
] as const
export type WardrobeDrawerHandle = typeof DRAWER_HANDLES[number]['value']
export function isWardrobeDrawerHandle(value: unknown): value is WardrobeDrawerHandle {
  return DRAWER_HANDLES.some(handle => handle.value === value)
}
// Omitted value is the original bar; old sessions retain their exact geometry.
export function getWardrobeDrawerHandle(value?: WardrobeDrawerHandle) {
  return DRAWER_HANDLES.find(handle => handle.value === value) ?? DRAWER_HANDLES[0]
}
