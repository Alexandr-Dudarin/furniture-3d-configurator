import { describe, expect, it, vi } from 'vitest'
import { Color, PerspectiveCamera, Scene, type WebGLRenderer } from 'three'
import { createDetailSchedule, createProgressiveRenderer, DETAIL_SAMPLES, detailOffsets } from './progressiveRenderer'

describe('detail scheduling', () => {
  it('renders changes immediately, waits for rest, then stops after a bounded burst', () => {
    const s = createDetailSchedule(); s.enable(true)
    expect(s.step(0)).toBe('direct')
    expect(s.step(119)).toBe('idle')
    for (let i = 0; i < DETAIL_SAMPLES; i++) {
      expect(s.step(120 + i * 16)).toBe('sample'); s.sampled()
    }
    expect(s.step(10000)).toBe('idle')
    expect(s.samples).toBe(DETAIL_SAMPLES)
    s.invalidate()
    expect(s.valid).toBe(false); expect(s.samples).toBe(0)
    expect(s.step(10001)).toBe('direct')
    expect(s.step(10120)).toBe('idle')
    s.enable(false)
    expect(s.step(11000)).toBe('direct'); expect(s.step(12000)).toBe('idle')
  })

  it('never mixes frames while the camera or a door keeps moving', () => {
    const s = createDetailSchedule(); s.enable(true)
    for (let i = 0; i < 90; i++) { s.invalidate(); expect(s.step(i * 16)).toBe('direct') }
    expect(s.samples).toBe(0)
    expect(s.step(2000)).toBe('sample'); s.sampled()
    s.invalidate(); expect(s.valid).toBe(false)
  })

  it('covers a pixel symmetrically without shifting the saved camera', () => {
    expect(new Set(detailOffsets.map(p => p.join('/'))).size).toBe(DETAIL_SAMPLES)
    for (const axis of [0, 1]) {
      expect(new Set(detailOffsets.map(p => p[axis])).size).toBe(DETAIL_SAMPLES)
      expect(detailOffsets.reduce((sum, p) => sum + p[axis], 0)).toBe(0)
      expect(detailOffsets.every(p => Math.abs(p[axis]) < .5)).toBe(true)
    }
  })
})

function harness(floatSupported = true) {
  const scene = new Scene(), camera = new PerspectiveCamera(45, 1.5, .1, 100)
  const renderer = {
    shadowMap: { autoUpdate: true, needsUpdate: false },
    extensions: { has: () => floatSupported }, autoClear: true,
    getDrawingBufferSize: (v: { set: (x: number, y: number) => void }) => v.set(600, 400),
    getClearAlpha: () => 1, getClearColor: (c: Color) => c.set(0xeef0f3),
    setClearColor: vi.fn(), setRenderTarget: vi.fn(), clear: vi.fn(),
    copyFramebufferToTexture: vi.fn(), render: vi.fn(),
  }
  const rendering = createProgressiveRenderer(renderer as unknown as WebGLRenderer, scene, camera)
  return { renderer, rendering, scene, camera }
}

it('preserves the projection, view offset and display pipeline; idle/export reuse the result', () => {
  const { renderer, rendering, scene, camera } = harness()
  camera.setViewOffset(1200, 800, 20, 40, 600, 400)
  const view = { ...camera.view! }, projection = camera.projectionMatrix.clone(), inverse = camera.projectionMatrixInverse.clone()
  rendering.setEnabled(true); rendering.invalidate(); rendering.render(0)
  for (let i = 0; i < DETAIL_SAMPLES; i++) rendering.render(120 + i * 16)
  expect(rendering.samples).toBe(DETAIL_SAMPLES)
  expect(camera.view).toEqual(view); expect(camera.projectionMatrix).toEqual(projection)
  expect(camera.projectionMatrixInverse).toEqual(inverse); expect(camera.aspect).toBe(1.5)
  expect(renderer.copyFramebufferToTexture).toHaveBeenCalledTimes(DETAIL_SAMPLES)
  const sceneCalls = () => renderer.render.mock.calls.filter(args => args[0] === scene).length
  expect(sceneCalls()).toBe(DETAIL_SAMPLES + 1)
  const draws = renderer.render.mock.calls.length
  rendering.render(10000); expect(renderer.render).toHaveBeenCalledTimes(draws)
  rendering.present(); expect(sceneCalls()).toBe(DETAIL_SAMPLES + 1)
  expect(renderer.autoClear).toBe(true)
  rendering.invalidate(false); rendering.present(); expect(sceneCalls()).toBe(DETAIL_SAMPLES + 2)
  rendering.dispose()
})

it('releases buffers when disabling or resizing and can refine again without stale frames', () => {
  const { renderer, rendering } = harness()
  rendering.setEnabled(true); rendering.render(0); rendering.render(120)
  const texture = renderer.copyFramebufferToTexture.mock.calls[0][0]
  const disposeTexture = vi.spyOn(texture, 'dispose')
  const target = renderer.setRenderTarget.mock.calls.find(args => args[0] !== null)![0]
  const disposeTarget = vi.spyOn(target, 'dispose')
  rendering.resize()
  expect(disposeTexture).toHaveBeenCalledOnce(); expect(disposeTarget).toHaveBeenCalledOnce()
  expect(rendering.samples).toBe(0)
  rendering.render(1000); rendering.render(1120); expect(rendering.samples).toBe(1)
  rendering.setEnabled(false); rendering.render(1200); rendering.render(2000)
  expect(rendering.samples).toBe(0)
  rendering.dispose(); rendering.dispose()
  expect(renderer.shadowMap.autoUpdate).toBe(true)
  expect(disposeTexture).toHaveBeenCalledOnce()
})

it('falls back to ordinary rendering without float buffers', () => {
  const { renderer, rendering } = harness(false)
  rendering.setEnabled(true); rendering.render(0); rendering.render(1000)
  expect(renderer.render).toHaveBeenCalledOnce()
  expect(renderer.copyFramebufferToTexture).not.toHaveBeenCalled()
  rendering.dispose()
})

it('bounds extra buffer memory and enables refinement again after a smaller resize', () => {
  const { renderer, rendering } = harness()
  const normalSize = renderer.getDrawingBufferSize
  renderer.getDrawingBufferSize = v => v.set(4000, 2000)
  rendering.setEnabled(true); rendering.render(0); rendering.render(120); rendering.render(500)
  expect(renderer.copyFramebufferToTexture).not.toHaveBeenCalled()
  renderer.getDrawingBufferSize = normalSize
  rendering.resize(); rendering.render(1000); rendering.render(1120)
  expect(renderer.copyFramebufferToTexture).toHaveBeenCalledOnce()
  rendering.dispose()
})

it('restores camera and renderer state even if sampling fails', () => {
  const { renderer, rendering, camera, scene } = harness()
  const projection = camera.projectionMatrix.clone()
  rendering.setEnabled(true); rendering.render(0)
  renderer.render.mockImplementation(object => { if (object === scene) throw new Error('context failure') })
  expect(() => rendering.render(120)).toThrow('context failure')
  expect(camera.view).toBeNull(); expect(camera.projectionMatrix).toEqual(projection)
  expect(renderer.autoClear).toBe(true); expect(renderer.setRenderTarget).toHaveBeenLastCalledWith(null)
  expect(rendering.samples).toBe(0)
  rendering.dispose()
})
