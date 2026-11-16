import { MeshStandardMaterial } from 'three'
import { wardrobePlacement } from '../../configurator/wardrobeAssembly/arrangement'
import {
  wardrobeSectionFinish,
  type WardrobeAssemblyConfiguration,
} from '../../configurator/wardrobeAssembly/state'
import { createFinishMaterial } from '../materials/createMaterial'
import { disposeMaterialResources } from '../materials/disposeMaterials'
import type { PartSlot } from './parts'

export function createMaterialResources(options: {
  maxAnisotropy?: number
  createMaterial?: typeof createFinishMaterial
  onChange?: () => void
}) {
  let disposed = false,
    request = 0
  const fallback: Record<PartSlot, MeshStandardMaterial> = {
    body: new MeshStandardMaterial({ color: 0xcdbb9d, roughness: 0.65 }),
    facade: new MeshStandardMaterial({ color: 0x626563, roughness: 0.65 }),
    hardware: new MeshStandardMaterial({ color: 0x16191c, roughness: 0.35 }),
    door: new MeshStandardMaterial({ color: 0x626563, roughness: 0.65 }),
  }
  // One owned PBR material per finish actually used, shared across sections.
  const materials = new Map<string, MeshStandardMaterial>()
  let bindings = new Map<string, string>()
  const bindingKey = (sectionId: string, slot: PartSlot) => `${sectionId}/${slot}`
  const appliedMaterial = (sectionId: string, slot: PartSlot) =>
    materials.get(bindings.get(bindingKey(sectionId, slot)) ?? '') ?? fallback[slot]
  const setFinishes = async (configuration: WardrobeAssemblyConfiguration, rebind: () => void) => {
    const ticket = ++request
    if (disposed) return
    const selected = new Map<string, string>()
    for (const section of configuration.sections) {
      selected.set(
        bindingKey(section.id, 'body'),
        wardrobeSectionFinish(configuration, section, 'bodyFinish'),
      )
      if (section.drawers)
        selected.set(
          bindingKey(section.id, 'facade'),
          wardrobeSectionFinish(configuration, section, 'facadeFinish'),
        )
      if (section.doors)
        selected.set(
          bindingKey(section.id, 'door'),
          section.doors.finish ?? wardrobeSectionFinish(configuration, section, 'facadeFinish'),
        )
      if (section.rod || section.drawers || section.doors)
        selected.set(
          bindingKey(section.id, 'hardware'),
          wardrobeSectionFinish(configuration, section, 'hardwareFinish'),
        )
    }
    for (const corner of wardrobePlacement(configuration).corners)
      selected.set(bindingKey(corner.id, 'body'), corner.bodyFinish ?? configuration.bodyFinish)
    if (selected.size === bindings.size && [...selected].every(([key, id]) => bindings.get(key) === id))
      return
    const needed = new Set(selected.values())
    const missing = [...needed].filter((id) => !materials.has(id))
    const prepared = await Promise.allSettled(
      missing.map(async (id) => ({
        id,
        value: await (options.createMaterial ?? createFinishMaterial)(id, options.maxAnisotropy ?? 1),
      })),
    )
    const failure = prepared.find((result) => result.status === 'rejected')
    if (disposed || ticket !== request || failure) {
      for (const result of prepared)
        if (result.status === 'fulfilled') disposeMaterialResources(result.value.value)
      if (!disposed && ticket === request && failure?.status === 'rejected') throw failure.reason
      return
    }
    for (const result of prepared)
      if (result.status === 'fulfilled') materials.set(result.value.id, result.value.value)
    bindings = selected
    rebind()
    // Release after rebinding all meshes; another section may still use the old finish.
    for (const [id, value] of materials)
      if (!needed.has(id)) {
        disposeMaterialResources(value)
        materials.delete(id)
      }
    options.onChange?.()
  }
  return {
    fallback,
    get: appliedMaterial,
    setFinishes,
    dispose() {
      if (disposed) return
      disposed = true
      request++
      materials.forEach(disposeMaterialResources)
      materials.clear()
      Object.values(fallback).forEach(disposeMaterialResources)
    },
  }
}
