import * as THREE from 'three'

import type {
  FurnitureDefinition,
} from '../furniture/types'

import {
  createFinishMaterial,
} from './createMaterial'

import {
  disposeMaterialResources,
} from './disposeMaterials'

import type {
  MaterialSelections,
} from './types'

type CreateMaterial = (
  finishId: string,
  maxAnisotropy: number,
) => Promise<THREE.MeshStandardMaterial>

type MaterialBinding = {
  mesh: THREE.Mesh
  index: number | null
  material: THREE.Material
}

export type FurnitureMaterialController = {
  getSelections: () =>
    MaterialSelections

  setFinish: (
    slotName: string,
    finishId: string,
  ) => Promise<void>

  setFinishes: (
    selections:
      Partial<MaterialSelections>,
  ) => Promise<void>

  dispose: () => void
}

type FurnitureMaterialControllerOptions = {
  maxAnisotropy?: number

  createMaterial?:
    CreateMaterial

  onMaterialsChanged?:
    () => void
}

export function createInitialMaterialSelections(
  definition: FurnitureDefinition,
): MaterialSelections {
  const selections:
    MaterialSelections = {}

  Object.entries(
    definition.materialSlots ?? {},
  ).forEach(
    ([slotName, slot]) => {
      selections[slotName] =
        slot.defaultFinish
    },
  )

  return selections
}

export function createFurnitureMaterialController(
  model: THREE.Object3D,
  definition: FurnitureDefinition,
  options:
    FurnitureMaterialControllerOptions = {},
): FurnitureMaterialController {
  const materialSlots =
    definition.materialSlots ?? {}

  const maxAnisotropy =
    options.maxAnisotropy ?? 1

  const createMaterial =
    options.createMaterial ??
    createFinishMaterial

  const selections =
    createInitialMaterialSelections(
      definition,
    )

  const appliedSelections:
    MaterialSelections = {}

  validateMaterialSlots(
    definition,
  )

  let disposed = false

  let pending:
    Promise<void> =
      Promise.resolve()

  const enqueue = (
    task: () => Promise<void>,
  ): Promise<void> => {
    const result =
      pending
        .catch(() => {})
        .then(task)

    pending = result

    return result
  }

  const applySelections =
    async (
      nextSelections:
        Partial<MaterialSelections>,
    ) => {
      if (disposed) {
        return
      }

      const changes =
        Object.entries(
          nextSelections,
        ).filter(
          ([slotName, finishId]) => {
            if (
              finishId ===
              undefined
            ) {
              return false
            }

            assertAllowedFinish(
              definition,
              slotName,
              finishId,
            )

            return (
              appliedSelections[
                slotName
              ] !== finishId
            )
          },
        ) as Array<
          [string, string]
        >

      if (changes.length === 0) {
        return
      }

      const prepared:
        Array<{
          slotName: string
          finishId: string
          replacements: Array<{
            target: string
            bindings:
              MaterialBinding[]
            material:
              THREE.MeshStandardMaterial
          }>
        }> = []

      try {
        for (
          const [
            slotName,
            finishId,
          ] of changes
        ) {
          const slot =
            materialSlots[
              slotName
            ]

          const replacements =
            await Promise.all(
              slot.targets.map(
                async (
                  target,
                ) => {
                  const bindings =
                    getMaterialBindings(
                      model,
                      target,
                    )

                  if (
                    bindings.length ===
                    0
                  ) {
                    throw new Error(
                      `[${definition.id}] Material target "${target}" from slot "${slotName}" was not found in the model.`,
                    )
                  }

                  const material =
                    await createMaterial(
                      finishId,
                      maxAnisotropy,
                    )

                  material.name =
                    target

                  material.userData = {
                    ...material.userData,
                    materialSlot:
                      slotName,
                    finishId,
                  }

                  return {
                    target,
                    bindings,
                    material,
                  }
                },
              ),
            )

          prepared.push({
            slotName,
            finishId,
            replacements,
          })
        }
      } catch (error) {
        prepared.forEach(
          ({ replacements }) => {
            replacements.forEach(
              ({ material }) => {
                disposeMaterialResources(
                  material,
                )
              },
            )
          },
        )

        throw error
      }

      if (disposed) {
        prepared.forEach(
          ({ replacements }) => {
            replacements.forEach(
              ({ material }) => {
                disposeMaterialResources(
                  material,
                )
              },
            )
          },
        )

        return
      }

      const replacedMaterials =
        new Set<THREE.Material>()

      prepared.forEach(
        ({
          slotName,
          finishId,
          replacements,
        }) => {
          replacements.forEach(
            ({
              bindings,
              material,
            }) => {
              bindings.forEach(
                (binding) => {
                  replacedMaterials.add(
                    binding.material,
                  )

                  assignMaterial(
                    binding,
                    material,
                  )
                },
              )
            },
          )

          selections[slotName] =
            finishId

          appliedSelections[
            slotName
          ] = finishId
        },
      )

      disposeDetachedMaterials(
        model,
        replacedMaterials,
      )

      options.onMaterialsChanged?.()
    }

  return {
    getSelections() {
      return {
        ...selections,
      }
    },

    setFinish(
      slotName,
      finishId,
    ) {
      return enqueue(
        () =>
          applySelections({
            [slotName]:
              finishId,
          }),
      )
    },

    setFinishes(
      nextSelections,
    ) {
      return enqueue(
        () =>
          applySelections(
            nextSelections,
          ),
      )
    },

    dispose() {
      disposed = true
    },
  }
}

