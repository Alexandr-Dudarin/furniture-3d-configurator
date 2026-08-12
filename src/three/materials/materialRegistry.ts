import type {
  MaterialFinishDefinition,
} from './types'

const MATERIAL_ROOT =
  '/materials'

const materialFinishes = [
  {
    id: 'oak-natural',
    label: 'Дуб натуральный',
    category: 'wood',
    kind: 'texture',
    maps: {
      color:
        `${MATERIAL_ROOT}/wood/oak-natural/base-color.jpg`,
      roughness:
        `${MATERIAL_ROOT}/wood/oak-natural/roughness.jpg`,
      normal:
        `${MATERIAL_ROOT}/wood/oak-natural/normal-gl.jpg`,
    },
    metalness: 0,
    roughness: 1,
    normalScale: 0.65,
  },
  {
    id: 'walnut-natural',
    label: 'Орех натуральный',
    category: 'wood',
    kind: 'texture',
    maps: {
      color:
        `${MATERIAL_ROOT}/wood/walnut-natural/base-color.jpg`,
      roughness:
        `${MATERIAL_ROOT}/wood/walnut-natural/roughness.jpg`,
      normal:
        `${MATERIAL_ROOT}/wood/walnut-natural/normal-gl.jpg`,
    },
    metalness: 0,
    roughness: 1,
    normalScale: 0.65,
  },
  {
    id: 'pine-coated',
    label: 'Сосна лакированная',
    category: 'wood',
    kind: 'texture',
    maps: {
      color:
        `${MATERIAL_ROOT}/wood/pine-coated/base-color.jpg`,
      roughness:
        `${MATERIAL_ROOT}/wood/pine-coated/roughness.jpg`,
      normal:
        `${MATERIAL_ROOT}/wood/pine-coated/normal-gl.jpg`,
    },
    metalness: 0,
    roughness: 1,
    normalScale: 0.55,
  },
  {
    id: 'ash-natural',
    label: 'Ясень натуральный',
    category: 'wood',
    kind: 'texture',
    maps: {
      color:
        `${MATERIAL_ROOT}/wood/ash-natural/base-color.jpg`,
      roughness:
        `${MATERIAL_ROOT}/wood/ash-natural/roughness.jpg`,
      normal:
        `${MATERIAL_ROOT}/wood/ash-natural/normal-gl.jpg`,
    },
    metalness: 0,
    roughness: 1,
    normalScale: 0.6,
  },
  {
    id: 'concrete-light',
    label: 'Светлый бетон',
    category: 'stone',
    kind: 'texture',
    maps: {
      color:
        `${MATERIAL_ROOT}/stone/concrete-light/base-color.jpg`,
      roughness:
        `${MATERIAL_ROOT}/stone/concrete-light/roughness.jpg`,
      normal:
        `${MATERIAL_ROOT}/stone/concrete-light/normal-gl.jpg`,
    },
    color: 0xf2f0eb,
    metalness: 0,
    roughness: 1,
    normalScale: 0.45,
  },
  {
    id: 'marble-cream',
    label: 'Кремовый мрамор',
    category: 'stone',
    kind: 'texture',
    maps: {
      color:
        `${MATERIAL_ROOT}/stone/marble-cream/base-color.jpg`,
      roughness:
        `${MATERIAL_ROOT}/stone/marble-cream/roughness.jpg`,
      normal:
        `${MATERIAL_ROOT}/stone/marble-cream/normal-gl.jpg`,
    },
    metalness: 0,
    roughness: 1,
    normalScale: 0.35,
  },
  {
    id: 'metal-black-matte',
    label: 'Чёрный окрашенный металл',
    category: 'metal',
    kind: 'procedural',
    color: 0x111317,
    metalness: 0.04,
    roughness: 0.29,
  },
  {
    id: 'metal-white-matte',
    label: 'Белый окрашенный металл',
    category: 'metal',
    kind: 'procedural',
    color: 0xe8e7e2,
    metalness: 0.04,
    roughness: 0.32,
  },
  {
    id: 'metal-anthracite',
    label: 'Антрацитовый металл',
    category: 'metal',
    kind: 'procedural',
    color: 0x34383b,
    metalness: 0.04,
    roughness: 0.3,
  },
] as const satisfies readonly MaterialFinishDefinition[]

const materialFinishRegistry =
  new Map<
    string,
    MaterialFinishDefinition
  >(
    materialFinishes.map(
      (finish) => [
        finish.id,
        finish,
      ],
    ),
  )

export function getMaterialFinish(
  finishId: string,
): MaterialFinishDefinition {
  const finish =
    materialFinishRegistry.get(
      finishId,
    )

  if (!finish) {
    throw new Error(
      `Material finish "${finishId}" is not registered.`,
    )
  }

  return finish
}

export function getMaterialFinishes():
  MaterialFinishDefinition[] {
  return [
    ...materialFinishes,
  ]
}
