import { expect, it } from 'vitest'
import { Group, Mesh, BoxGeometry, MeshStandardMaterial, Texture } from 'three'
import { createFurnitureController } from './furnitureController'
import type { FurnitureDefinition } from './types'

const definition: FurnitureDefinition = {
  id: 'fixture', label: 'Fixture', modelUrl: '',
  dimensions: { height: { label: 'Height', base: 2, min: 1.5, max: 2.5, step: .001 } },
  dimensionOrder: ['height'], resizeRules: [], textureAxes: {},
  textureTransforms: { Board: {
    v: { dimension: 'height', baseLength: 1, stretchFactor: 1, translationFactor: .5, anchor: 1, uvUnitsPerMeter: 1 },
  } },
}

it('preserves aliased PBR maps, clones borrowed resources and never accumulates transforms', () => {
  const map = new Texture(); map.repeat.set(3, 2); map.offset.set(.2, .25)
  const material = new MeshStandardMaterial({ map, roughnessMap: map, metalnessMap: map, emissiveMap: map })
  material.name = 'Board'
  const root = new Group(), mesh = new Mesh(new BoxGeometry(), material)
  root.add(mesh)
  const controller = createFurnitureController(root, definition)
  const current = mesh.material
  expect(current.map).not.toBe(map)
  expect(current.map).toBe(current.roughnessMap)
  expect(current.map).toBe(current.metalnessMap)
  expect(current.map).toBe(current.emissiveMap)
  controller.setDimension('height', 2.5)
  expect(current.map!.repeat.y).toBe(3)
  expect(current.map!.offset.y).toBe(-.25)
  controller.refreshTextures(); controller.refreshTextures()
  expect(current.map!.repeat.y).toBe(3)
  expect(current.map!.offset.y).toBe(-.25)
  controller.setDimension('height', 2)
  expect(current.map!.repeat.toArray()).toEqual([3, 2])
  expect(current.map!.offset.toArray()).toEqual([.2, .25])
  expect(map.repeat.toArray()).toEqual([3, 2]); expect(map.offset.toArray()).toEqual([.2, .25])
})

it('rejects conflicting legacy and affine bindings instead of silently choosing one', () => {
  expect(() => createFurnitureController(new Group(), { ...definition, textureAxes: { Board: { height: 'y' } } })).toThrow('Ambiguous')
  expect(() => createFurnitureController(new Group(), { ...definition, dimensions: {} })).toThrow('Invalid texture')
})

it('rejects unloaded catalogue descriptors instead of displaying unresizable furniture', () => {
  expect(() => createFurnitureController(new Group(), { ...definition, loadRuntime: async () => definition })).toThrow('Load the furniture runtime')
})
