import { afterEach, describe, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { createSceneEnvironment } from './createSceneEnvironment'

afterEach(() => vi.restoreAllMocks())

// PMREM rendering is covered in real WebGL browser checks. Here, isolate
// resource ownership, including React StrictMode's setup/cleanup/setup cycle.
const renderer = {} as THREE.WebGLRenderer

describe('studio environment lifecycle', () => {
  it('releases owned resources once and restores the borrowed scene on repeated setup/cleanup', () => {
    const scene = new THREE.Scene()
    const furniture = new THREE.Group()
    const previousTexture = new THREE.Texture()
    const previousFog = new THREE.Fog(0xffffff, 3, 8)
    scene.add(furniture)
    scene.environment = previousTexture
    scene.environmentIntensity = 0.7
    scene.fog = previousFog
    const borrowedDispose = vi.spyOn(previousTexture, 'dispose')
    const fromScene = vi.spyOn(THREE.PMREMGenerator.prototype, 'fromScene')
    const generatorDispose = vi.spyOn(THREE.PMREMGenerator.prototype, 'dispose')
    const roomDispose = vi.spyOn(RoomEnvironment.prototype, 'dispose')

    for (let cycle = 0; cycle < 2; cycle += 1) {
      const target = new THREE.WebGLRenderTarget(1, 1)
      const targetDispose = vi.spyOn(target, 'dispose')
      fromScene.mockReturnValueOnce(target)
      const studio = createSceneEnvironment(scene, renderer)
      expect(scene.environment).toBe(target.texture)
      expect(targetDispose).not.toHaveBeenCalled()
      const geometryDispose = vi.spyOn(studio.floor.geometry, 'dispose')
      const materialDispose = vi.spyOn(studio.floor.material, 'dispose')
      const shadowTarget = new THREE.WebGLRenderTarget(1, 1)
      studio.keyLight.shadow.map = shadowTarget
      const shadowDispose = vi.spyOn(shadowTarget, 'dispose')

      studio.dispose()
      studio.dispose()
      expect(scene.children).toEqual([furniture])
      expect(scene.environment).toBe(previousTexture)
      expect(scene.environmentIntensity).toBe(0.7)
      expect(scene.fog).toBe(previousFog)
      for (const dispose of [targetDispose, geometryDispose, materialDispose, shadowDispose]) {
        expect(dispose).toHaveBeenCalledTimes(1)
      }
    }
    expect(fromScene).toHaveBeenCalledTimes(2)
    expect(roomDispose).toHaveBeenCalledTimes(2)
    expect(generatorDispose).toHaveBeenCalledTimes(2)
    expect(borrowedDispose).not.toHaveBeenCalled()
  })

  it('does not replace a newer owner\'s environment or fog during cleanup', () => {
    const scene = new THREE.Scene()
    const target = new THREE.WebGLRenderTarget(1, 1)
    vi.spyOn(THREE.PMREMGenerator.prototype, 'fromScene').mockReturnValue(target)
    const studio = createSceneEnvironment(scene, renderer)
    const replacement = new THREE.Texture()
    const fog = new THREE.Fog(0x333333, 2, 6)
    scene.environment = replacement
    scene.environmentIntensity = 1.2
    scene.fog = fog
    studio.dispose()
    expect(scene.environment).toBe(replacement)
    expect(scene.environmentIntensity).toBe(1.2)
    expect(scene.fog).toBe(fog)
  })

  it('cleans up temporary studio resources if PMREM generation fails', () => {
    const scene = new THREE.Scene()
    const roomDispose = vi.spyOn(RoomEnvironment.prototype, 'dispose')
    const generatorDispose = vi.spyOn(THREE.PMREMGenerator.prototype, 'dispose')
    vi.spyOn(THREE.PMREMGenerator.prototype, 'fromScene').mockImplementation(() => { throw new Error('GPU setup failed') })
    expect(() => createSceneEnvironment(scene, renderer)).toThrow('GPU setup failed')
    expect(roomDispose).toHaveBeenCalledTimes(1)
    expect(generatorDispose).toHaveBeenCalledTimes(1)
    expect(scene.children).toEqual([])
    expect(scene.environment).toBeNull()
    expect(scene.fog).toBeNull()
  })
})
