import { ExtrudeGeometry, Shape } from 'three'
import { wardrobePlacement, type PointXZ, type CornerPlacement } from '../../configurator/wardrobeAssembly/arrangement'
import { automaticLayout, PANEL_THICKNESS as panel, BACK_THICKNESS as back, PLINTH_HEIGHT as plinth } from '../../configurator/wardrobeAssembly/layout'
import type { WardrobeAssemblyConfiguration } from '../../configurator/wardrobeAssembly/state'
import type { Part } from './wardrobeAssembly'

export function planCornerModule(config: WardrobeAssemblyConfiguration): Part[] {
  return wardrobePlacement(config).corners.flatMap(planCorner)
}
function planCorner(corner: CornerPlacement): Part[] {
  const { width: w, depth: d, depthA, depthB, sign, origin, height: h, id } = corner
  const parts: Part[] = []
  const world = (x: number, y: number, z: number): Part['position'] => [origin[0] + sign * x, y, origin[1] + z]
  const add = (name: string, size: Part['size'], position: Part['position'], rotationY = 0) => parts.push({ sectionId: id, name: `${id}/${name}`, shape: 'panel', slot: 'body', size, position, rotationY })
  add('Side_A', [panel, h, depthA], world(w - panel / 2, h / 2, depthA / 2))
  add('Side_B', [depthB - back, h, panel], world((depthB + back) / 2, h / 2, d - panel / 2))
  add('Back_A', [w - panel, h - plinth, back], world((w - panel) / 2, (h + plinth) / 2, back / 2))
  add('Back_B', [back, h - plinth, d - back], world(back / 2, (h + plinth) / 2, (d + back) / 2))
  const polygon: PointXZ[] = [[back, back], [w - panel, back], [w - panel, depthA - .002], [depthB - .002, d - panel], [back, d - panel]]
    .map(([x, z]) => [sign * (x - w / 2), z - d / 2])
  const board = (name: string, y: number) => parts.push({ sectionId: id, name: `${id}/${name}`, shape: 'corner-board', slot: 'body', size: [w, panel, d], polygon, position: world(w / 2, y, d / 2) })
  board('Top', h - panel / 2)
  board('Bottom', plinth + panel / 2)
  const ys = automaticLayout({ height: h, shelves: corner.shelves, rod: false }).shelves
  ys.forEach((y, i) => board(`Shelf_${i + 1}`, y + panel / 2))
  // Recess the plinth behind the diagonal opening, with no floating feet.
  const dx = w - panel - depthB, dz = depthA - (d - panel)
  add('Plinth', [Math.hypot(dx, dz), plinth, panel], world((w - panel + depthB) / 2 - .02, plinth / 2, (depthA + d - panel) / 2 - .02), Math.atan2(-dz, sign * dx))
  return parts
}
export function createCornerBoard(polygon: PointXZ[], thickness: number) {
  const shape = new Shape()
  polygon.forEach(([x, z], i) => i ? shape.lineTo(x, -z) : shape.moveTo(x, -z))
  shape.closePath()
  const geometry = new ExtrudeGeometry(shape, { depth: thickness, steps: 1, bevelEnabled: false, curveSegments: 1 })
  geometry.rotateX(-Math.PI / 2)
  geometry.translate(0, -thickness / 2, 0)
  return geometry
}
