import { BufferGeometry, CylinderGeometry, Mesh, type MeshStandardMaterial } from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { PANEL_THICKNESS as panel } from '../../configurator/wardrobeAssembly/layout'
import { createCornerBoard } from './cornerModule'
import { DOOR_FACADE_PROFILE } from './wardrobeDoors'
import { createDrawerFacadeGeometry, DRAWER_FACADE_PROFILE } from './drawerFacadeGeometry'
import { createFacadeGeometry, flutingFilterProfile } from '../facades/facadeGeometry'
import { prepareReliefGeometry, RELIEF_ATTRIBUTE } from '../facades/reliefFilter'
import { createHandleGeometry, createNotchedFront } from '../handles/handleGeometry'
import type { Part } from './parts'

function panelGeometry(size: Part['size']) {
  const geometry = new RoundedBoxGeometry(...size, 2, 0.00075)
  return metricPanelUV(geometry, size)
}
function metricPanelUV(geometry: BufferGeometry, size: Part['size']) {
  const position = geometry.getAttribute('position'),
    normal = geometry.getAttribute('normal'),
    uv = geometry.getAttribute('uv')
  // Metric UVs: wood grain runs up the sides/back and along horizontal boards.
  // Material maps remain the same 2K PBR assets; resizing never stretches a tile.
  for (let i = 0; i < position.count; i++) {
    const nx = Math.abs(normal.getX(i)),
      ny = Math.abs(normal.getY(i)),
      nz = Math.abs(normal.getZ(i))
    const x = position.getX(i) + size[0] / 2,
      y = position.getY(i) + size[1] / 2,
      z = position.getZ(i) + size[2] / 2
    if (ny >= nx && ny >= nz) uv.setXY(i, z, x)
    else if (nx >= nz) uv.setXY(i, z, y)
    else uv.setXY(i, x, y)
  }
  uv.needsUpdate = true
  geometry.computeBoundingBox()
  geometry.computeBoundingSphere()
  return geometry
}

function createPartGeometry(part: Part) {
  switch (part.shape) {
    case 'corner-board':
      return metricPanelUV(createCornerBoard(part.polygon!, part.size[1]), part.size)
    case 'facade':
      return part.doorId
        ? createFacadeGeometry(...part.size, part.facadeStyle!, DOOR_FACADE_PROFILE, {
            frameField: 'flush',
          })
        : createDrawerFacadeGeometry(...part.size, part.facadeStyle!, part.facadeHandle)
    case 'panel':
      return panelGeometry(part.size)
    case 'notched-front':
      return metricPanelUV(createNotchedFront(...part.size), part.size)
    case 'handle':
      return createHandleGeometry(
        part.handle!,
        part.handleLength,
        panel,
        part.faceScale ?? 1,
        part.mountDepth,
      )
    default:
      return new CylinderGeometry(part.size[0], part.size[0], part.size[1], 16)
  }
}

// A geometry is owned once by the assembly and shared by all matching parts.
// Retire old geometries only after meshes and motion have adopted the next plan.
export function createGeometryResources(preparationMaterial: MeshStandardMaterial) {
  let geometries = new Map<string, BufferGeometry>()
  return {
    beginUpdate() {
      const nextGeometry = new Map<string, BufferGeometry>()
      return {
        get(part: Part) {
          const key = `${part.shape}:${part.handle ?? ''}:${part.handleLength ?? ''}:${part.faceScale ?? 1}:${part.doorId ? 'door' : ''}:${part.mountDepth ?? 0}:${part.facadeStyle ?? ''}:${part.facadeHandle === 'finger-notch' ? 'notch' : ''}:${part.size.join(',')}:${JSON.stringify(part.polygon ?? '')}`
          const geometry = nextGeometry.get(key) ?? geometries.get(key) ?? createPartGeometry(part)
          if (
            (part.facadeStyle === 'fluted' || part.facadeStyle === 'fluted-wide') &&
            !geometry.hasAttribute(RELIEF_ATTRIBUTE)
          ) {
            // Prepare once in PANEL coordinates, not at the section's world offset.
            prepareReliefGeometry(
              new Mesh(geometry, preparationMaterial),
              ...part.size,
              part.facadeHandle === 'finger-notch' ? 0 : DRAWER_FACADE_PROFILE.bevel,
              {
                ...flutingFilterProfile(
                  part.doorId ? DOOR_FACADE_PROFILE : DRAWER_FACADE_PROFILE,
                  part.facadeStyle,
                ),
                vertical: true,
              },
            )
          }
          if (!geometry.boundingBox) geometry.computeBoundingBox()
          nextGeometry.set(key, geometry)
          return geometry
        },
        commit() {
          for (const [key, geometry] of geometries) if (!nextGeometry.has(key)) geometry.dispose()
          geometries = nextGeometry
        },
      }
    },
    dispose() {
      geometries.forEach((geometry) => geometry.dispose())
      geometries.clear()
    },
  }
}
