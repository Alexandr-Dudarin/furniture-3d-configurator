import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import * as THREE from 'three'

import {
  createFurnitureController,
} from '../furniture/furnitureController'

import type {
  FurnitureDefinition,
} from '../furniture/types'

import {
  createFurnitureMaterialController,
} from './materialController'

const TEST_DEFINITION = {
  id: 'material-test',
  label: 'Material Test',
  modelUrl: '/test.glb',
  dimensions: {
    length: {
      label: 'Length',
      base: 1,
      min: 1,
      max: 2,
      step: 0.1,
    },
  },
  dimensionOrder: [
    'length',
  ],
  resizeRules: [
    {
      type: 'scale',
      target: 'Top',
      dimension: 'length',
      axis: 'x',
    },
  ],
  textureAxes: {
    Surface_Top: {
      length: 'x',
    },
    Surface_Edge: {
      length: 'x',
    },
  },
  materialSlots: {
    primary: {
      label: 'Primary finish',
      targets: [
        'Surface_Top',
        'Surface_Edge',
      ],
      defaultFinish: 'finish-a',
      allowedFinishes: [
        'finish-a',
        'finish-b',
      ],
    },
    frame: {
      label: 'Frame finish',
      targets: [
        'Frame_Metal',
      ],
      defaultFinish: 'metal-a',
      allowedFinishes: [
        'metal-a',
        'metal-b',
      ],
    },
  },
} as const satisfies FurnitureDefinition

describe(
  'createFurnitureMaterialController',
  () => {
    it(
      'replaces declared semantic targets and keeps other materials unchanged',
      async () => {
        const {
          model,
          top,
          frame,
          untouchedMaterial,
        } = createTestModel()

        const controller =
          createFurnitureMaterialController(
            model,
            TEST_DEFINITION,
            {
              createMaterial:
                createTestMaterial,
            },
          )

        await controller.setFinishes(
          controller.getSelections(),
        )

        expect(
          getSingleMaterial(
            top,
          ).name,
        ).toBe('Surface_Top')

        expect(
          getSingleMaterial(
            top,
          ).userData.finishId,
        ).toBe('finish-a')

        expect(
          getSingleMaterial(
            frame,
          ).name,
        ).toBe('Frame_Metal')

        expect(
          getSingleMaterial(
            frame,
          ).userData.finishId,
        ).toBe('metal-a')

        const untouched =
          model.getObjectByName(
            'Untouched',
          )

        expect(
          untouched,
        ).toBeInstanceOf(
          THREE.Mesh,
        )

        expect(
          getSingleMaterial(
            untouched as THREE.Mesh,
          ),
        ).toBe(
          untouchedMaterial,
        )
      },
    )

    it(
      'switches finishes transactionally and preserves current UV compensation',
      async () => {
        const {
          model,
          top,
          edge,
        } = createTestModel()

        const furnitureController =
          createFurnitureController(
            model,
            TEST_DEFINITION,
          )

        const refreshTextures =
          vi.spyOn(
            furnitureController,
            'refreshTextures',
          )

        const materialController =
          createFurnitureMaterialController(
            model,
            TEST_DEFINITION,
            {
              createMaterial:
                createTestMaterial,
              onMaterialsChanged:
                furnitureController.refreshTextures,
            },
          )

        await materialController.setFinishes(
          materialController.getSelections(),
        )

        furnitureController.setDimension(
          'length',
          2,
        )

        expect(
          getMaterialMap(top)
            .repeat.x,
        ).toBeCloseTo(2)

        expect(
          getMaterialMap(edge)
            .repeat.x,
        ).toBeCloseTo(2)

        await materialController.setFinish(
          'primary',
          'finish-b',
        )

        expect(
          materialController
            .getSelections()
            .primary,
        ).toBe('finish-b')

        expect(
          getSingleMaterial(
            top,
          ).userData.finishId,
        ).toBe('finish-b')

        expect(
          getMaterialMap(top)
            .repeat.x,
        ).toBeCloseTo(2)

        expect(
          getMaterialMap(top)
            .offset.x,
        ).toBeCloseTo(-0.5)

        expect(
          getMaterialMap(edge)
            .repeat.x,
        ).toBeCloseTo(2)

        expect(
          refreshTextures,
        ).toHaveBeenCalledTimes(2)
      },
    )

    it(
      'supports material arrays and disposes detached runtime resources',
      async () => {
        const {
          model,
          top,
        } = createTestModel(
          true,
        )

        const materialController =
          createFurnitureMaterialController(
            model,
            TEST_DEFINITION,
            {
              createMaterial:
                createTestMaterial,
            },
          )

        await materialController.setFinish(
          'primary',
          'finish-a',
        )

        const firstMaterial =
          getMaterialByName(
            top,
            'Surface_Top',
          )

        const firstMap =
          getMaterialMapByMaterial(
            firstMaterial,
          )

        const materialDispose =
          vi.spyOn(
            firstMaterial,
            'dispose',
          )

        const textureDispose =
          vi.spyOn(
            firstMap,
            'dispose',
          )

        await materialController.setFinish(
          'primary',
          'finish-b',
        )

        expect(
          getMaterialByName(
            top,
            'Surface_Top',
          ).userData.finishId,
        ).toBe('finish-b')

        expect(
          materialDispose,
        ).toHaveBeenCalledOnce()

        expect(
          textureDispose,
        ).toHaveBeenCalledOnce()
      },
    )

    it(
      'rejects unknown slots, forbidden finishes and missing material targets',
      async () => {
        const {
          model,
        } = createTestModel()

        const controller =
          createFurnitureMaterialController(
            model,
            TEST_DEFINITION,
            {
              createMaterial:
                createTestMaterial,
            },
          )

        await expect(
          controller.setFinish(
            'missing',
            'finish-a',
          ),
        ).rejects.toThrow(
          'Unknown material slot',
        )

        await expect(
          controller.setFinish(
            'primary',
            'metal-b',
          ),
        ).rejects.toThrow(
          'is not allowed',
        )

        const brokenDefinition = {
          ...TEST_DEFINITION,
          materialSlots: {
            broken: {
              label: 'Broken',
              targets: [
                'Missing_Material',
              ],
              defaultFinish:
                'finish-a',
              allowedFinishes: [
                'finish-a',
              ],
            },
          },
        } as const satisfies FurnitureDefinition

        const brokenController =
          createFurnitureMaterialController(
            model,
            brokenDefinition,
            {
              createMaterial:
                createTestMaterial,
            },
          )

        await expect(
          brokenController.setFinishes(
            brokenController.getSelections(),
          ),
        ).rejects.toThrow(
          'was not found',
        )
      },
    )
  },
)

