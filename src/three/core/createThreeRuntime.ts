import * as THREE from 'three'
import { createFurnitureFraming } from './furnitureFraming'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

type Vector3Tuple =
  readonly [
    number,
    number,
    number,
  ]

export type ThreeRuntimeOptions = {
  background?:
    THREE.ColorRepresentation

  cameraPosition?:
    Vector3Tuple

  controlsTarget?:
    Vector3Tuple

  minDistance?: number

  maxDistance?: number
}

export type ThreeRuntime = {
  scene: THREE.Scene

  camera:
    THREE.PerspectiveCamera

  renderer:
    THREE.WebGLRenderer

  controls:
    OrbitControls

  framing: ReturnType<typeof createFurnitureFraming>

  addFrameListener: (listener: (deltaSeconds: number) => void) => () => void

  dispose: () => void
}

// Preserve a 45° horizontal field on portrait viewports, where keeping only
// the vertical field would crop long tabletops. Camera position stays intact.
function cameraFieldOfView(aspect: number) {
  const halfAngle = THREE.MathUtils.degToRad(45) / 2
  return THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(halfAngle) / Math.min(1, Math.max(aspect, 0.5))))
}

export function createThreeRuntime(
  container: HTMLDivElement,
  options: ThreeRuntimeOptions = {},
): ThreeRuntime {
  const {
    background = 0xeef0f3,

    cameraPosition = [
      1.8,
      1.4,
      2.2,
    ],

    controlsTarget = [
      0,
      0.45,
      0,
    ],

    minDistance = 1.2,

    maxDistance = 5,
  } = options

  /*
   * --------------------------------
   * SCENE
   * --------------------------------
   */

  const scene =
    new THREE.Scene()

  scene.background =
    new THREE.Color(
      background,
    )

  /*
   * --------------------------------
   * CAMERA
   * --------------------------------
   */

  const initialWidth =
    Math.max(
      container.clientWidth,
      1,
    )

  const initialHeight =
    Math.max(
      container.clientHeight,
      1,
    )

  const camera =
    new THREE.PerspectiveCamera(
      cameraFieldOfView(initialWidth / initialHeight),

      initialWidth /
        initialHeight,

      0.1,
      100,
    )

  camera.position.set(
    ...cameraPosition,
  )

  /*
   * --------------------------------
   * RENDERER
   * --------------------------------
   */

  const renderer =
    new THREE.WebGLRenderer({
      antialias: true,
    })

  // Compress bright highlights while retaining the finish's base colour.
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.NeutralToneMapping
  renderer.toneMappingExposure = 1

  renderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio,
      2,
    ),
  )

  renderer.setSize(
    initialWidth,
    initialHeight,
  )

  renderer.shadowMap.enabled =
    true

  renderer.shadowMap.type =
    THREE.PCFShadowMap

  container.appendChild(
    renderer.domElement,
  )

  /*
   * --------------------------------
   * CONTROLS
   * --------------------------------
   */

  const controls =
    new OrbitControls(
      camera,
      renderer.domElement,
    )

  controls.enableDamping =
    true

  // Keep navigation above the floor; panning follows the horizontal plane.
  controls.maxPolarAngle = Math.PI / 2 - 0.04
  controls.screenSpacePanning = false

  controls.target.set(
    ...controlsTarget,
  )

  controls.minDistance =
    minDistance

  controls.maxDistance =
    maxDistance

  controls.update()

  /*
   * --------------------------------
   * RESIZE
   * --------------------------------
   */

  const framing = createFurnitureFraming(camera, controls)

  const resize =
    () => {
      const width =
        Math.max(
          container.clientWidth,
          1,
        )

      const height =
        Math.max(
          container.clientHeight,
          1,
        )

      camera.aspect =
        width / height
      camera.fov = cameraFieldOfView(camera.aspect)

      camera.updateProjectionMatrix()
      framing.resize()

      renderer.setSize(
        width,
        height,
      )

      renderer.setPixelRatio(
        Math.min(
          window.devicePixelRatio,
          2,
        ),
      )
    }

  const resizeObserver =
    new ResizeObserver(
      resize,
    )

  resizeObserver.observe(
    container,
  )

  /*
   * --------------------------------
   * RENDER LOOP
   * --------------------------------
   */

  const frameListeners = new Set<(deltaSeconds: number) => void>()
  const addFrameListener = (listener: (deltaSeconds: number) => void) => {
    frameListeners.add(listener)
    return () => { frameListeners.delete(listener) }
  }
  let lastFrameTime = performance.now()
  let animationFrameId = 0

  let disposed = false

  const animate =
    () => {
      if (disposed) {
        return
      }

      const now = performance.now()
      const deltaSeconds = Math.min(0.1, (now - lastFrameTime) / 1000)
      lastFrameTime = now
      frameListeners.forEach(listener => listener(deltaSeconds))
      controls.update()

      renderer.render(
        scene,
        camera,
      )

      animationFrameId =
        requestAnimationFrame(
          animate,
        )
    }

  animate()

  /*
   * --------------------------------
   * CLEANUP
   * --------------------------------
   */

  const dispose =
    () => {
      if (disposed) {
        return
      }

      disposed = true
      frameListeners.clear()

      cancelAnimationFrame(
        animationFrameId,
      )

      resizeObserver.disconnect()

      controls.dispose()

      renderer.dispose()

      if (
        renderer.domElement
          .parentElement ===
        container
      ) {
        container.removeChild(
          renderer.domElement,
        )
      }
    }

  return {
    scene,
    camera,
    renderer,
    controls,
    framing,
    addFrameListener,
    dispose,
  }
}