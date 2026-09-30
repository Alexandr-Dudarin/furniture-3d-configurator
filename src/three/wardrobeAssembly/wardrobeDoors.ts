import { DOOR_BODY_GAP, DOOR_OPEN_ANGLE, DOOR_REVEAL, DOOR_THICKNESS, wardrobeDoorWidth } from '../../configurator/wardrobeAssembly/doors'
import { PLINTH_HEIGHT, type WardrobeSection } from '../../configurator/wardrobeAssembly/state'
import type { Part } from './wardrobeAssembly'
import { DRAWER_FACADE_PROFILE } from './drawerFacadeGeometry'
import type { FacadeVariants } from '../facades/types'

export const DOOR_FACADE_PROFILE: FacadeVariants = { ...DRAWER_FACADE_PROFILE,
  frame: { ...DRAWER_FACADE_PROFILE.frame, width: .05 },
}

// Overlay leaves: origin on the hinged front edge, local +Z faces the viewer.
// A full-height leaf includes the drawer block; the plinth stays exposed.
export function planWardrobeDoors(section: WardrobeSection, x: number, z: number): Part[] {
  if (!section.doors) return []
  const parts: Part[] = [], { doors, id } = section
  const width = wardrobeDoorWidth(section.width, doors.count)
  const height = section.height - PLINTH_HEIGHT - 2 * DOOR_REVEAL
  const y = (section.height + PLINTH_HEIGHT) / 2
  const sides: (-1 | 1)[] = doors.count === 2 ? [-1, 1] : [doors.hinge === 'left' ? -1 : 1]
  for (const side of sides) {
    const doorId = `${id}/Door_${side === -1 ? 'Left' : 'Right'}`
    const origin: [number, number, number] = [x + side * (section.width / 2 - DOOR_REVEAL), 0, z + section.depth / 2 + DOOR_BODY_GAP + DOOR_THICKNESS]
    const pivot = { origin, angle: side * DOOR_OPEN_ANGLE }
    const add = (suffix: string, size: Part['size'], position: Part['position'], slot: Part['slot'] = 'hardware') => {
      const part: Part = { sectionId: id, name: `${doorId}/${suffix}`, doorId, pivot, shape: 'panel', size, position, slot }
      parts.push(part); return part
    }
    const front = add('Front', [width, height, DOOR_THICKNESS], [-side * width / 2, y, -DOOR_THICKNESS / 2], 'door')
    if (doors.facadeStyle !== 'smooth') Object.assign(front, { shape: 'facade', facadeStyle: doors.facadeStyle })
    const handle = doors.handle
    if (handle !== 'none') {
      const faceScale = handle === 'knob' || handle === 'semicircle' ? 1.75 : 1
      const handleLength = handle === 'edge-pull' ? .17 : handle === 'profile' ? .33 : handle === 'long-bar' ? Math.min(.6, height - .12) : undefined
      const inset = handle === 'profile' ? 0 : handle === 'semicircle' || handle === 'edge-pull' ? .02 : handle === 'knob' ? .05 : .026
      const halfLength = (handleLength ?? (handle === 'classic' ? .178 : handle === 'flat-bar' ? .160 : .136)) / 2
      const handleY = Math.max(PLINTH_HEIGHT + DOOR_REVEAL + halfLength + .025, Math.min(section.height - DOOR_REVEAL - halfLength - .025, 1.05))
      const mountDepth = handle !== 'profile' && (doors.facadeStyle === 'fluted' || doors.facadeStyle === 'fluted-wide') ? .002 : 0
      Object.assign(add('Handle', [0, 0, 0], [-side * (width - inset), handleY, 0]),
        { shape: 'handle', handle, handleLength, faceScale, mountDepth, rotationZ: side * Math.PI / 2 })
    }
    const hinges = section.height > 2.2 ? 4 : section.height > 1.1 ? 3 : 2
    for (let i = 0; i < hinges; i++) {
      const hingeY = PLINTH_HEIGHT + .15 + (height - .3) * i / (hinges - 1)
      // Simplified hinge plates live over the side board, outside drawer travel.
      add(`HingeLeaf_${i + 1}`, [.014, .04, .002], [-side * .007, hingeY, -DOOR_THICKNESS - .001])
      parts.push({ sectionId: id, name: `${doorId}/HingeFixed_${i + 1}`, shape: 'panel', slot: 'hardware',
        size: [.014, .04, .002], position: [origin[0] - side * .007, hingeY, origin[2] - DOOR_THICKNESS - .003] })
    }
  }
  return parts
}
