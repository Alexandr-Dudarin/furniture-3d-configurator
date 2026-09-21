import { readFile } from 'node:fs/promises'
import { afterEach, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { getFurnitureDefinitions } from '../../configurator/furnitureRegistry'
import { createConfigurationUrl, createDefaultSession, readSavedSession, readSharedConfiguration, updateSession } from '../../configurator/savedConfiguration'
import { createFurnitureController } from '../furniture/furnitureController'
import type { FurnitureDefinition } from '../furniture/types'
import { disposeFurnitureModel } from '../furniture/model'
import { createFurnitureMaterialController } from '../materials/materialController'
import { disposeMaterialFinishCache } from '../materials/createMaterial'
import { getMaterialFinish } from '../materials/materialRegistry'

const dressers = getFurnitureDefinitions().filter(d => d.category === 'dressers')
type Axis = 'x' | 'y' | 'z'
type UVSurface = { surfacePlane: Axis; bindings: { u: { axis: Axis }; v: { axis: Axis } } }
afterEach(() => { disposeMaterialFinishCache(); vi.unstubAllGlobals() })
async function load(catalogue: FurnitureDefinition) {
  class ImageStub extends EventTarget {
    width = 2; height = 2
    set src(_value: string) { queueMicrotask(() => this.dispatchEvent(new Event('load'))) }
  }
  vi.stubGlobal('self', globalThis)
  vi.stubGlobal('document', { createElementNS: () => new ImageStub() })
  const definition = await catalogue.loadRuntime!()
  const bytes = await readFile(`public${definition.modelUrl}`)
  const root = (await new GLTFLoader().parseAsync(Uint8Array.from(bytes).buffer, '/models/')).scene
  const controller = createFurnitureController(root, definition)
  const materials = createFurnitureMaterialController(root, definition, { onMaterialsChanged: controller.refreshTextures })
  return { definition, root, controller, materials }
}
function materialMap(root: THREE.Object3D) {
  const result = new Map<string, THREE.MeshStandardMaterial>()
  root.traverse(o => {
    if (o instanceof THREE.Mesh) for (const m of Array.isArray(o.material) ? o.material : [o.material]) result.set(m.name, m)
  })
  return result
}
function dimensions(definition: FurnitureDefinition, which: 'min' | 'base' | 'max') {
  return Object.fromEntries(Object.entries(definition.dimensions).map(([key, range]) => [key, range[which]]))
}

it.each(dressers)('$id retains authored board colours, independent handles, defaults, sharing and millimetre precision', async catalogue => {
  const { definition, root, controller, materials } = await load(catalogue)
  const authored = materialMap(root)
  try {
    expect(definition.dimensions).toEqual(catalogue.dimensions)
    expect(catalogue.resizeRules).toEqual([])
    expect(definition.resizeRules.length).toBeGreaterThan(100)
    for (const [key, slot] of Object.entries(definition.materialSlots!)) {
      expect({ ...slot, targets: [] }).toEqual(catalogue.materialSlots![key])
      expect(slot.allowedFinishes).toContain(slot.defaultFinish)
      slot.allowedFinishes.forEach(id => expect(getMaterialFinish(id).id).toBe(id))
    }
    const defaults = materials.getSelections()
    await materials.setFinishes(defaults)
    const current = materialMap(root)
    for (const key of ['carcass', 'fronts']) {
      for (const target of definition.materialSlots![key].targets) {
        const before = authored.get(target)!, after = current.get(target)!
        expect(after.color.toArray()).toEqual(before.color.toArray())
        expect(after.roughness).toBeCloseTo(before.roughness, 7)
        expect(after.metalness).toBe(0)
        if (defaults[key] === 'oak-natural') expect(after.normalScale.toArray()).toEqual([.2, .2])
      }
    }
    const used = new Set(Object.values(definition.materialSlots!).flatMap(s => [...s.targets]))
    const fixed = [...authored].filter(([name]) => !used.has(name))
    expect(fixed.length).toBeGreaterThan(0)
    controller.setDimensions(dimensions(definition, 'max'))
    await materials.setFinish('fronts', 'oak-grey')
    if (definition.materialSlots!.hardware) await materials.setFinish('hardware', 'metal-brass-satin')
    const changed = materialMap(root)
    for (const target of definition.materialSlots!.carcass.targets) expect(changed.get(target)).toBe(current.get(target))
    for (const [name, original] of fixed) expect(changed.get(name)).toBe(original)
    await materials.setFinishes(defaults)
    controller.setDimensions(dimensions(definition, 'base'))
    expect(materials.getSelections()).toEqual(defaults)
    if (defaults.carcass === 'oak-natural') {
      expect(materialMap(root).get(definition.materialSlots!.carcass.targets[0])!.normalScale.x).toBe(.2)
      expect(getMaterialFinish('oak-natural')).toHaveProperty('normalScale', .65)
    }
    let session = updateSession(createDefaultSession(), { type: 'select-model', modelId: definition.id })
    for (const [name, config] of Object.entries(definition.dimensions)) {
      expect(config.step).toBe(.001); expect(config.displayUnit).toBe('mm')
      session = updateSession(session, { type: 'set-dimension', name, value: config.base + .001 })
    }
    session = updateSession(session, { type: 'set-material', slot: 'fronts', finishId: 'oak-grey' })
    expect(readSavedSession(JSON.stringify(session)).session).toEqual(session)
    const shared = readSharedConfiguration(createConfigurationUrl('https://example.test/', session))
    expect(shared.status).toBe('valid')
    expect(shared.configuration!.dimensions).toEqual(session.models[definition.id].dimensions)
    expect(shared.configuration!.materials).toEqual(session.models[definition.id].materials)
    session = updateSession(session, { type: 'reset-model' })
    expect(session.models[definition.id].materials).toEqual(defaults)
    expect(session.models[definition.id].dimensions).toEqual(dimensions(definition, 'base'))
  } finally { materials.dispose(); disposeFurnitureModel(root) }
}, 30000)

it.each(dressers)('$id preserves physical UVs on panels, edges and decoration after resize and finish replacement', async catalogue => {
  const { definition, root, controller, materials } = await load(catalogue)
  const contract = JSON.parse(await readFile(`assets/source/${definition.id}/model-contract.json`, 'utf8')) as { uvContract: Record<string, UVSurface> }
  function physicalUV() {
    let maxError = 0, checked = 0, decorations = 0
    root.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return
      const material = object.material as THREE.MeshStandardMaterial
      const info = contract.uvContract[material.name]
      if (!info) return
      const texture = material.map!
      expect(texture).toBeTruthy()
      for (const other of [material.normalMap!, material.roughnessMap!]) {
        expect(other.repeat.toArray()).toEqual(texture.repeat.toArray())
        expect(other.offset.toArray()).toEqual(texture.offset.toArray())
      }
      let part: THREE.Object3D | null = object
      while (part && !['board', 'decoration'].includes(part.userData.kind)) part = part.parent
      expect(part).toBeTruthy()
      const decorative = part!.userData.kind === 'decoration'
      let reference = part!
      if (decorative) {
        while (reference.userData.kind !== 'facade') reference = reference.parent!
        decorations++
      }
      const position = object.geometry.getAttribute('position'), normal = object.geometry.getAttribute('normal'), uv = object.geometry.getAttribute('uv')
      for (let i = 0; i < position.count; i++) {
        const world = object.localToWorld(new THREE.Vector3().fromBufferAttribute(position, i))
        const local = reference.worldToLocal(world.clone())
        const n = new THREE.Vector3().fromBufferAttribute(normal, i)
        for (const [key, component] of [['u', 'x'], ['v', 'y']] as const) {
          const axis = info.bindings[key].axis
          // Independent geometry oracle: metres in the owning panel/facade frame.
          // Board edges include their fixed bevel arc; decorative rims use local depth.
          const bevel = decorative ? 0 : part!.userData.bevelRadius as number
          const expected = .5 + (decorative && axis === 'z' ? part!.worldToLocal(world.clone()).z : local[axis])
            - bevel * n[axis] + bevel * Math.atan2(n[axis], Math.abs(n[info.surfacePlane]))
          const actual = (component === 'x' ? uv.getX(i) : uv.getY(i)) * texture.repeat[component] + texture.offset[component]
          maxError = Math.max(maxError, Math.abs(expected - actual)); checked++
        }
      }
    })
    expect(checked).toBeGreaterThan(1000)
    expect(maxError).toBeLessThan(1e-6)
    if (/13-|14-/.test(definition.id)) expect(decorations).toBeGreaterThan(0)
  }
  const snapshot = () => Object.fromEntries([...materialMap(root)].filter(([, m]) => m.map).map(([name, m]) =>
    [name, [...m.map!.repeat.toArray(), ...m.map!.offset.toArray()]]))
  try {
    await materials.setFinishes({ carcass: 'oak-natural', fronts: 'oak-grey' })
    const initial = snapshot()
    const middle = Object.fromEntries(Object.entries(definition.dimensions).map(([key, c]) => [key, Math.round((c.min + c.max) * 500) / 1000]))
    for (const values of [dimensions(definition, 'min'), middle, dimensions(definition, 'max')]) {
      controller.setDimensions(values); physicalUV()
      const before = snapshot()
      await materials.setFinish('fronts', 'board-white-matte')
      await materials.setFinish('fronts', 'oak-grey'); physicalUV()
      controller.refreshTextures(); controller.refreshTextures()
      expect(snapshot()).toEqual(before)
    }
    controller.setDimensions(dimensions(definition, 'base')); physicalUV()
    expect(snapshot()).toEqual(initial)
  } finally { materials.dispose(); disposeFurnitureModel(root) }
}, 30000)

it('registers five dressers and leaves the handle-free model without a handle slot', () => {
  expect(dressers).toHaveLength(5)
  expect(dressers.find(d => d.id === 'dresser-10-white-four-drawer')!.materialSlots).not.toHaveProperty('hardware')
})
