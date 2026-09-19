// Переразвёртка существующего GLB без изменения геометрии, иерархии и размеров.
// Запуск из корня проекта: node assets/source/table-02-u-frame/update_table_02_uv.mjs
// Повторный запуск безопасен: UV каждый раз вычисляются из координат вершин.
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { Accessor, NodeIO } from '@gltf-transform/core'
import { BufferGeometry, Float32BufferAttribute } from 'three'

const sourceDir = path.dirname(fileURLToPath(import.meta.url))
const defaultPath = path.resolve(sourceDir, '../../../public/models/table-02-u-frame.glb')
const inputPath = process.argv[2] || defaultPath
const outputPath = process.argv[3] || inputPath
const io = new NodeIO()
const document = await io.read(inputPath)
const root = document.getRoot()
const node = root.listNodes().find(candidate => candidate.getName() === 'TableTop')
if (!node?.getMesh()) throw new Error('Expected TableTop mesh')
const mesh = node.getMesh()
const original = [...mesh.listPrimitives()]
const template = root.listMaterials().find(material => material.getName() === 'Top_Primary')
if (!template) throw new Error('Expected Top_Primary material')
const names = ['Top_Primary', 'Top_Bottom', 'Top_Edge_Long', 'Top_Edge_Short']
const partitions = names.map(() => ({ positions: [], normals: [], uvs: [] }))

for (const primitive of original) {
  const positions = primitive.getAttribute('POSITION')
  const normals = primitive.getAttribute('NORMAL')
  const indices = primitive.getIndices()
  if (!positions || !normals || primitive.getMode() !== 4) throw new Error('Expected triangle positions and normals')
  const count = indices?.getCount() ?? positions.getCount()
  for (let index = 0; index < count; index += 3) {
    const vertices = [0, 1, 2].map(offset => {
      const vertex = indices ? indices.getScalar(index + offset) : index + offset
      return { p: positions.getElement(vertex, []), n: normals.getElement(vertex, []) }
    })
    const average = [0, 1, 2].map(axis => vertices.reduce((sum, v) => sum + v.n[axis], 0))
    const length = Math.hypot(...average) || 1
    const surface = average[1] / length > 0.9995 ? 0
      : average[1] / length < -0.9995 ? 1
        : Math.abs(average[2]) >= Math.abs(average[0]) ? 2 : 3
    for (const { p: [x, y, z], n } of vertices) {
      partitions[surface].positions.push(x, y, z)
      partitions[surface].normals.push(...n)
      // 1 UV-единица = 1 метр. Торцы используют реальную толщину, не V=0..1.
      partitions[surface].uvs.push(...(surface === 0 ? [x + 0.5, z + 0.5]
        : surface === 1 ? [x + 0.5, 0.5 - z]
          : surface === 2 ? [x + 0.5, y + 0.5] : [z + 0.5, y + 0.5]))
    }
  }
}

const buffer = root.listBuffers()[0]
for (let surface = 0; surface < names.length; surface++) {
  const name = names[surface]
  const data = partitions[surface]
  if (!data.positions.length) throw new Error(`Empty surface: ${name}`)
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(data.positions, 3))
  geometry.setAttribute('normal', new Float32BufferAttribute(data.normals, 3))
  geometry.setAttribute('uv', new Float32BufferAttribute(data.uvs, 2))
  geometry.setIndex(Array.from({ length: data.positions.length / 3 }, (_, index) => index))
  geometry.computeTangents()
  const material = root.listMaterials().find(candidate => candidate.getName() === name)
    || template.clone().setName(name)
  material.setExtras({ ...template.getExtras(), replaceableFinishGroup: 'PrimaryTop' })
  const primitive = document.createPrimitive().setMaterial(material)
  for (const [semantic, attribute, type] of [
    ['POSITION', 'position', Accessor.Type.VEC3],
    ['NORMAL', 'normal', Accessor.Type.VEC3],
    ['TEXCOORD_0', 'uv', Accessor.Type.VEC2],
    ['TANGENT', 'tangent', Accessor.Type.VEC4],
  ]) {
    primitive.setAttribute(semantic, document.createAccessor(`${name}_${semantic}`, buffer)
      .setType(type).setArray(new Float32Array(geometry.getAttribute(attribute).array)))
  }
  mesh.addPrimitive(primitive)
  geometry.dispose()
}

const oldAccessors = new Set(original.flatMap(primitive => [
  ...primitive.listAttributes(), primitive.getIndices(),
].filter(Boolean)))
for (const primitive of original) {
  mesh.removePrimitive(primitive)
  primitive.dispose()
}
const used = new Set(root.listMeshes().flatMap(item => item.listPrimitives()).flatMap(primitive => [
  ...primitive.listAttributes(), primitive.getIndices(),
]))
for (const accessor of oldAccessors) if (!used.has(accessor)) accessor.dispose()
node.setExtras({ ...node.getExtras(), semanticSurfaces: names, tabletopUvMeters: 1 })
await io.write(outputPath, document)
console.log(`Updated tabletop UV: ${outputPath}`)
