import type { MotionPartState } from '../../configurator/furnitureMotionStore'
import { createWardrobeDrawerMotion, type DrawerMotionEntry } from './wardrobeDrawerMotion'
import { BufferGeometry, CylinderGeometry, Group, Mesh, MeshStandardMaterial } from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { DRAWER_BAR_HANDLE, DRAWER_KNOB_HANDLE, getWardrobeDrawerHandle } from '../../configurator/wardrobeAssembly/drawerHandles'
import { BACK_THICKNESS as back, PANEL_THICKNESS as panel, PLINTH_HEIGHT as plinth, ROD_RADIUS, wardrobeBounds, wardrobeDrawerFrontInset, wardrobeRodY, wardrobeShelfYs, wardrobeSectionFinish, type WardrobeAssemblyConfiguration } from '../../configurator/wardrobeAssembly/state'
import { createFinishMaterial } from '../materials/createMaterial'
import { disposeMaterialResources } from '../materials/disposeMaterials'

type Slot = 'body' | 'hardware'
type Part = { sectionId: string; name: string; shape: 'panel' | 'rod'; size: [number, number, number]; position: [number, number, number]; slot: Slot; drawerId?: string; travel?: number; axis?: 'x' | 'y' | 'z' }

// Separate, closed panels. All dimensions are physical metres, floor is y=0,
// back faces share z=-maxDepth/2. Adjacent sections retain both side boards.
export function planWardrobeParts(config: WardrobeAssemblyConfiguration): Part[] {
  const parts: Part[] = [], bounds = wardrobeBounds(config)
  let left = -bounds.width / 2
  for (const section of config.sections) {
    const { id, width: w, height: h, depth: d } = section
    const x = left + w / 2, z = (d - bounds.depth) / 2
    const add = (name: string, size: Part['size'], position: Part['position']) => parts.push({ sectionId: id, name: `${id}/${name}`, shape: 'panel', size, position: [position[0] + x, position[1], position[2] + z], slot: 'body' })
    const rod = (name: string, radius: number, length: number, position: Part['position'], axis: Part['axis']) => parts.push({ sectionId: id, name: `${id}/${name}`, shape: 'rod', size: [radius, length, radius], position: [position[0] + x, position[1], position[2] + z], slot: 'hardware', axis })
    const inside = w - 2 * panel
    add('Side_Left', [panel, h, d], [-w / 2 + panel / 2, h / 2, 0])
    add('Side_Right', [panel, h, d], [w / 2 - panel / 2, h / 2, 0])
    add('Top', [inside, panel, d - back], [0, h - panel / 2, back / 2])
    add('Bottom', [inside, panel, d - back], [0, plinth + panel / 2, back / 2])
    add('Back', [inside, h - plinth - 2 * panel, back], [0, (h + plinth) / 2, -d / 2 + back / 2])
    add('Plinth', [inside, plinth, panel], [0, plinth / 2, d / 2 - .03 - panel / 2])
    const shelfYs = wardrobeShelfYs(section)
    for (const [index, y] of shelfYs.entries()) {
      add(`Shelf_${index + 1}`, [inside - .002, panel, d - back - .025], [0, y, (back - .025) / 2])
    }
    if (section.drawers) {
      const { count, height: row } = section.drawers
      const floor = plinth + panel
      add('Drawers_Lid', [inside, panel, d - back], [0, floor + count * row + panel / 2, back / 2])
      const frontFace = d / 2 - wardrobeDrawerFrontInset(section.drawers)
      const frontBack = frontFace - panel, boxBack = -d / 2 + back + .02
      const length = frontBack - boxBack, boxWidth = inside - .025
      for (let i = 0; i < count; i++) {
        const name = `Drawer_${i + 1}`, drawerId = `${id}/${name}`, y = floor + i * row
        const mark = () => { Object.assign(parts.at(-1)!, { drawerId, travel: length * .72 }) }
        const board = (suffix: string, size: Part['size'], position: Part['position']) => { add(`${name}/${suffix}`, size, position); mark() }
        board('Front', [inside - .004, row - .004, panel], [0, y + row / 2, frontBack + panel / 2])
        // The front itself closes the box: sides and bottom end at its rear
        // surface. They travel together, without a floating decorative front.
        for (const side of [-1, 1]) {
          board(`Side_${side}`, [panel, row - .04, length], [side * (boxWidth - panel) / 2, y + .012 + (row - .04) / 2, (boxBack + frontBack) / 2])
          add(`${name}/FixedSlide_${side}`, [.008, .025, length], [side * (inside / 2 - .004), y + .065, (boxBack + frontBack) / 2])
          parts.at(-1)!.slot = 'hardware'
          board(`MovingSlide_${side}`, [.004, .025, length], [side * (boxWidth / 2 + .002), y + .065, (boxBack + frontBack) / 2])
          parts.at(-1)!.slot = 'hardware'
        }
        board('Back', [boxWidth - 2 * panel, row - .04, panel], [0, y + .012 + (row - .04) / 2, boxBack + panel / 2])
        board('Bottom', [boxWidth - 2 * panel, back, length - panel], [0, y + .012 + back / 2, (boxBack + panel + frontBack) / 2])
        const handle = getWardrobeDrawerHandle(section.drawers.handle)
        if (handle.value === 'bar') {
          const { radius, length, mountLength, mountSpacing } = DRAWER_BAR_HANDLE
          rod(`${name}/Handle`, radius, length, [0, y + row * .7, frontFace + mountLength + radius], 'x'); mark()
          for (const side of [-1, 1]) {
            rod(`${name}/HandleMount_${side}`, radius, mountLength, [side * mountSpacing / 2, y + row * .7, frontFace + mountLength / 2], 'z'); mark()
          }
        } else if (handle.value === 'knob') {
          const { radius, thickness, mountRadius, mountLength } = DRAWER_KNOB_HANDLE
          rod(`${name}/Handle`, radius, thickness, [0, y + row * .7, frontFace + mountLength + thickness / 2], 'z'); mark()
          rod(`${name}/HandleMount`, mountRadius, mountLength, [0, y + row * .7, frontFace + mountLength / 2], 'z'); mark()
        }
      }
    }
    if (section.rod) {
      const y = wardrobeRodY(section)
      if (d >= .5) {
        rod('Rail', ROD_RADIUS, inside - .016, [0, y, 0], 'x')
        for (const side of [-1, 1]) rod(`Socket_${side}`, .018, .008, [side * (inside / 2 - .004), y, 0], 'x')
      } else {
        const length = d - back - .07
        rod('Rail', ROD_RADIUS, length, [0, y, 0], 'z')
        const ceiling = shelfYs.length ? shelfYs[0] - panel / 2 : h - panel
        const supportLength = ceiling - y
        for (const side of [-1, 1]) rod(`Bracket_${side}`, .007, supportLength, [0, y + supportLength / 2, side * length / 3], 'y')
      }
    }
    left += w
  }
  return parts
}

