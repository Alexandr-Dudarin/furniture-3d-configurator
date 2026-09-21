import { readFile } from 'node:fs/promises'
import { afterEach, expect, it, vi } from 'vitest'
import { Box3, FileLoader, Mesh, Group, BoxGeometry, MeshStandardMaterial, Texture } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { disposeFurnitureModel, disposeFurnitureSourceCache, loadFurnitureModel } from './model'

afterEach(() => { disposeFurnitureSourceCache(); vi.restoreAllMocks(); vi.unstubAllGlobals() })

it('reuses GLB bytes while giving every instance independent mutable geometry and materials', async () => {
  const bytes = await readFile('public/modules/bases/u-frame.glb')
  const data = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
  const fetch = vi.spyOn(FileLoader.prototype, 'loadAsync').mockResolvedValue(data)
  const [a, b] = await Promise.all([loadFurnitureModel('/u-frame.glb'), loadFurnitureModel('/u-frame.glb')])
  const before = new Box3().setFromObject(b).clone()
  a.scale.setScalar(2)
  disposeFurnitureModel(a)
  expect(new Box3().setFromObject(b)).toEqual(before)
  const c = await loadFurnitureModel('/u-frame.glb')
  expect(fetch).toHaveBeenCalledTimes(1)
  const meshes = [a, b, c].map((group) => {
    let found: Mesh | undefined
    group.traverse((object) => { if (object instanceof Mesh && !found) found = object })
    return found!
  })
  expect(meshes[0].geometry).not.toBe(meshes[1].geometry)
  expect(meshes[0].material).not.toBe(meshes[1].material)
  expect(meshes[1].geometry).not.toBe(meshes[2].geometry)
  disposeFurnitureModel(b); disposeFurnitureModel(c)
})

it('drops invalid GLB bytes so the next attempt can fetch a corrected response', async () => {
  const fetch = vi.spyOn(FileLoader.prototype, 'loadAsync').mockResolvedValue(new ArrayBuffer(4))
  await expect(loadFurnitureModel('/broken.glb')).rejects.toThrow()
  await expect(loadFurnitureModel('/broken.glb')).rejects.toThrow()
  expect(fetch).toHaveBeenCalledTimes(2)
})


it('closes owned embedded bitmaps once, including after original materials are replaced', async () => {
  class Bitmap { close = vi.fn() }
  vi.stubGlobal('ImageBitmap', Bitmap)
  const image = new Bitmap()
  const model = new Group()
  const original = new MeshStandardMaterial({ map: new Texture(image as unknown as ImageBitmap) })
  const mesh = new Mesh(new BoxGeometry(), original)
  model.add(mesh)
  vi.spyOn(FileLoader.prototype, 'loadAsync').mockResolvedValue(new ArrayBuffer(4))
  vi.spyOn(GLTFLoader.prototype, 'parseAsync').mockResolvedValue({ scene: model } as Awaited<ReturnType<GLTFLoader['parseAsync']>>)
  await loadFurnitureModel('/embedded.glb')
  mesh.material = new MeshStandardMaterial()
  original.map!.dispose(); original.dispose()
  const assembly = new Group()
  assembly.add(model)
  disposeFurnitureModel(assembly); disposeFurnitureModel(assembly)
  expect(image.close).toHaveBeenCalledTimes(1)
})
