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


it('expands lighting and fog to a large corner assembly and restores the accepted straight and catalogue studio', () => {
  const scene = new Scene(), light = new DirectionalLight(0xffffff, 2.6)
  light.name = 'Studio_Key'; light.position.set(-3.8, 4.5, 3); scene.add(light); scene.fog = new Fog(0xffffff, 9, 22)
  Object.assign(light.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: .5, far: 12 })
  const original = light.position.clone(), restore = configureWardrobeStudio(scene)
  restore.update({ width: 11.3, height: 2.8, depth: 11.3 }, true)
  expect(light.shadow.camera.right).toBeGreaterThan(9)
  expect(light.shadow.camera.far).toBeGreaterThan(30)
  expect(light.position.length()).toBeGreaterThan(original.length())
  expect(scene.fog.near).toBeGreaterThan(100); expect(light.intensity).toBe(2.6)
  restore.update({ width: 2, height: 2.2, depth: .55 }, false)
  expect(light.position).toEqual(original); expect(light.shadow.camera.right).toBe(5); expect(light.shadow.camera.far).toBe(12)
  restore(); expect(light.shadow.camera.right).toBe(3); expect(scene.fog.near).toBe(9)
})
