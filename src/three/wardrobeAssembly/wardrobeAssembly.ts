import { planCornerModule, createCornerBoard } from './cornerModule'
import { wardrobePlacement, straightWardrobeBounds, type PointXZ } from '../../configurator/wardrobeAssembly/arrangement'
import { limitDoorSwing } from './doorClearance'
import { planWardrobeDoors, DOOR_FACADE_PROFILE } from './wardrobeDoors'
import { createDrawerFacadeGeometry, DRAWER_FACADE_PROFILE, drawerHandleMountDepth } from './drawerFacadeGeometry'
import { createFacadeGeometry, flutingFilterProfile } from '../facades/facadeGeometry'
import { createReliefFilter, prepareReliefGeometry, RELIEF_ATTRIBUTE } from '../facades/reliefFilter'
import type { WardrobeDrawerFacade } from '../../configurator/wardrobeAssembly/drawerFacades'
import type { WardrobeDrawerHandle } from '../../configurator/wardrobeAssembly/drawerHandles'
import type { MotionPartState } from '../../configurator/furnitureMotionStore'
import { createWardrobeDrawerMotion, type DrawerMotionEntry } from './wardrobeDrawerMotion'
import { Box3, Vector3, BufferGeometry, CylinderGeometry, Group, Mesh, MeshStandardMaterial } from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { createHandleGeometry, createNotchedFront } from '../handles/handleGeometry'
import type { HardwareHandle } from '../../configurator/handles'
import { DRAWER_BAR_HANDLE, DRAWER_KNOB_HANDLE, getWardrobeDrawerHandle, TOP_GRIP_CUT, drawerBoxHeightReduction } from '../../configurator/wardrobeAssembly/drawerHandles'
import { BACK_THICKNESS as back, PANEL_THICKNESS as panel, PLINTH_HEIGHT as plinth, ROD_RADIUS, wardrobeSectionDrawerInset, wardrobeRodY, wardrobeShelfYs, wardrobeSectionFinish, type WardrobeAssemblyConfiguration } from '../../configurator/wardrobeAssembly/state'
import { createFinishMaterial } from '../materials/createMaterial'
import { disposeMaterialResources } from '../materials/disposeMaterials'

type Slot = 'body' | 'facade' | 'hardware' | 'door'
export type Part = { sectionId: string; name: string; polygon?: PointXZ[]; rotationY?: number; shape: 'corner-board' | 'panel' | 'rod' | 'notched-front' | 'handle' | 'facade'; facadeStyle?: Exclude<WardrobeDrawerFacade, 'smooth'>; facadeHandle?: WardrobeDrawerHandle; doorId?: string; pivot?: { origin: [number, number, number]; angle: number }; rotationZ?: number; faceScale?: number; handleLength?: number; handle?: HardwareHandle | 'long-bar'; mountDepth?: number; size: [number, number, number]; position: [number, number, number]; slot: Slot; drawerId?: string; travel?: number; axis?: 'x' | 'y' | 'z' }

