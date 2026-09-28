import { expect, it } from 'vitest'
import { DirectionalLight, Fog, Scene } from 'three'
import { configureWardrobeStudio } from './wardrobeStudio'

it('restores catalogue fog and shadows exactly after leaving the modular wardrobe', () => {
  const scene = new Scene(), light = new DirectionalLight(0xffffff, 2)
  light.name = 'Studio_Key'; scene.add(light); scene.fog = new Fog(0xffffff, 9, 22)
  Object.assign(light.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3 })
  const restore = configureWardrobeStudio(scene)
  expect(scene.fog.near).toBe(45); expect(light.shadow.camera.right).toBe(5); expect(light.intensity).toBe(2)
  restore()
  expect(scene.fog.near).toBe(9); expect(scene.fog.far).toBe(22)
  expect(light.shadow.camera.left).toBe(-3); expect(light.shadow.camera.right).toBe(3)
  expect(light.shadow.camera.top).toBe(3); expect(light.shadow.camera.bottom).toBe(-3)
})
