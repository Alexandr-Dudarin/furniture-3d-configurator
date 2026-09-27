import {
  AdditiveBlending, Color, FramebufferTexture, HalfFloatType, ShaderMaterial, Vector2, WebGLRenderTarget,
  type PerspectiveCamera, type Scene, type WebGLRenderer,
} from 'three'
import { createMotionSamplingBudget, motionOffsets } from './motionSampling'
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js'

// Stratified subpixel samples: a bounded burst after movement, not a larger
// permanent drawing buffer. Pixel shading as well as edges gets supersampled.
export const DETAIL_SAMPLES = 16
export const DETAIL_SETTLE_MS = 120
// RGBA8 sample + RGBA16F sum: at most 48 MB beyond the ordinary canvas.
export const DETAIL_MAX_PIXELS = 4_000_000
export const detailOffsets = Array.from({ length: DETAIL_SAMPLES }, (_, i) => {
  // Hammersley coverage: 16 distinct phases on BOTH axes. A 4x4 grid only
  // supplies four useful phases for vertical grooves and can retain moire.
  const reverse = ((i & 1) << 3) | ((i & 2) << 1) | ((i & 4) >> 1) | ((i & 8) >> 3)
  return [(reverse + .5) / DETAIL_SAMPLES - .5, (i + .5) / DETAIL_SAMPLES - .5] as const
})

/** Pure scheduling state; invalidating always discards earlier camera/content samples. */
export function createDetailSchedule() {
  let dirty = true, enabled = false, samples = 0, lastChange = -Infinity
  return {
    invalidate() { dirty = true; samples = 0 },
    enable(value: boolean) { if (enabled !== value) { enabled = value; dirty = true; samples = 0 } },
    step(now: number): 'direct' | 'sample' | 'idle' {
      if (dirty) { dirty = false; lastChange = now; return 'direct' }
      if (enabled && samples < DETAIL_SAMPLES && now - lastChange >= DETAIL_SETTLE_MS) return 'sample'
      return 'idle'
    },
    sampled() { samples++ },
    get samples() { return samples },
    get valid() { return !dirty && samples > 0 },
  }
}