function validateMaterialSlots(
  definition: FurnitureDefinition,
): void {
  const usedTargets =
    new Map<string, string>()

  Object.entries(
    definition.materialSlots ?? {},
  ).forEach(
    ([slotName, slot]) => {
      if (
        slot.targets.length ===
        0
      ) {
        throw new Error(
          `[${definition.id}] Material slot "${slotName}" must contain at least one target.`,
        )
      }

      if (
        slot.allowedFinishes.length ===
        0
      ) {
        throw new Error(
          `[${definition.id}] Material slot "${slotName}" must allow at least one finish.`,
        )
      }

      if (
        !slot.allowedFinishes.includes(
          slot.defaultFinish,
        )
      ) {
        throw new Error(
          `[${definition.id}] Default finish "${slot.defaultFinish}" is not allowed by material slot "${slotName}".`,
        )
      }

      slot.targets.forEach(
        (target) => {
          const previousSlot =
            usedTargets.get(
              target,
            )

          if (previousSlot) {
            throw new Error(
              `[${definition.id}] Material target "${target}" belongs to both "${previousSlot}" and "${slotName}".`,
            )
          }

          usedTargets.set(
            target,
            slotName,
          )
        },
      )
    },
  )
}

function assertAllowedFinish(
  definition:
    FurnitureDefinition,
  slotName: string,
  finishId: string,
): void {
  const slot =
    definition.materialSlots?.[
      slotName
    ]

  if (!slot) {
    throw new Error(
      `[${definition.id}] Unknown material slot "${slotName}".`,
    )
  }

  if (
    slot.allowedFinishes.includes(
      finishId,
    )
  ) {
    return
  }

  throw new Error(
    `[${definition.id}] Finish "${finishId}" is not allowed by material slot "${slotName}".`,
  )
}

function getMaterialBindings(
  model: THREE.Object3D,
  materialName: string,
): MaterialBinding[] {
  const bindings:
    MaterialBinding[] = []

  model.traverse(
    (object) => {
      if (
        !(
          object instanceof
          THREE.Mesh
        )
      ) {
        return
      }

      if (
        Array.isArray(
          object.material,
        )
      ) {
        object.material.forEach(
          (material, index) => {
            if (
              material.name ===
              materialName
            ) {
              bindings.push({
                mesh: object,
                index,
                material,
              })
            }
          },
        )

        return
      }

      if (
        object.material.name ===
        materialName
      ) {
        bindings.push({
          mesh: object,
          index: null,
          material:
            object.material,
        })
      }
    },
  )

  return bindings
}

function assignMaterial(
  binding: MaterialBinding,
  material: THREE.Material,
): void {
  if (binding.index === null) {
    binding.mesh.material =
      material

    return
  }

  if (
    !Array.isArray(
      binding.mesh.material,
    )
  ) {
    return
  }

  binding.mesh.material[
    binding.index
  ] = material
}

function disposeDetachedMaterials(
  model: THREE.Object3D,
  candidates:
    Set<THREE.Material>,
): void {
  const attached =
    new Set<THREE.Material>()

  model.traverse(
    (object) => {
      if (
        !(
          object instanceof
          THREE.Mesh
        )
      ) {
        return
      }

      const materials =
        Array.isArray(
          object.material,
        )
          ? object.material
          : [object.material]

      materials.forEach(
        (material) => {
          attached.add(
            material,
          )
        },
      )
    },
  )

  candidates.forEach(
    (material) => {
      if (
        !attached.has(
          material,
        )
      ) {
        disposeMaterialResources(
          material,
        )
      }
    },
  )
}

