import { Box3, Vector3, type Group, type Mesh } from 'three'
import type { CornerPlacement } from '../../configurator/wardrobeAssembly/arrangement'

type CameraVolume = { local: Box3; world: Box3; node: Group }

// Local filled volumes are rebuilt on geometry edits. World boxes are reused
// while the camera reads them, following doors, drawers and section transforms.
export function createWardrobeCameraObstacles(group: Group) {
  let cameraVolumes: CameraVolume[] = []
  let cameraBoxes: Box3[] = []
  return {
    beginUpdate() {
      const volumes = new Map<string, CameraVolume>()
      return {
        add(id: string, mesh: Mesh, parent: Group) {
          let volume = volumes.get(id)
          if (!volume) {
            volume = { local: new Box3(), world: new Box3(), node: parent }
            volumes.set(id, volume)
          }
          // Include empty cabinet interiors and the moving drawer grips.
          volume.local.union(mesh.geometry.boundingBox!.clone().applyMatrix4(mesh.matrix))
        },
        commit(corners: CornerPlacement[]) {
          for (const corner of corners) {
            // Filled corner volume follows the diagonal entrance, not its enclosing
            // rectangle. Conservative 5 cm strips leave the room accessible.
            volumes.delete(corner.id)
            const { width, depth, depthB, sign, origin, height } = corner
            const strips = Math.ceil((width - depthB) / 0.05)
            const addVolume = (id: number, x0: number, x1: number, z1: number) => {
              const xa = origin[0] + sign * x0,
                xb = origin[0] + sign * x1
              volumes.set(`${corner.id}/volume-${id}`, {
                node: group,
                local: new Box3(
                  new Vector3(Math.min(xa, xb), 0, origin[1]),
                  new Vector3(Math.max(xa, xb), height, origin[1] + z1),
                ),
                world: new Box3(),
              })
            }
            addVolume(0, 0, depthB, depth)
            for (let i = 0; i < strips; i++) {
              const x0 = depthB + ((width - depthB) * i) / strips,
                x1 = depthB + ((width - depthB) * (i + 1)) / strips
              addVolume(i + 1, x0, x1, depth - (x0 - depthB))
            }
          }
          cameraVolumes = [...volumes.values()]
          cameraBoxes = cameraVolumes.map((v) => v.world)
        },
      }
    },
    getBoxes() {
      for (const volume of cameraVolumes) {
        volume.node.updateWorldMatrix(true, false)
        volume.world.copy(volume.local).applyMatrix4(volume.node.matrixWorld)
      }
      return cameraBoxes
    },
    dispose() {
      cameraVolumes = []
      cameraBoxes = []
    },
  }
}
