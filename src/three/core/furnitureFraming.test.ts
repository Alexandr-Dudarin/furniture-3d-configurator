import { expect, it } from 'vitest'
import { PerspectiveCamera, Vector3, MathUtils } from 'three'
import { fitFurnitureFrame } from './furnitureFraming'

it('fits all maximum cabinet corners in desktop and portrait viewports', () => {
  for (const aspect of [1.8, 1.1, .6]) {
    const fov = MathUtils.radToDeg(2 * Math.atan(Math.tan(MathUtils.degToRad(45) / 2) / Math.min(1, aspect)))
    const camera = new PerspectiveCamera(fov, aspect, .1, 100)
    const controls = { target: new Vector3(), maxDistance: 5, update: () => true }
    fitFurnitureFrame(camera, controls, { width: 2, height: 2.4, depth: .65 })
    camera.updateMatrixWorld()
    for (const x of [-1, 1]) for (const y of [0, 2.4]) for (const z of [-.325, .325]) {
      const point = new Vector3(x, y, z).project(camera)
      expect(Math.abs(point.x)).toBeLessThan(.821)
      expect(Math.abs(point.y)).toBeLessThan(.821)
      expect(point.z).toBeGreaterThan(-1); expect(point.z).toBeLessThan(1)
    }
  }
})
