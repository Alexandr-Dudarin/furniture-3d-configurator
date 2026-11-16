import type { PointXZ } from '../../configurator/wardrobeAssembly/arrangement'
import type { WardrobeDrawerFacade } from '../../configurator/wardrobeAssembly/drawerFacades'
import type { WardrobeDrawerHandle } from '../../configurator/wardrobeAssembly/drawerHandles'
import type { HardwareHandle } from '../../configurator/handles'

export type PartSlot = 'body' | 'facade' | 'hardware' | 'door'
export type Part = {
  sectionId: string
  name: string
  polygon?: PointXZ[]
  rotationY?: number
  shape: 'corner-board' | 'panel' | 'rod' | 'notched-front' | 'handle' | 'facade'
  facadeStyle?: Exclude<WardrobeDrawerFacade, 'smooth'>
  facadeHandle?: WardrobeDrawerHandle
  doorId?: string
  pivot?: { origin: [number, number, number]; angle: number }
  rotationZ?: number
  faceScale?: number
  handleLength?: number
  handle?: HardwareHandle | 'long-bar'
  mountDepth?: number
  size: [number, number, number]
  position: [number, number, number]
  slot: PartSlot
  drawerId?: string
  travel?: number
  axis?: 'x' | 'y' | 'z'
}