// Separate, closed panels. All dimensions are physical metres, floor is y=0,
// back faces share z=-maxDepth/2. Adjacent sections retain both side boards.
export function planWardrobeParts(config: WardrobeAssemblyConfiguration): Part[] {
  const parts: Part[] = [], bounds = straightWardrobeBounds(config)
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
      const handle = getWardrobeDrawerHandle(section.drawers.handle)
      const mountDepth = drawerHandleMountDepth(section.drawers.facadeStyle, handle.value)
      const cut = handle.value === 'top-grip' ? TOP_GRIP_CUT : 0
      const wallHeight = row - .04 - drawerBoxHeightReduction(handle.value)
      const floor = plinth + panel
      add('Drawers_Lid', [inside, panel, d - back], [0, floor + count * row + panel / 2, back / 2])
      const frontFace = d / 2 - wardrobeSectionDrawerInset(section)
      const frontBack = frontFace - panel, boxBack = -d / 2 + back + .02
      const length = frontBack - boxBack, boxWidth = inside - .025
      for (let i = 0; i < count; i++) {
        const name = `Drawer_${i + 1}`, drawerId = `${id}/${name}`, y = floor + i * row
        const mark = () => { Object.assign(parts.at(-1)!, { drawerId, travel: length * .72 }) }
        const board = (suffix: string, size: Part['size'], position: Part['position']) => { add(`${name}/${suffix}`, size, position); mark() }
        board('Front', [inside - (section.doors ? .012 : .004), row - .004 - cut, panel], [0, y + (row - cut) / 2, frontBack + panel / 2])
        parts.at(-1)!.slot = 'facade'
        if (handle.value === 'finger-notch') parts.at(-1)!.shape = 'notched-front'
        if (section.drawers.facadeStyle && section.drawers.facadeStyle !== 'smooth') Object.assign(parts.at(-1)!, {
          shape: 'facade', facadeStyle: section.drawers.facadeStyle, facadeHandle: handle.value,
        })
        // The front itself closes the box: sides and bottom end at its rear
        // surface. They travel together, without a floating decorative front.
        for (const side of [-1, 1]) {
          board(`Side_${side}`, [panel, wallHeight, length], [side * (boxWidth - panel) / 2, y + .012 + wallHeight / 2, (boxBack + frontBack) / 2])
          add(`${name}/FixedSlide_${side}`, [.008, .025, length], [side * (inside / 2 - .004), y + .065, (boxBack + frontBack) / 2])
          parts.at(-1)!.slot = 'hardware'
          board(`MovingSlide_${side}`, [.004, .025, length], [side * (boxWidth / 2 + .002), y + .065, (boxBack + frontBack) / 2])
          parts.at(-1)!.slot = 'hardware'
        }
        board('Back', [boxWidth - 2 * panel, wallHeight, panel], [0, y + .012 + wallHeight / 2, boxBack + panel / 2])
        board('Bottom', [boxWidth - 2 * panel, back, length - panel], [0, y + .012 + back / 2, (boxBack + panel + frontBack) / 2])
        if (handle.value === 'bar') {
          const { radius, length, mountLength, mountSpacing } = DRAWER_BAR_HANDLE
          rod(`${name}/Handle`, radius, length, [0, y + row * .7, frontFace + mountLength + radius], 'x'); mark()
          for (const side of [-1, 1]) {
            rod(`${name}/HandleMount_${side}`, radius, mountLength + mountDepth, [side * mountSpacing / 2, y + row * .7, frontFace + (mountLength - mountDepth) / 2], 'z'); mark()
          }
        } else if (handle.value === 'knob') {
          const { radius, thickness, mountRadius, mountLength } = DRAWER_KNOB_HANDLE
          rod(`${name}/Handle`, radius, thickness, [0, y + row * .7, frontFace + mountLength + thickness / 2], 'z'); mark()
          rod(`${name}/HandleMount`, mountRadius, mountLength + mountDepth, [0, y + row * .7, frontFace + (mountLength - mountDepth) / 2], 'z'); mark()
        } else if (handle.projection > 0) {
          const edge = handle.value === 'profile'
          const handleY = handle.value === 'edge-pull' || handle.value === 'semicircle' ? y + row - .002 - (handle.value === 'semicircle' ? .030 : .035) : edge ? y + row - .002 : y + row * .7
          board('Handle', [0, 0, 0], [0, handleY, frontFace])
          Object.assign(parts.at(-1)!, { shape: 'handle', handle: handle.value, mountDepth, slot: 'hardware' })
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
    parts.push(...planWardrobeDoors(section, x, z))
    left += w
  }
  return [...parts, ...planCornerModule(config)]
}

function panelGeometry(size: Part['size']) {
  const geometry = new RoundedBoxGeometry(...size, 2, .00075)
  return metricPanelUV(geometry, size)
}
function metricPanelUV(geometry: BufferGeometry, size: Part['size']) {
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
  const sectionGroups = new Map<string, Group>()
  const relief = createReliefFilter()
  let disposed = false, request = 0
  const fallback: Record<Slot, MeshStandardMaterial> = { body: new MeshStandardMaterial({ color: 0xcdbb9d, roughness: .65 }), facade: new MeshStandardMaterial({ color: 0x626563, roughness: .65 }), hardware: new MeshStandardMaterial({ color: 0x16191c, roughness: .35 }), door: new MeshStandardMaterial({ color: 0x626563, roughness: .65 }) }
  // One owned PBR material per finish actually used, shared across sections.
  const materials = new Map<string, MeshStandardMaterial>()
  let bindings = new Map<string, string>()
  const bindingKey = (sectionId: string, slot: Slot) => `${sectionId}/${slot}`
  const appliedMaterial = (sectionId: string, slot: Slot) => materials.get(bindings.get(bindingKey(sectionId, slot)) ?? '') ?? fallback[slot]
  const meshes = new Map<string, Mesh<BufferGeometry, MeshStandardMaterial>>()
  let geometries = new Map<string, BufferGeometry>()
  let cameraVolumes: { local: Box3; world: Box3; node: Group }[] = []
  let cameraBoxes: Box3[] = []
  let previousGeometryKey = ''
  const update = (configuration: WardrobeAssemblyConfiguration) => {
    const a = configuration.arrangement
    const geometryKey = JSON.stringify([a && [a.kind, a.side, a.split, a.corner.height, a.corner.shelves, a.kind === 'u' && [a.secondSplit, a.secondCorner.height, a.secondCorner.shelves]], configuration.sections.map(({ id, width, height, depth, shelves, rod, layout, drawers, doors }) => [id, width, height, depth, shelves, rod, layout, drawers, doors && [doors.count, doors.hinge, doors.facadeStyle, doors.handle]])])
    if (disposed || geometryKey === previousGeometryKey) return
    // Keep existing part coordinates and IDs; only the owning section rotates.
    // Straight assemblies retain their original flat hierarchy.
    const placements = wardrobePlacement(configuration)
    const row = straightWardrobeBounds(configuration)
    let oldLeft = -row.width / 2
    for (const placement of placements.sections) {
      if (configuration.arrangement) {
        let parent = sectionGroups.get(placement.id)
        if (!parent) { parent = new Group(); parent.name = `Placement/${placement.id}`; sectionGroups.set(placement.id, parent); group.add(parent) }
        const oldX = oldLeft + placement.width / 2, oldZ = (placement.depth - row.depth) / 2
        const c = Math.cos(placement.yaw), s = Math.sin(placement.yaw)
        parent.position.set(placement.x - oldX * c - oldZ * s, 0, placement.z + oldX * s - oldZ * c)
        parent.rotation.y = placement.yaw
        parent.updateMatrix()
      }
      oldLeft += placement.width
    }
    const nextGeometry = new Map<string, BufferGeometry>(), keep = new Set<string>()
    const moving = new Map<string, DrawerMotionEntry>()
    const volumes = new Map<string, { local: Box3; world: Box3; node: Group }>()
    for (const part of planWardrobeParts(configuration)) {
      const key = `${part.shape}:${part.handle ?? ''}:${part.handleLength ?? ''}:${part.faceScale ?? 1}:${part.doorId ? 'door' : ''}:${part.mountDepth ?? 0}:${part.facadeStyle ?? ''}:${part.facadeHandle === 'finger-notch' ? 'notch' : ''}:${part.size.join(',')}:${JSON.stringify(part.polygon ?? '')}`
      let geometry = nextGeometry.get(key) ?? geometries.get(key)
      if (!geometry) geometry = part.shape === 'corner-board' ? metricPanelUV(createCornerBoard(part.polygon!, part.size[1]), part.size) : part.shape === 'facade' ? (part.doorId ? createFacadeGeometry(...part.size, part.facadeStyle!, DOOR_FACADE_PROFILE, { frameField: 'flush' }) : createDrawerFacadeGeometry(...part.size, part.facadeStyle!, part.facadeHandle))
        : part.shape === 'panel' ? panelGeometry(part.size)
        : part.shape === 'notched-front' ? metricPanelUV(createNotchedFront(...part.size), part.size)
        : part.shape === 'handle' ? createHandleGeometry(part.handle!, part.handleLength, panel, part.faceScale ?? 1, part.mountDepth)
        : new CylinderGeometry(part.size[0], part.size[0], part.size[1], 16)
      if ((part.facadeStyle === 'fluted' || part.facadeStyle === 'fluted-wide') && !geometry.hasAttribute(RELIEF_ATTRIBUTE)) {
        // Prepare once in PANEL coordinates, not at the section's world offset.
        prepareReliefGeometry(new Mesh(geometry, fallback.body), ...part.size,
          part.facadeHandle === 'finger-notch' ? 0 : DRAWER_FACADE_PROFILE.bevel,
          { ...flutingFilterProfile(part.doorId ? DOOR_FACADE_PROFILE : DRAWER_FACADE_PROFILE, part.facadeStyle), vertical: true })
      }
      if (!geometry.boundingBox) geometry.computeBoundingBox()
      nextGeometry.set(key, geometry)
      let mesh = meshes.get(part.name)
      if (!mesh) {
        mesh = new Mesh(geometry, appliedMaterial(part.sectionId, part.slot)); mesh.name = part.name
        mesh.castShadow = mesh.receiveShadow = true
        meshes.set(part.name, mesh)
      }
      let parent = configuration.arrangement ? sectionGroups.get(part.sectionId) ?? group : group
      const motionId = part.doorId ?? part.drawerId
      if (motionId) {
        let drawer = drawerGroups.get(motionId)
        if (!drawer) { drawer = new Group(); drawer.name = motionId; drawerGroups.set(motionId, drawer) }
        if (drawer.parent !== parent) parent.add(drawer)
        parent = drawer
        moving.set(motionId, { id: motionId, node: drawer, travel: part.travel ?? 0, pivot: part.pivot })
      }
      if (mesh.parent !== parent) parent.add(mesh)
      mesh.userData.materialSlot = part.slot
      mesh.userData.sectionId = part.sectionId
      mesh.geometry = geometry; mesh.material = appliedMaterial(part.sectionId, part.slot)
      if (geometry.hasAttribute(RELIEF_ATTRIBUTE)) relief.attach(mesh)
      mesh.position.set(...part.position)
      mesh.rotation.set(part.axis === 'z' ? Math.PI / 2 : 0, part.rotationY ?? 0, part.rotationZ ?? (part.axis === 'x' ? Math.PI / 2 : 0))
      mesh.updateMatrix()
      const volumeId = motionId ?? part.sectionId
      let volume = volumes.get(volumeId)
      if (!volume) { volume = { local: new Box3(), world: new Box3(), node: parent }; volumes.set(volumeId, volume) }
      // Section bounds include their empty interior; drawer bounds include
      // the grip and move with the drawer. Calculate only when geometry edits.
      volume.local.union(geometry.boundingBox!.clone().applyMatrix4(mesh.matrix))
      keep.add(part.name)
    }
    for (const [name, mesh] of meshes) if (!keep.has(name)) { mesh.removeFromParent(); meshes.delete(name) }
    for (const [id, drawer] of drawerGroups) if (!moving.has(id)) { drawer.removeFromParent(); drawerGroups.delete(id) }
    for (const [id, parent] of sectionGroups) if (!configuration.arrangement || !configuration.sections.some(s => s.id === id)) { parent.removeFromParent(); sectionGroups.delete(id) }
    group.updateMatrixWorld(true)
    const entries = [...moving.values()]
    limitDoorSwing(entries, configuration)
    motion.sync(entries)
    for (const [key, geometry] of geometries) if (!nextGeometry.has(key)) geometry.dispose()
    geometries = nextGeometry
    for (const corner of placements.corners) {
      // Filled corner volume follows the diagonal entrance, not its enclosing
      // rectangle. Conservative 5 cm strips leave the room accessible.
      volumes.delete(corner.id)
      const { width, depth, depthB, sign, origin, height } = corner
      const strips = Math.ceil((width - depthB) / .05)
      const addVolume = (id: number, x0: number, x1: number, z1: number) => {
        const xa = origin[0] + sign * x0, xb = origin[0] + sign * x1
        volumes.set(`${corner.id}/volume-${id}`, { node: group, local: new Box3(new Vector3(Math.min(xa, xb), 0, origin[1]), new Vector3(Math.max(xa, xb), height, origin[1] + z1)), world: new Box3() })
      }
      addVolume(0, 0, depthB, depth)
      for (let i = 0; i < strips; i++) {
        const x0 = depthB + (width - depthB) * i / strips, x1 = depthB + (width - depthB) * (i + 1) / strips
        addVolume(i + 1, x0, x1, depth - (x0 - depthB))
      }
    }
    cameraVolumes = [...volumes.values()]; cameraBoxes = cameraVolumes.map(v => v.world)
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
      if (section.drawers) selected.set(bindingKey(section.id, 'facade'), wardrobeSectionFinish(configuration, section, 'facadeFinish'))
      if (section.doors) selected.set(bindingKey(section.id, 'door'), section.doors.finish ?? wardrobeSectionFinish(configuration, section, 'facadeFinish'))
      if (section.rod || section.drawers || section.doors) selected.set(bindingKey(section.id, 'hardware'), wardrobeSectionFinish(configuration, section, 'hardwareFinish'))
    }
    for (const corner of wardrobePlacement(configuration).corners) selected.set(bindingKey(corner.id, 'body'), corner.bodyFinish ?? configuration.bodyFinish)
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
    for (const mesh of meshes.values()) {
      mesh.material = appliedMaterial(mesh.userData.sectionId, mesh.userData.materialSlot)
      if (mesh.geometry.hasAttribute(RELIEF_ATTRIBUTE)) relief.attach(mesh)
    }
    // Release after rebinding all meshes; another section may still use the old finish.
    for (const [id, value] of materials) if (!needed.has(id)) {
      disposeMaterialResources(value)
      materials.delete(id)
    }
    options.onChange?.()
  }
  update(initial)
  return { group, motion, update, setFinishes,
    getCameraObstacles() {
      for (const volume of cameraVolumes) {
        volume.node.updateWorldMatrix(true, false)
        volume.world.copy(volume.local).applyMatrix4(volume.node.matrixWorld)
      }
      return cameraBoxes
    },
    dispose() {
    if (disposed) return
    disposed = true; request++
    motion.dispose(); drawerGroups.clear(); sectionGroups.clear(); relief.dispose()
    geometries.forEach(geometry => geometry.dispose()); geometries.clear()
    materials.forEach(disposeMaterialResources); materials.clear()
    Object.values(fallback).forEach(disposeMaterialResources)
    meshes.clear(); group.clear()
    cameraVolumes = []; cameraBoxes = []
  } }
}
export type WardrobeAssembly = ReturnType<typeof createWardrobeAssembly>
