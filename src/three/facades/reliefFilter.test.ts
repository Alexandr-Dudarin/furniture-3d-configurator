import { expect, it, vi } from 'vitest'
import {
  BoxGeometry, Group, Material, Mesh, MeshStandardMaterial, ShaderLib, UniformsUtils,
  Vector4, type WebGLRenderer,
} from 'three'
import { createFacadeGeometry } from './facadeGeometry'
import { createReliefFilter, filterReliefShader, hasReliefShader, prepareReliefGeometry, RELIEF_ATTRIBUTE, reliefDetail } from './reliefFilter'
import { catalogue } from '../models/wardrobe-katania-four-door/catalog'
import { disposeFurnitureModel } from '../furniture/model'

const spec = catalogue.facades!
it('keeps close detail and fades subpixel grooves continuously with zero slope at both thresholds', () => {
  expect(reliefDetail(.5)).toBe(0); expect(reliefDetail(3)).toBe(1)
  let previous = 0
  for (let pixels = 0; pixels <= 4; pixels += .001) {
    const value = reliefDetail(pixels)
    expect(value).toBeGreaterThanOrEqual(previous)
    expect(value - previous).toBeLessThan(.001)
    previous = value
  }
  expect(reliefDetail(.75001)).toBeLessThan(1e-8)
  expect(1 - reliefDetail(2.49999)).toBeLessThan(1e-8)
})

it.each(['fluted', 'fluted-sides', 'diagonal', 'herringbone', 'herringbone-wide', 'diamonds'] as const)(
  '%s: flattens only relief, preserves the back, outer bevel, UV, picking geometry and physical envelope', style => {
    const profile = style.startsWith('fluted') ? spec.fluted : style === 'diagonal' ? spec.diagonal! : style === 'diamonds' ? spec.diamonds! : spec.herringbone!
    const geometry = createFacadeGeometry(.6, 1.9, .018, style, spec, {}, { width: .6, height: 1.9, x: 0, y: 0 })
    const mesh = new Mesh(geometry), pos = geometry.getAttribute('position'), normal = geometry.getAttribute('normal')
    const before = { position: pos.array.slice(), normal: normal.array.slice(), uv: geometry.getAttribute('uv').array.slice(), index: geometry.index!.array.slice(), bounds: geometry.boundingBox!.clone() }
    expect(prepareReliefGeometry(mesh, .6, 1.9, .018, spec.bevel, { ...profile, vertical: style.startsWith('fluted') })).toBe(true)
    const data = geometry.getAttribute(RELIEF_ATTRIBUTE)
    let moved = 0
    for (let i = 0; i < pos.count; i++) {
      const z = pos.getZ(i), delta = data.getX(i)
      if (delta > 1e-7) moved++
      expect(delta).toBeGreaterThanOrEqual(0)
      expect(z + delta).toBeLessThanOrEqual(.009 + 1e-8)
      if (z < -.008) { expect(delta).toBe(0); expect(data.getY(i)).toBe(0) }
      if (Math.abs(pos.getX(i)) >= .3 - spec.bevel - 1e-6 || Math.abs(pos.getY(i)) >= .95 - spec.bevel - 1e-6) expect(data.getY(i)).toBe(0)
    }
    expect(moved).toBeGreaterThan(10)
    expect(pos.array).toEqual(before.position); expect(normal.array).toEqual(before.normal)
    expect(geometry.getAttribute('uv').array).toEqual(before.uv); expect(geometry.index!.array).toEqual(before.index)
    expect(geometry.boundingBox).toEqual(before.bounds)
    prepareReliefGeometry(mesh, .6, 1.9, .018, spec.bevel, { ...profile, vertical: style.startsWith('fluted') })
    expect(geometry.getAttribute(RELIEF_ATTRIBUTE)).toBe(data)
    geometry.dispose(); (mesh.material as Material).dispose()
  })

