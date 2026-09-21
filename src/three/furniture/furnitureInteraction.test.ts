import { expect, it } from 'vitest'
import { createTapGesture } from './furnitureInteraction'

it('only accepts a short primary click on the same visible part', () => {
  const g = createTapGesture()
  g.down(1, 50, 50, 0, 'door', 0)
  expect(g.up(1, 52, 51, 150, 'door')).toBe('door')
  g.down(1, 50, 50, 0, 'door', 2)
  expect(g.up(1, 50, 50, 100, 'door')).toBeNull()
  g.down(1, 50, 50, 0, 'door', 0)
  expect(g.up(1, 50, 50, 900, 'door')).toBeNull()
  g.down(1, 50, 50, 0, 'door', 0)
  expect(g.up(1, 50, 50, 100, 'drawer')).toBeNull()
})
it('rejects orbit drags even if the pointer returns to its start', () => {
  const g = createTapGesture()
  g.down(1, 50, 50, 0, 'door', 0); g.move(1, 70, 50); g.move(1, 50, 50)
  expect(g.up(1, 50, 50, 100, 'door')).toBeNull()
})
it('rejects the entire pinch, cancellations and window blur then accepts a new tap', () => {
  const g = createTapGesture()
  g.down(1, 50, 50, 0, 'door', 0); g.down(2, 60, 60, 1, 'door', 0)
  expect(g.up(2, 60, 60, 100, 'door')).toBeNull()
  expect(g.up(1, 50, 50, 101, 'door')).toBeNull()
  g.down(1, 50, 50, 0, 'door', 0); g.cancel(1)
  expect(g.up(1, 50, 50, 100, 'door')).toBeNull()
  g.down(1, 50, 50, 0, 'door', 0); g.reset()
  expect(g.active()).toBe(false); expect(g.up(1, 50, 50, 100, 'door')).toBeNull()
  g.down(1, 50, 50, 0, 'door', 0)
  expect(g.up(1, 50, 50, 100, 'door')).toBe('door')
})

it('binds real raycasts: the nearest opaque panel blocks a door; hidden ancestors never receive clicks', async () => {
  const THREE = await import('three')
  const { bindFurnitureInteraction } = await import('./furnitureInteraction')
  const { createFurnitureMotion } = await import('./furnitureMotion')
  const { vi } = await import('vitest')
  const windowTarget = new EventTarget()
  const canvas = Object.assign(new EventTarget(), {
    style: { cursor: '' },
    getBoundingClientRect: () => ({ left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100 }),
  })
  vi.stubGlobal('window', windowTarget)
  const root = new THREE.Group(), door = new THREE.Group()
  const geometry = new THREE.BoxGeometry(1, 1, .1), material = new THREE.MeshBasicMaterial()
  door.name = 'Door'; door.add(new THREE.Mesh(geometry, material)); root.add(door)
  const blocker = new THREE.Mesh(geometry, material); blocker.position.z = 1; root.add(blocker)
  const camera = new THREE.PerspectiveCamera(45, 1, .1, 10); camera.position.z = 3
  const motion = createFurnitureMotion(root, {
    id: 'test', label: 'Test', modelUrl: '', dimensions: {}, dimensionOrder: [], resizeRules: [], textureAxes: {},
    articulations: [{ id: 'door', target: 'Door', kind: 'door', angle: -105, label: 'Door' }],
  }, () => ({}), () => {})
  const cleanup = bindFurnitureInteraction(canvas as unknown as HTMLCanvasElement, camera, root, motion)
  const click = () => {
    for (const [type, target] of [['pointerdown', canvas], ['pointerup', windowTarget]] as const) {
      const event = new Event(type)
      Object.assign(event, { pointerId: 1, clientX: 50, clientY: 50, button: 0 })
      target.dispatchEvent(event)
    }
  }
  try {
    click(); expect(motion.getStates()[0].open).toBe(false)
    blocker.visible = false; click(); expect(motion.getStates()[0].open).toBe(true)
    motion.setAll(false, true)
    door.visible = false; click(); expect(motion.getStates()[0].open).toBe(false)
    door.visible = true; cleanup(); click(); expect(motion.getStates()[0].open).toBe(false)
  } finally { cleanup(); motion.dispose(); geometry.dispose(); material.dispose(); vi.unstubAllGlobals() }
})
