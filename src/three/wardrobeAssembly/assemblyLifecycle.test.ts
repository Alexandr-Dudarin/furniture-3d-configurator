import { expect, it, vi } from 'vitest'
import { BufferGeometry, Material, Mesh, MeshStandardMaterial } from 'three'
import {
  normalizeWardrobeAssembly,
  type WardrobeAssemblyConfiguration,
} from '../../configurator/wardrobeAssembly/state'
import { createWardrobeAssembly, planWardrobeParts, type WardrobeAssembly } from './wardrobeAssembly'

function configuration(kind: 'straight' | 'l' | 'u', variant = 0) {
  return normalizeWardrobeAssembly({
    arrangement:
      kind === 'straight'
        ? undefined
        : {
            kind,
            side: variant % 2 ? 'right' : 'left',
            split: 1,
            secondSplit: 2,
          },
    sections: Array.from({ length: 3 }, (_, index) => ({
      id: `section-${index + 1}`,
      width: variant % 2 ? 0.8 : 0.6,
      height: variant % 2 ? 2.4 : 2.2,
      depth: 0.55,
      shelves: index === 2 ? 3 : 0,
      drawers:
        index === 2
          ? undefined
          : {
              count: variant % 2 ? 1 : 2,
              height: 0.2,
              facadeStyle: variant % 2 ? 'frame' : 'fluted-wide',
              handle: 'finger-notch',
            },
      doors: index === 0 ? { count: 2, facadeStyle: 'fluted', handle: 'profile' } : undefined,
    })),
  })
}

function meshes(assembly: WardrobeAssembly) {
  const result: Mesh[] = []
  assembly.group.traverse((node) => {
    if (node instanceof Mesh) result.push(node)
  })
  return result
}

it('releases retired geometry once across repeated layout, facade and drawer changes', async () => {
  const loaded: MeshStandardMaterial[] = []
  const assembly = createWardrobeAssembly(configuration('straight'), {
    createMaterial: async (id) => {
      const material = new MeshStandardMaterial()
      material.name = id
      loaded.push(material)
      return material
    },
  })
  const geometryDisposals = new Map<BufferGeometry, ReturnType<typeof vi.fn>>()
  const materialDisposals = new Map<Material, ReturnType<typeof vi.fn>>()
  const track = () => {
    for (const mesh of meshes(assembly)) {
      if (!geometryDisposals.has(mesh.geometry))
        geometryDisposals.set(mesh.geometry, vi.spyOn(mesh.geometry, 'dispose'))
      for (const material of [mesh.material, mesh.customDepthMaterial, mesh.customDistanceMaterial].flat()) {
        if (material && !materialDisposals.has(material))
          materialDisposals.set(material, vi.spyOn(material, 'dispose'))
      }
    }
  }
  track()
  const front = assembly.group.getObjectByName('section-2/Drawer_1/Front')
  try {
    for (let round = 0; round < 3; round++) {
      for (const [index, kind] of (['u', 'l', 'straight'] as const).entries()) {
        const c = configuration(kind, round + index)
        assembly.update(c)
        await assembly.setFinishes(c)
        track()
        const live = meshes(assembly)
        expect(live.map((mesh) => mesh.name).sort()).toEqual(
          planWardrobeParts(c)
            .map((part) => part.name)
            .sort(),
        )
        expect(assembly.group.getObjectByName('section-2/Drawer_1/Front')).toBe(front)
        const geometries = new Set(live.map((mesh) => mesh.geometry))
        for (const [geometry, disposed] of geometryDisposals)
          expect(disposed).toHaveBeenCalledTimes(geometries.has(geometry) ? 0 : 1)
        for (const mesh of live)
          expect(materialDisposals.get(mesh.material as Material)).not.toHaveBeenCalled()
        expect(assembly.motion.update(0.1)).toBe(false)
        expect(assembly.getCameraObstacles().length).toBeGreaterThan(0)
      }
    }
    expect(loaded).toHaveLength(2)
  } finally {
    assembly.dispose()
    assembly.dispose()
  }
  for (const disposed of geometryDisposals.values()) expect(disposed).toHaveBeenCalledOnce()
  for (const disposed of materialDisposals.values()) expect(disposed).toHaveBeenCalledOnce()
  expect(assembly.group.children).toHaveLength(0)
  expect(assembly.getCameraObstacles()).toHaveLength(0)
})

it('binds a pending finish to the current meshes after the section has been rebuilt', async () => {
  let resolve!: (material: MeshStandardMaterial) => void
  const initial = normalizeWardrobeAssembly({ sections: [{ shelves: 0 }] })
  const assembly = createWardrobeAssembly(initial, {
    createMaterial: () =>
      new Promise((done) => {
        resolve = done
      }),
  })
  const pending = assembly.setFinishes(initial)
  const next = normalizeWardrobeAssembly({ sections: [{ shelves: 3, width: 0.8, height: 2.5 }] })
  assembly.update(next)
  const shelf = assembly.group.getObjectByName('section-1/Shelf_3') as Mesh
  expect(shelf).toBeDefined()
  const material = new MeshStandardMaterial()
  const disposed = vi.spyOn(material, 'dispose')
  resolve(material)
  await pending
  expect(meshes(assembly).every((mesh) => mesh.material === material)).toBe(true)
  expect(shelf.material).toBe(material)
  assembly.dispose()
  expect(disposed).toHaveBeenCalledOnce()
})

it('keeps the geometry and camera cache on finish-only updates and ignores work after disposal', async () => {
  const initial = configuration('u'),
    onChange = vi.fn(),
    createMaterial = vi.fn(async () => new MeshStandardMaterial())
  const assembly = createWardrobeAssembly(initial, { onChange, createMaterial })
  const boxes = assembly.getCameraObstacles(),
    front = assembly.group.getObjectByName('section-2/Drawer_1/Front') as Mesh
  const geometry = front.geometry
  const next: WardrobeAssemblyConfiguration = { ...initial, bodyFinish: 'oak-natural' }
  onChange.mockClear()
  assembly.update(next)
  expect(assembly.getCameraObstacles()).toBe(boxes)
  expect(onChange).not.toHaveBeenCalled()
  await assembly.setFinishes(next)
  expect(front.geometry).toBe(geometry)
  expect(assembly.getCameraObstacles()).toBe(boxes)
  expect(onChange).toHaveBeenCalledOnce()
  assembly.dispose()
  createMaterial.mockClear()
  onChange.mockClear()
  assembly.update(configuration('straight'))
  await assembly.setFinishes(initial)
  expect(createMaterial).not.toHaveBeenCalled()
  expect(onChange).not.toHaveBeenCalled()
  expect(assembly.group.children).toHaveLength(0)
})
