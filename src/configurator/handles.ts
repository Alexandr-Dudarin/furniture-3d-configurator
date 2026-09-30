// Metres. Shared by procedural drawers and catalogue wardrobes.
export const HARDWARE_HANDLES = [
  { value: 'bar', label: 'Скоба', projection: .028, length: .136 },
  { value: 'knob', label: 'Круглая кнопка', projection: .020, length: .028 },
  { value: 'semicircle', label: 'Полукруглая', projection: .020, length: .078 },
  { value: 'edge-pull', label: 'Планка · 11 см', projection: .036, length: .110 },
  { value: 'profile', label: 'Широкий профиль · 22 см', projection: .028, length: .220 },
  { value: 'classic', label: 'Декоративная скоба', projection: .033, length: .178 },
  { value: 'flat-bar', label: 'Прямоугольная скоба', projection: .028, length: .160 },
] as const
export type HardwareHandle = typeof HARDWARE_HANDLES[number]['value']
export const CATALOG_HANDLES = [
  { value: 'original', label: 'Исходные ручки модели' },
  ...HARDWARE_HANDLES,
  { value: 'long-bar', label: 'Длинная прямоугольная скоба' },
  { value: 'none', label: 'Без ручек' },
] as const
export type CatalogHandle = typeof CATALOG_HANDLES[number]['value']
export function isCatalogHandle(value: unknown): value is CatalogHandle {
  return CATALOG_HANDLES.some(option => option.value === value)
}
export const DOOR_HANDLES = CATALOG_HANDLES.map(option => ({ ...option,
  label: option.value === 'edge-pull' ? 'Планка · 17 см' : option.value === 'profile' ? 'Широкий профиль · 33 см' : option.label,
}))
export function getCatalogHandle(value?: CatalogHandle, kind: 'doors' | 'drawers' = 'drawers') {
  const options = kind === 'doors' ? DOOR_HANDLES : CATALOG_HANDLES
  return options.find(option => option.value === value) ?? options[0]
}
export type HandleTarget = { panel: string; kind: 'door' | 'drawer'; side?: -1 | 1; original?: string }
export type HandleVariants = { targets: readonly HandleTarget[] }

const fourDoors = ['Outer_Left', 'Center_Left', 'Center_Right', 'Outer_Right'] as const
export const WARDROBE_HANDLES: Record<string, HandleVariants> = {
  'wardrobe-07-center-drawers': { targets: [
    ...fourDoors.map((s, i) => ({ panel: `Door_${s}_Panel`, kind: 'door' as const, side: (i < 2 ? 1 : -1) as -1 | 1 })),
    ...['01', '02', '03'].map(s => ({ panel: `Drawer_${s}_Front`, kind: 'drawer' as const })),
  ] },
  'wardrobe-08-four-door': { targets: fourDoors.map((s, i) => ({ panel: `Door_${s}_Panel`, kind: 'door', side: i < 2 ? 1 : -1, original: `Handle_${s}_Assembly` })) },
  'wardrobe-09-chelsea-two-door': { targets: ['Left', 'Right'].map((s, i) => ({ panel: `Door_${s}_Panel`, kind: 'door', side: i === 0 ? 1 : -1 })) },
  'wardrobe-15-katania-four-door': { targets: ['01', '02', '03', '04'].map((s, i) => ({ panel: `Door_${s}_Panel`, kind: 'door', side: i < 2 ? 1 : -1, original: `Handle_${s}_Assembly` })) },
}