export function createProgressiveRenderer(renderer: WebGLRenderer, scene: Scene, camera: PerspectiveCamera, options: { motionSampling?: boolean } = {}) {
  const schedule = createDetailSchedule()
  const motionBudget = createMotionSamplingBudget()
  const size = new Vector2(), savedColor = new Color()
  let sample: FramebufferTexture | null = null, sum: WebGLRenderTarget | null = null
  let copy: ShaderMaterial | null = null, quad: FullScreenQuad | null = null
  let output: ShaderMaterial | null = null, outputQuad: FullScreenQuad | null = null
  let enabled = false, disposed = false, accumulatedSamples = 0
  let scenePasses = 0, outputFrames = 0
  let lastMode: 'direct' | 'motion-2' | 'motion-4' | 'refining' | 'refined' = 'direct'
  const drawScene = () => { renderer.render(scene, camera); scenePasses++ }
  const previousShadowAutoUpdate = renderer.shadowMap.autoUpdate
  renderer.shadowMap.autoUpdate = false

  const release = () => {
    sample?.dispose(); sum?.dispose(); copy?.dispose(); quad?.dispose(); output?.dispose(); outputQuad?.dispose()
    sample = null; sum = null; copy = null; quad = null; output = null; outputQuad = null
    accumulatedSamples = 0
  }
  const invalidate = (shadows = true) => {
    schedule.invalidate(); accumulatedSamples = 0
    if (shadows) renderer.shadowMap.needsUpdate = true
  }
  const allocate = () => {
    renderer.getDrawingBufferSize(size)
    if (size.x * size.y > DETAIL_MAX_PIXELS) {
      release(); schedule.enable(false)
      return false
    }
    if (!sample) {
      sample = new FramebufferTexture(size.x, size.y)
      sum = new WebGLRenderTarget(size.x, size.y, { type: HalfFloatType, depthBuffer: false })
      sample.name = 'Facade detail sample'; sum.texture.name = 'Facade detail accumulation'
      copy = new ShaderMaterial({
        uniforms: { image: { value: sample }, weight: { value: 1 / DETAIL_SAMPLES } },
        vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
        fragmentShader: `uniform sampler2D image; uniform float weight; varying vec2 vUv;
          void main() { gl_FragColor = sRGBTransferEOTF(texture2D(image, vUv)) * weight; }`,
        blending: AdditiveBlending, transparent: true, premultipliedAlpha: true,
        depthTest: false, depthWrite: false, toneMapped: false,
      })
      quad = new FullScreenQuad(copy)
      output = new ShaderMaterial({
        uniforms: { image: { value: sum.texture }, weight: { value: 1 } },
        vertexShader: copy.vertexShader,
        fragmentShader: `uniform sampler2D image; uniform float weight; varying vec2 vUv;
          void main() { gl_FragColor = sRGBTransferOETF(texture2D(image, vUv) * weight); }`,
        depthTest: false, depthWrite: false, toneMapped: false,
      })
      outputQuad = new FullScreenQuad(output)
    }
    return true
  }
  const present = () => {
    if (disposed) return
    if (accumulatedSamples > 0 && sum && output && outputQuad) {
      output.uniforms.weight.value = DETAIL_SAMPLES / accumulatedSamples
      renderer.setRenderTarget(null)
      outputQuad.render(renderer)
    } else {
      renderer.setRenderTarget(null)
      drawScene()
    }
  }
  const renderSample = (x: number, y: number, index: number) => {
    const view = camera.view ? { ...camera.view } : null, aspect = camera.aspect
    const projection = camera.projectionMatrix.clone(), inverse = camera.projectionMatrixInverse.clone()
    const autoClear = renderer.autoClear, alpha = renderer.getClearAlpha()
    renderer.getClearColor(savedColor)
    try {
      camera.setViewOffset(view?.enabled ? view.fullWidth : size.x, view?.enabled ? view.fullHeight : size.y,
        (view?.enabled ? view.offsetX : 0) + x, (view?.enabled ? view.offsetY : 0) + y,
        view?.enabled ? view.width : size.x, view?.enabled ? view.height : size.y)
      renderer.setRenderTarget(null)
      drawScene()
      renderer.copyFramebufferToTexture(sample!)
      renderer.setRenderTarget(sum)
      renderer.autoClear = false
      if (index === 0) { renderer.setClearColor(0, 0); renderer.clear(true, false, false) }
      quad!.render(renderer)
      accumulatedSamples = index + 1
    } catch (error) {
      accumulatedSamples = 0
      throw error
    } finally {
      camera.view = view; camera.aspect = aspect
      camera.projectionMatrix.copy(projection); camera.projectionMatrixInverse.copy(inverse)
      renderer.autoClear = autoClear
      renderer.setClearColor(savedColor, alpha)
      renderer.setRenderTarget(null)
    }
  }
  return {
    invalidate,
    setEnabled(value: boolean) {
      // WebGL2 float attachments are checked before allocating the effect.
      value = value && renderer.extensions.has('EXT_color_buffer_float')
      if (enabled === value) return
      enabled = value; schedule.enable(value); accumulatedSamples = 0; motionBudget.pause()
      if (!value) release()
    },
    resize() { release(); schedule.enable(enabled); invalidate() },
    render(now: number) {
      if (disposed) return
      const action = schedule.step(now)
      if (action === 'idle') { motionBudget.pause(); return }
      if (action === 'direct') {
        const start = performance.now()
        accumulatedSamples = 0
        const count = motionBudget.samples
        if (enabled && options.motionSampling !== false && count !== 1 && allocate()) {
          for (const [index, offset] of motionOffsets[count].entries()) renderSample(offset[0], offset[1], index)
          lastMode = count === 4 ? 'motion-4' : 'motion-2'
        } else lastMode = 'direct'
        present(); outputFrames++
        motionBudget.observe(now, performance.now() - start)
        return
      }
      motionBudget.pause()
      if (!allocate()) { present(); outputFrames++; return }
      const index = schedule.samples, [x, y] = detailOffsets[index]
      // First idle sample clears the moving sum. The sixteen stationary phases
      // are independent of whichever moving quality the device could sustain.
      renderSample(x, y, index)
      schedule.sampled()
      lastMode = schedule.samples === DETAIL_SAMPLES ? 'refined' : 'refining'
      present(); outputFrames++
    },
    present,
    get samples() { return schedule.samples },
    get stats() {
      return { ...motionBudget.stats, mode: lastMode, enabled, scenePasses, outputFrames,
        idleSamples: schedule.samples, bufferedPixels: sample ? size.x * size.y : 0 }
    },
    dispose() {
      if (disposed) return
      disposed = true; release()
      renderer.shadowMap.autoUpdate = previousShadowAutoUpdate
    },
  }
}
