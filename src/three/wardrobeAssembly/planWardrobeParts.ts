import { planCornerModule } from './cornerModule'
import { straightWardrobeBounds } from '../../configurator/wardrobeAssembly/arrangement'
import { planWardrobeDoors } from './wardrobeDoors'
import { drawerHandleMountDepth } from './drawerFacadeGeometry'
import {
  DRAWER_BAR_HANDLE,
  DRAWER_KNOB_HANDLE,
  getWardrobeDrawerHandle,
  TOP_GRIP_CUT,
  drawerBoxHeightReduction,
} from '../../configurator/wardrobeAssembly/drawerHandles'
import {
  BACK_THICKNESS as back,
  PANEL_THICKNESS as panel,
  PLINTH_HEIGHT as plinth,
  ROD_RADIUS,
  wardrobeSectionDrawerInset,
  wardrobeRodY,
  wardrobeShelfYs,
  type WardrobeAssemblyConfiguration,
} from '../../configurator/wardrobeAssembly/state'
import type { Part } from './parts'

// Separate, closed panels. All dimensions are physical metres, floor is y=0,
// back faces share z=-maxDepth/2. Adjacent sections retain both side boards.
export function planWardrobeParts(config: WardrobeAssemblyConfiguration): Part[] {
  const parts: Part[] = [],
    bounds = straightWardrobeBounds(config)
  let left = -bounds.width / 2
  for (const section of config.sections) {
    const { id, width: w, height: h, depth: d } = section
    const x = left + w / 2,
      z = (d - bounds.depth) / 2
    const add = (name: string, size: Part['size'], position: Part['position']) =>
      parts.push({
        sectionId: id,
        name: `${id}/${name}`,
        shape: 'panel',
        size,
        position: [position[0] + x, position[1], position[2] + z],
        slot: 'body',
      })
    const rod = (
      name: string,
      radius: number,
      length: number,
      position: Part['position'],
      axis: Part['axis'],
    ) =>
      parts.push({
        sectionId: id,
        name: `${id}/${name}`,
        shape: 'rod',
        size: [radius, length, radius],
        position: [position[0] + x, position[1], position[2] + z],
        slot: 'hardware',
        axis,
      })
    const inside = w - 2 * panel
    add('Side_Left', [panel, h, d], [-w / 2 + panel / 2, h / 2, 0])
    add('Side_Right', [panel, h, d], [w / 2 - panel / 2, h / 2, 0])
    add('Top', [inside, panel, d - back], [0, h - panel / 2, back / 2])
    add('Bottom', [inside, panel, d - back], [0, plinth + panel / 2, back / 2])
    add('Back', [inside, h - plinth - 2 * panel, back], [0, (h + plinth) / 2, -d / 2 + back / 2])
    add('Plinth', [inside, plinth, panel], [0, plinth / 2, d / 2 - 0.03 - panel / 2])
    const shelfYs = wardrobeShelfYs(section)
    for (const [index, y] of shelfYs.entries()) {
      add(`Shelf_${index + 1}`, [inside - 0.002, panel, d - back - 0.025], [0, y, (back - 0.025) / 2])
    }
    if (section.drawers) {
      const { count, height: row } = section.drawers
      const handle = getWardrobeDrawerHandle(section.drawers.handle)
      const mountDepth = drawerHandleMountDepth(section.drawers.facadeStyle, handle.value)
      const cut = handle.value === 'top-grip' ? TOP_GRIP_CUT : 0
      const wallHeight = row - 0.04 - drawerBoxHeightReduction(handle.value)
      const floor = plinth + panel
      add('Drawers_Lid', [inside, panel, d - back], [0, floor + count * row + panel / 2, back / 2])
      const frontFace = d / 2 - wardrobeSectionDrawerInset(section)
      const frontBack = frontFace - panel,
        boxBack = -d / 2 + back + 0.02
      const length = frontBack - boxBack,
        boxWidth = inside - 0.025
      for (let i = 0; i < count; i++) {
        const name = `Drawer_${i + 1}`,
          drawerId = `${id}/${name}`,
          y = floor + i * row
        const mark = () => {
          Object.assign(parts.at(-1)!, { drawerId, travel: length * 0.72 })
        }
        const board = (suffix: string, size: Part['size'], position: Part['position']) => {
          add(`${name}/${suffix}`, size, position)
          mark()
        }
        board(
          'Front',
          [inside - (section.doors ? 0.012 : 0.004), row - 0.004 - cut, panel],
          [0, y + (row - cut) / 2, frontBack + panel / 2],
        )
        parts.at(-1)!.slot = 'facade'
        if (handle.value === 'finger-notch') parts.at(-1)!.shape = 'notched-front'
        if (section.drawers.facadeStyle && section.drawers.facadeStyle !== 'smooth')
          Object.assign(parts.at(-1)!, {
            shape: 'facade',
            facadeStyle: section.drawers.facadeStyle,
            facadeHandle: handle.value,
          })
        // The front itself closes the box: sides and bottom end at its rear
        // surface. They travel together, without a floating decorative front.
        for (const side of [-1, 1]) {
          board(
            `Side_${side}`,
            [panel, wallHeight, length],
            [(side * (boxWidth - panel)) / 2, y + 0.012 + wallHeight / 2, (boxBack + frontBack) / 2],
          )
          add(
            `${name}/FixedSlide_${side}`,
            [0.008, 0.025, length],
            [side * (inside / 2 - 0.004), y + 0.065, (boxBack + frontBack) / 2],
          )
          parts.at(-1)!.slot = 'hardware'
          board(
            `MovingSlide_${side}`,
            [0.004, 0.025, length],
            [side * (boxWidth / 2 + 0.002), y + 0.065, (boxBack + frontBack) / 2],
          )
          parts.at(-1)!.slot = 'hardware'
        }
        board(
          'Back',
          [boxWidth - 2 * panel, wallHeight, panel],
          [0, y + 0.012 + wallHeight / 2, boxBack + panel / 2],
        )
        board(
          'Bottom',
          [boxWidth - 2 * panel, back, length - panel],
          [0, y + 0.012 + back / 2, (boxBack + panel + frontBack) / 2],
        )
        if (handle.value === 'bar') {
          const { radius, length, mountLength, mountSpacing } = DRAWER_BAR_HANDLE
          rod(`${name}/Handle`, radius, length, [0, y + row * 0.7, frontFace + mountLength + radius], 'x')
          mark()
          for (const side of [-1, 1]) {
            rod(
              `${name}/HandleMount_${side}`,
              radius,
              mountLength + mountDepth,
              [(side * mountSpacing) / 2, y + row * 0.7, frontFace + (mountLength - mountDepth) / 2],
              'z',
            )
            mark()
          }
        } else if (handle.value === 'knob') {
          const { radius, thickness, mountRadius, mountLength } = DRAWER_KNOB_HANDLE
          rod(
            `${name}/Handle`,
            radius,
            thickness,
            [0, y + row * 0.7, frontFace + mountLength + thickness / 2],
            'z',
          )
          mark()
          rod(
            `${name}/HandleMount`,
            mountRadius,
            mountLength + mountDepth,
            [0, y + row * 0.7, frontFace + (mountLength - mountDepth) / 2],
            'z',
          )
          mark()
        } else if (handle.projection > 0) {
          const edge = handle.value === 'profile'
          const handleY =
            handle.value === 'edge-pull' || handle.value === 'semicircle'
              ? y + row - 0.002 - (handle.value === 'semicircle' ? 0.03 : 0.035)
              : edge
                ? y + row - 0.002
                : y + row * 0.7
          board('Handle', [0, 0, 0], [0, handleY, frontFace])
          Object.assign(parts.at(-1)!, {
            shape: 'handle',
            handle: handle.value,
            mountDepth,
            slot: 'hardware',
          })
        }
      }
    }
    if (section.rod) {
      const y = wardrobeRodY(section)
      if (d >= 0.5) {
        rod('Rail', ROD_RADIUS, inside - 0.016, [0, y, 0], 'x')
        for (const side of [-1, 1])
          rod(`Socket_${side}`, 0.018, 0.008, [side * (inside / 2 - 0.004), y, 0], 'x')
      } else {
        const length = d - back - 0.07
        rod('Rail', ROD_RADIUS, length, [0, y, 0], 'z')
        const ceiling = shelfYs.length ? shelfYs[0] - panel / 2 : h - panel
        const supportLength = ceiling - y
        for (const side of [-1, 1])
          rod(`Bracket_${side}`, 0.007, supportLength, [0, y + supportLength / 2, (side * length) / 3], 'y')
      }
    }
    parts.push(...planWardrobeDoors(section, x, z))
    left += w
  }
  return [...parts, ...planCornerModule(config)]
}

// Finish IDs deliberately do not participate: material-only edits must keep
// the live geometry, motion groups and camera volume cache unchanged.
export function wardrobeGeometryKey(configuration: WardrobeAssemblyConfiguration) {
  const a = configuration.arrangement
  const geometryKey = JSON.stringify([
    a && [
      a.kind,
      a.side,
      a.split,
      a.corner.height,
      a.corner.shelves,
      a.kind === 'u' && [a.secondSplit, a.secondCorner.height, a.secondCorner.shelves],
    ],
    configuration.sections.map(({ id, width, height, depth, shelves, rod, layout, drawers, doors }) => [
      id,
      width,
      height,
      depth,
      shelves,
      rod,
      layout,
      drawers,
      doors && [doors.count, doors.hinge, doors.facadeStyle, doors.handle],
    ]),
  ])
  return geometryKey
}
