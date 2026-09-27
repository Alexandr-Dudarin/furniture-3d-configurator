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

function harness(floatSupported = true, motionSampling = false) {
  const scene = new Scene(), camera = new PerspectiveCamera(45, 1.5, .1, 100)
  const renderer = {
    shadowMap: { autoUpdate: true, needsUpdate: false },
    extensions: { has: () => floatSupported }, autoClear: true,
    getDrawingBufferSize: (v: { set: (x: number, y: number) => void }) => v.set(600, 400),
    getClearAlpha: () => 1, getClearColor: (c: Color) => c.set(0xeef0f3),
    setClearColor: vi.fn(), setRenderTarget: vi.fn(), clear: vi.fn(),
    copyFramebufferToTexture: vi.fn(), render: vi.fn(),
  }
  const rendering = createProgressiveRenderer(renderer as unknown as WebGLRenderer, scene, camera, { motionSampling })
  return { renderer, rendering, scene, camera }
}

it('preserves the projection, view offset and display pipeline; idle presentation reuses the result', () => {
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

it('averages only the current moving pose, clears each frame and presents without an extra scene draw', () => {
  const { renderer, rendering, scene, camera } = harness(true, true)
  const poses: number[][] = [], viewOffsets: number[][] = []
  renderer.render.mockImplementation(object => {
    if (object !== scene) return
    poses.push(camera.position.toArray())
    viewOffsets.push([camera.view!.offsetX, camera.view!.offsetY])
  })
  rendering.setEnabled(true)
  rendering.render(0)
  expect(poses).toHaveLength(2)
  expect(new Set(viewOffsets.map(v => v.join(','))).size).toBe(2)
  expect(rendering.samples).toBe(0)
  expect(rendering.stats.mode).toBe('motion-2')
  expect(renderer.clear).toHaveBeenCalledTimes(1)
  camera.position.x = 3
  rendering.invalidate(false); rendering.render(16)
  expect(poses.slice(2).every(p => p[0] === 3)).toBe(true)
  expect(renderer.clear).toHaveBeenCalledTimes(2)
  const count = poses.length
  rendering.present(); expect(poses).toHaveLength(count)
  // Settled refinement replaces the moving sum with a fresh sequence.
  rendering.render(136)
  expect(renderer.clear).toHaveBeenCalledTimes(3)
  expect(rendering.samples).toBe(1)
  for (let i = 1; i < DETAIL_SAMPLES; i++) rendering.render(136 + i * 16)
  expect(rendering.stats.mode).toBe('refined')
  const calls = renderer.render.mock.calls.length
  rendering.render(3000); expect(renderer.render).toHaveBeenCalledTimes(calls)
  expect(camera.view).toBeNull()
  rendering.dispose()
})

it('restores a custom view and projection after moving samples and after a failed sample', () => {
  const { renderer, rendering, scene, camera } = harness(true, true)
  camera.setViewOffset(1200, 800, 20, 40, 600, 400)
  const view = { ...camera.view! }, projection = camera.projectionMatrix.clone()
  rendering.setEnabled(true); rendering.render(0)
  expect(camera.view).toEqual(view); expect(camera.projectionMatrix).toEqual(projection)
  let pass = 0
  renderer.render.mockImplementation(object => { if (object === scene && ++pass === 2) throw new Error('lost') })
  rendering.invalidate(false)
  expect(() => rendering.render(16)).toThrow('lost')
  expect(camera.view).toEqual(view); expect(camera.projectionMatrix).toEqual(projection)
  expect(renderer.autoClear).toBe(true)
  expect(renderer.setRenderTarget).toHaveBeenLastCalledWith(null)
  // Failed partial motion result cannot be exported as a valid accumulated frame.
  const before = pass
  rendering.present(); expect(pass).toBe(before + 1)
  rendering.dispose()
})

it('uses one scene pass without the capability, above the memory cap, or with detail disabled', () => {
  for (const scenario of ['no-float', 'oversize', 'disabled']) {
    const { renderer, rendering, scene } = harness(scenario !== 'no-float', true)
    if (scenario === 'oversize') renderer.getDrawingBufferSize = v => v.set(4000, 2000)
    rendering.setEnabled(scenario !== 'disabled'); rendering.render(0)
    expect(renderer.render.mock.calls.filter(args => args[0] === scene)).toHaveLength(1)
    expect(renderer.copyFramebufferToTexture).not.toHaveBeenCalled()
    rendering.dispose()
  }
})

it('changes between four, two and one passes without retaining the previous sum or changing normalization', () => {
  const clock = vi.spyOn(performance, 'now').mockReturnValue(0)
  const { renderer, rendering, scene } = harness(true, true)
  const outputWeights: number[] = []
  renderer.render.mockImplementation(object => {
    if (object !== scene && object.material?.transparent === false) outputWeights.push(object.material.uniforms.weight.value)
  })
  try {
    rendering.setEnabled(true)
    let now = 0
    for (let i = 0; i < 92; i++) {
      rendering.invalidate(false); rendering.render(now); now += 16
    }
    expect(rendering.stats.mode).toBe('motion-4')
    expect(outputWeights.at(-1)).toBe(4) // sum stores samples divided by 16
    const before = rendering.stats.scenePasses
    rendering.invalidate(false); rendering.render(now)
    expect(rendering.stats.scenePasses - before).toBe(4)
    for (let i = 0; i < 4; i++) {
      now += 150; rendering.invalidate(false); rendering.render(now)
    }
    now += 16; rendering.invalidate(false); rendering.render(now)
    expect(rendering.stats.mode).toBe('motion-2')
    expect(outputWeights.at(-1)).toBe(8)
    for (let i = 0; i < 4; i++) {
      now += 33; rendering.invalidate(false); rendering.render(now)
    }
    const copies = renderer.copyFramebufferToTexture.mock.calls.length
    const passes = rendering.stats.scenePasses
    now += 16; rendering.invalidate(false); rendering.render(now)
    expect(rendering.stats.mode).toBe('direct')
    expect(rendering.stats.scenePasses - passes).toBe(1)
    expect(renderer.copyFramebufferToTexture).toHaveBeenCalledTimes(copies)
    rendering.present()
    expect(rendering.stats.scenePasses - passes).toBe(2) // export cannot reuse old moving sum
    rendering.render(now + 120)
    expect(rendering.stats.idleSamples).toBe(1)
    expect(outputWeights.at(-1)).toBe(16)
  } finally {
    rendering.dispose(); clock.mockRestore()
  }
})

it('finishes a fresh 16-sample capture at one current pose, including during motion or partial refinement', () => {
  const { renderer, rendering, scene, camera } = harness(true, true)
  const poses: number[] = [], phases: string[] = []
  renderer.render.mockImplementation(object => {
    if (object === scene) { poses.push(camera.position.x); phases.push(`${camera.view?.offsetX}/${camera.view?.offsetY}`) }
  })
  rendering.setEnabled(true); rendering.render(0); rendering.render(120)
  expect(rendering.samples).toBe(1)
  // Even a pose changed just before the click must not export an old sum.
  camera.position.x = 7
  const before = poses.length
  rendering.prepareCapture()
  expect(poses.slice(before)).toEqual(Array(16).fill(7))
  expect(new Set(phases.slice(before)).size).toBe(16)
  expect(rendering.stats.mode).toBe('refined'); expect(rendering.samples).toBe(16)
  expect(camera.view).toBeNull()
  const draws = renderer.render.mock.calls.length
  rendering.render(10000); expect(renderer.render.mock.calls.length).toBe(draws)
  camera.position.x = 9; rendering.invalidate(false); rendering.render(10016)
  expect(poses.slice(-2)).toEqual([9, 9]); expect(rendering.samples).toBe(0)
  rendering.prepareCapture(); expect(poses.slice(-16)).toEqual(Array(16).fill(9))
  rendering.dispose()
})

it('capture has bounded ordinary fallbacks and refuses a disposed runtime', () => {
  for (const scenario of ['unsupported', 'oversize', 'disabled']) {
    const { renderer, rendering, scene } = harness(scenario !== 'unsupported')
    if (scenario === 'oversize') renderer.getDrawingBufferSize = v => v.set(4000, 2000)
    rendering.setEnabled(scenario !== 'disabled'); rendering.prepareCapture()
    expect(renderer.render.mock.calls.filter(args => args[0] === scene)).toHaveLength(1)
    expect(renderer.copyFramebufferToTexture).not.toHaveBeenCalled()
    expect(rendering.stats.mode).toBe('direct')
    rendering.dispose(); expect(() => rendering.prepareCapture()).toThrow('unavailable')
  }
})

it('failed capture restores the view, discards its partial sum and can be retried', () => {
  const { renderer, rendering, scene, camera } = harness()
  camera.setViewOffset(1200, 800, 20, 40, 600, 400)
  const view = { ...camera.view! }, projection = camera.projectionMatrix.clone()
  let passes = 0
  renderer.render.mockImplementation(object => { if (object === scene && ++passes === 5) throw new Error('capture failed') })
  rendering.setEnabled(true)
  expect(() => rendering.prepareCapture()).toThrow('capture failed')
  expect(camera.view).toEqual(view); expect(camera.projectionMatrix).toEqual(projection)
  expect(rendering.samples).toBe(0); expect(renderer.autoClear).toBe(true)
  expect(renderer.setRenderTarget).toHaveBeenLastCalledWith(null)
  rendering.prepareCapture()
  expect(passes).toBe(21); expect(rendering.samples).toBe(16)
  expect(camera.view).toEqual(view)
  rendering.dispose()
})