function panelGeometry(size: Part['size']) {
  const geometry = new RoundedBoxGeometry(...size, 2, .00075)
  const position = geometry.getAttribute('position'), normal = geometry.getAttribute('normal'), uv = geometry.getAttribute('uv')
  // Metric UVs: wood grain runs up the sides/back and along horizontal boards.
  // Material maps remain the same 2K PBR assets; resizing never stretches a tile.
  for (let i = 0; i < position.count; i++) {
    const nx = Math.abs(normal.getX(i)), ny = Math.abs(normal.getY(i)), nz = Math.abs(normal.getZ(i))
    const x = position.getX(i) + size[0] / 2, y = position.getY(i) + size[1] / 2, z = position.getZ(i) + size[2] / 2
    if (ny >= nx && ny >= nz) uv.setXY(i, z, x)
    else if (nx >= nz) uv.setXY(i, z, y)
    else uv.setXY(i, x, y)
  }
  uv.needsUpdate = true
  geometry.computeBoundingBox()
  geometry.computeBoundingSphere()
  return geometry
}

export function createWardrobeAssembly(initial: WardrobeAssemblyConfiguration, options: {
  maxAnisotropy?: number
  createMaterial?: typeof createFinishMaterial
  onChange?: () => void
  onMotionChange?: (parts: MotionPartState[]) => void
} = {}) {
  const group = new Group()
  group.name = 'WardrobeAssembly_Root'
  const motion = createWardrobeDrawerMotion(group, parts => { options.onMotionChange?.(parts); options.onChange?.() })
  const drawerGroups = new Map<string, Group>()
  let disposed = false, request = 0
  const fallback: Record<Slot, MeshStandardMaterial> = { body: new MeshStandardMaterial({ color: 0xcdbb9d, roughness: .65 }), hardware: new MeshStandardMaterial({ color: 0x16191c, roughness: .35 }) }
  // One owned PBR material per finish actually used, shared across sections.
  const materials = new Map<string, MeshStandardMaterial>()
  let bindings = new Map<string, string>()
  const bindingKey = (sectionId: string, slot: Slot) => `${sectionId}/${slot}`
  const appliedMaterial = (sectionId: string, slot: Slot) => materials.get(bindings.get(bindingKey(sectionId, slot)) ?? '') ?? fallback[slot]
  const meshes = new Map<string, Mesh<BufferGeometry, MeshStandardMaterial>>()
  let geometries = new Map<string, BufferGeometry>()
  let previousGeometryKey = ''
  const update = (configuration: WardrobeAssemblyConfiguration) => {
    const geometryKey = JSON.stringify(configuration.sections.map(({ id, width, height, depth, shelves, rod, layout, drawers }) => [id, width, height, depth, shelves, rod, layout, drawers]))
    if (disposed || geometryKey === previousGeometryKey) return
    const nextGeometry = new Map<string, BufferGeometry>(), keep = new Set<string>()
    const moving = new Map<string, DrawerMotionEntry>()
    for (const part of planWardrobeParts(configuration)) {
      const key = `${part.shape}:${part.size.join(',')}`
      let geometry = nextGeometry.get(key) ?? geometries.get(key)
      if (!geometry) geometry = part.shape === 'panel' ? panelGeometry(part.size) : new CylinderGeometry(part.size[0], part.size[0], part.size[1], 16)
      nextGeometry.set(key, geometry)
      let mesh = meshes.get(part.name)
      if (!mesh) {
        mesh = new Mesh(geometry, appliedMaterial(part.sectionId, part.slot)); mesh.name = part.name
        mesh.castShadow = mesh.receiveShadow = true
        meshes.set(part.name, mesh)
      }
      let parent = group
      if (part.drawerId) {
        let drawer = drawerGroups.get(part.drawerId)
        if (!drawer) { drawer = new Group(); drawer.name = part.drawerId; drawerGroups.set(part.drawerId, drawer); group.add(drawer) }
        parent = drawer
        moving.set(part.drawerId, { id: part.drawerId, node: drawer, travel: part.travel! })
      }
      if (mesh.parent !== parent) parent.add(mesh)
      mesh.userData.materialSlot = part.slot
      mesh.userData.sectionId = part.sectionId
      mesh.geometry = geometry; mesh.material = appliedMaterial(part.sectionId, part.slot)
      mesh.position.set(...part.position)
      mesh.rotation.set(part.axis === 'z' ? Math.PI / 2 : 0, 0, part.axis === 'x' ? Math.PI / 2 : 0)
      keep.add(part.name)
    }
    for (const [name, mesh] of meshes) if (!keep.has(name)) { mesh.removeFromParent(); meshes.delete(name) }
    for (const [id, drawer] of drawerGroups) if (!moving.has(id)) { drawer.removeFromParent(); drawerGroups.delete(id) }
    motion.sync([...moving.values()])
    for (const [key, geometry] of geometries) if (!nextGeometry.has(key)) geometry.dispose()
    geometries = nextGeometry
    previousGeometryKey = geometryKey
    group.updateMatrixWorld(true)
    options.onChange?.()
  }
  const setFinishes = async (configuration: WardrobeAssemblyConfiguration) => {
    const ticket = ++request
    if (disposed) return
    const selected = new Map<string, string>()
    for (const section of configuration.sections) {
      selected.set(bindingKey(section.id, 'body'), wardrobeSectionFinish(configuration, section, 'bodyFinish'))
      if (section.rod || section.drawers) selected.set(bindingKey(section.id, 'hardware'), wardrobeSectionFinish(configuration, section, 'hardwareFinish'))
    }
    if (selected.size === bindings.size && [...selected].every(([key, id]) => bindings.get(key) === id)) return
    const needed = new Set(selected.values())
    const missing = [...needed].filter(id => !materials.has(id))
    const prepared = await Promise.allSettled(missing.map(async id => ({ id, value: await (options.createMaterial ?? createFinishMaterial)(id, options.maxAnisotropy ?? 1) })))
    const failure = prepared.find(result => result.status === 'rejected')
    if (disposed || ticket !== request || failure) {
      for (const result of prepared) if (result.status === 'fulfilled') disposeMaterialResources(result.value.value)
      if (!disposed && ticket === request && failure?.status === 'rejected') throw failure.reason
      return
    }
    for (const result of prepared) if (result.status === 'fulfilled') materials.set(result.value.id, result.value.value)
    bindings = selected
    for (const mesh of meshes.values()) mesh.material = appliedMaterial(mesh.userData.sectionId, mesh.userData.materialSlot)
    // Release after rebinding all meshes; another section may still use the old finish.
    for (const [id, value] of materials) if (!needed.has(id)) {
      disposeMaterialResources(value)
      materials.delete(id)
    }
    options.onChange?.()
  }
  update(initial)
  return { group, motion, update, setFinishes, dispose() {
    if (disposed) return
    disposed = true; request++
    motion.dispose(); drawerGroups.clear()
    geometries.forEach(geometry => geometry.dispose()); geometries.clear()
    materials.forEach(disposeMaterialResources); materials.clear()
    disposeMaterialResources(fallback.body); disposeMaterialResources(fallback.hardware)
    meshes.clear(); group.clear()
  } }
}
export type WardrobeAssembly = ReturnType<typeof createWardrobeAssembly>