function createTestModel(
  useMaterialArray = false,
): {
  model: THREE.Group
  top: THREE.Mesh
  edge: THREE.Mesh
  frame: THREE.Mesh
  untouchedMaterial:
    THREE.MeshStandardMaterial
} {
  const model =
    new THREE.Group()

  const topGroup =
    new THREE.Group()

  topGroup.name = 'Top'

  const topMaterial =
    createNamedMaterial(
      'Surface_Top',
    )

  const top =
    new THREE.Mesh(
      new THREE.BoxGeometry(),
      useMaterialArray
        ? [
            topMaterial,
            createNamedMaterial(
              'Decorative_Insert',
            ),
          ]
        : topMaterial,
    )

  top.name = 'TopSurface'

  const edge =
    new THREE.Mesh(
      new THREE.BoxGeometry(),
      createNamedMaterial(
        'Surface_Edge',
      ),
    )

  edge.name = 'EdgeSurface'

  topGroup.add(
    top,
    edge,
  )

  const frame =
    new THREE.Mesh(
      new THREE.BoxGeometry(),
      createNamedMaterial(
        'Frame_Metal',
      ),
    )

  frame.name = 'Frame'

  const untouchedMaterial =
    createNamedMaterial(
      'Untouched_Surface',
    )

  const untouched =
    new THREE.Mesh(
      new THREE.BoxGeometry(),
      untouchedMaterial,
    )

  untouched.name = 'Untouched'

  model.add(
    topGroup,
    frame,
    untouched,
  )

  return {
    model,
    top,
    edge,
    frame,
    untouchedMaterial,
  }
}

function createNamedMaterial(
  name: string,
): THREE.MeshStandardMaterial {
  const material =
    new THREE.MeshStandardMaterial({
      map: createTexture(),
    })

  material.name = name

  return material
}

async function createTestMaterial(
  finishId: string,
): Promise<THREE.MeshStandardMaterial> {
  const material =
    new THREE.MeshStandardMaterial({
      map: createTexture(),
      roughnessMap:
        createTexture(),
      normalMap:
        createTexture(),
    })

  material.userData.finishId =
    finishId

  return material
}

function createTexture(): THREE.DataTexture {
  const texture =
    new THREE.DataTexture(
      new Uint8Array([
        255,
        255,
        255,
        255,
      ]),
      1,
      1,
    )

  texture.needsUpdate = true

  return texture
}

function getSingleMaterial(
  mesh: THREE.Mesh,
): THREE.Material {
  if (
    Array.isArray(
      mesh.material,
    )
  ) {
    throw new Error(
      'Expected a single material.',
    )
  }

  return mesh.material
}

function getMaterialByName(
  mesh: THREE.Mesh,
  name: string,
): THREE.Material {
  const materials =
    Array.isArray(
      mesh.material,
    )
      ? mesh.material
      : [mesh.material]

  const material =
    materials.find(
      (candidate) =>
        candidate.name ===
        name,
    )

  if (!material) {
    throw new Error(
      `Expected material "${name}".`,
    )
  }

  return material
}

function getMaterialMap(
  mesh: THREE.Mesh,
): THREE.Texture {
  return getMaterialMapByMaterial(
    getSingleMaterial(
      mesh,
    ),
  )
}

function getMaterialMapByMaterial(
  material: THREE.Material,
): THREE.Texture {
  if (
    !(
      material instanceof
      THREE.MeshStandardMaterial
    ) ||
    !material.map
  ) {
    throw new Error(
      'Expected a standard material map.',
    )
  }

  return material.map
}