it('compensates source-node scaling but refuses rotated/non-positive local axes', () => {
  const mesh = new Mesh(new BoxGeometry(.2, 1, .018))
  mesh.scale.set(2, 1.9, 1)
  const profile = { width: .003, depth: .0018, vertical: true }
  expect(prepareReliefGeometry(mesh, .4, 1.9, .018, 0, profile)).toBe(true)
  const data = mesh.geometry.getAttribute(RELIEF_ATTRIBUTE)
  expect(data.getZ(0) * 2).toBeCloseTo(.003, 8)
  expect(data.getW(0) * 1.9).toBeCloseTo(.003, 8)
  mesh.rotation.x = .5; expect(prepareReliefGeometry(mesh, .4, 1.9, .018, 0, profile)).toBe(false)
  mesh.rotation.x = 0; mesh.scale.x = -1
  expect(prepareReliefGeometry(mesh, .4, 1.9, .018, 0, profile)).toBe(false)
})

it('patches the installed Three standard, depth and distance vertex stages at the correct order', () => {
  for (const key of ['standard', 'depth', 'distance'] as const) {
    const vertex = filterReliefShader(ShaderLib[key].vertexShader)
    expect(vertex).toContain('float facadeWeight = facadeDetail();')
    expect(vertex).toContain('transformed.z += facadeRelief.x * (1.0 - facadeWeight);')
    expect(vertex.indexOf('float facadeWeight =')).toBeLessThan(vertex.indexOf('transformed.z +='))
    expect(vertex.indexOf('transformed.z +=')).toBeLessThan(vertex.indexOf('#include <project_vertex>'))
  }
})

it('shares shadow resources, updates colour/shadow viewport separately, follows replacement finishes and disposes once', () => {
  const root = new Group(), filter = createReliefFilter()
  const a = new Mesh(new BoxGeometry(), new MeshStandardMaterial()), b = a.clone(); root.add(a, b)
  filter.attach(a); filter.attach(b)
  expect(hasReliefShader(a.material)).toBe(true)
  const shader = { vertexShader: ShaderLib.standard.vertexShader, fragmentShader: ShaderLib.standard.fragmentShader, uniforms: UniformsUtils.clone(ShaderLib.standard.uniforms) }
  const renderer = { getCurrentViewport: (v: Vector4) => v.set(0, 0, 954, 2064) } as WebGLRenderer
  a.material.onBeforeCompile(shader as Parameters<Material['onBeforeCompile']>[0], renderer)
  a.onBeforeRender(renderer, undefined!, undefined!, a.geometry, a.material, undefined!)
  expect(shader.uniforms.facadeViewport.value.toArray()).toEqual([954, 2064])
  expect(a.customDepthMaterial).toBe(b.customDepthMaterial)
  const shadow = { vertexShader: ShaderLib.depth.vertexShader, fragmentShader: ShaderLib.depth.fragmentShader, uniforms: UniformsUtils.clone(ShaderLib.depth.uniforms) }
  a.customDepthMaterial!.onBeforeCompile(shadow as Parameters<Material['onBeforeCompile']>[0], renderer)
  renderer.getCurrentViewport = v => v.set(0, 0, 2048, 2048)
  a.onBeforeShadow(renderer, undefined!, undefined!, undefined!, a.geometry, a.customDepthMaterial!, undefined!)
  expect(shadow.uniforms.facadeViewport.value.toArray()).toEqual([2048, 2048])
  expect(shader.uniforms.facadeViewport.value.toArray()).toEqual([954, 2064])
  a.material = new MeshStandardMaterial({ color: 0xaaaaaa }); filter.attach(a)
  expect(hasReliefShader(a.material)).toBe(true)
  const d = vi.spyOn(a.customDepthMaterial!, 'dispose'), e = vi.spyOn(a.customDistanceMaterial!, 'dispose')
  disposeFurnitureModel(root); expect(d).toHaveBeenCalledOnce(); expect(e).toHaveBeenCalledOnce()
})

it('does not overwrite an unrelated shader hook', () => {
  const mesh = new Mesh(new BoxGeometry(), new MeshStandardMaterial()), before = vi.fn()
  mesh.material.onBeforeCompile = before
  createReliefFilter().attach(mesh)
  expect(mesh.material.onBeforeCompile).toBe(before); expect(mesh.customDepthMaterial).toBeUndefined()
})
