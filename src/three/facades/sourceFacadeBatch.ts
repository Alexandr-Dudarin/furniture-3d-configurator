import { BufferGeometry, Material, Matrix4, Mesh, MeshStandardMaterial, type Object3D, type Texture } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

/** Batch an explicitly opted-in, segmented panel without altering its source
 * nodes. The resize controller still owns those nodes. Textured finishes keep
 * the original UV bindings and rendering path; never merge incompatible UVs. */
export function createSourceFacadeBatch(node: Object3D, children: readonly Object3D[]) {
  if (children.length < 2 || children.some(child => !(child instanceof Mesh) || child.children.length)) return null
  const sources = children as Mesh[]
  if (sources.some(mesh => !mesh.visible || mesh.type !== 'Mesh' ||
    Object.keys(mesh.geometry.morphAttributes).length || mesh.geometry.drawRange.start !== 0 ||
    mesh.geometry.drawRange.count !== Infinity)) return null
  const mesh = new Mesh(new BufferGeometry(), sources[0].material)
  mesh.name = `${node.name}__SourceBatch`
  mesh.visible = false
  node.add(mesh)
  let matrices: Matrix4[] = []
  let inputs: BufferGeometry[] = []
  let active = false
  const release = () => {
    if (mesh.geometry.getAttribute('position')) {
      mesh.geometry.dispose(); mesh.geometry = new BufferGeometry()
    }
    matrices = []; inputs = []
  }

  const signature = (material: Material | Material[]) => {
    if (!(material instanceof MeshStandardMaterial) || material.type !== 'MeshStandardMaterial' ||
      material.transparent || material.clippingPlanes?.length ||
      material.onBeforeCompile !== Material.prototype.onBeforeCompile ||
      Object.values(material).some(value => (value as Texture | null)?.isTexture)) return null
    // The asset's per-segment names/IDs differ; actual shading must be equal.
    const data: Record<string, unknown> = { ...material.toJSON() }
    delete data.uuid; delete data.name; delete data.userData; delete data.metadata
    return JSON.stringify(data)
  }

  return {
    refresh(source: boolean) {
      // FacadeController has already selected source/alternate visibility.
      // Do not reveal source panels while another facade style is selected.
      mesh.visible = false
      active = source
      if (!source) { release(); return }
      sources.forEach(part => { part.visible = true })
      // Share the source material: material replacement/disposal has one owner.
      mesh.material = sources[0].material
      const key = signature(mesh.material)
      if (key === null || sources.some(part => signature(part.material) !== key ||
        part.castShadow !== sources[0].castShadow || part.receiveShadow !== sources[0].receiveShadow ||
        part.layers.mask !== sources[0].layers.mask || part.renderOrder !== sources[0].renderOrder)) { release(); return }

      sources.forEach(part => { if (part.matrixAutoUpdate) part.updateMatrix() })
      if (sources.some(part => part.matrix.determinant() <= 0)) { release(); return }
      if (sources.some((part, i) => inputs[i] !== part.geometry || !matrices[i]?.equals(part.matrix))) {
        const copies: BufferGeometry[] = []
        let merged: BufferGeometry | null
        try {
          for (const part of sources) copies.push(part.geometry.clone().applyMatrix4(part.matrix))
          merged = mergeGeometries(copies)
        } finally { copies.forEach(geometry => geometry.dispose()) }
        if (!merged) return
        merged.computeBoundingBox(); merged.computeBoundingSphere()
        mesh.geometry.dispose(); mesh.geometry = merged
        matrices = sources.map(part => part.matrix.clone())
        inputs = sources.map(part => part.geometry)
      }
      mesh.castShadow = sources[0].castShadow; mesh.receiveShadow = sources[0].receiveShadow
      mesh.layers.mask = sources[0].layers.mask; mesh.renderOrder = sources[0].renderOrder
      sources.forEach(part => { part.visible = false })
      mesh.visible = true
    },
    refreshMaterials() { this.refresh(active) },
  }
}
