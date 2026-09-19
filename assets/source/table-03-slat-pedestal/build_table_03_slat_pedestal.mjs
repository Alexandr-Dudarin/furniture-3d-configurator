import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

import {
  Accessor,
  Document,
  NodeIO,
} from '@gltf-transform/core'
import {
  BufferGeometry,
  Float32BufferAttribute,
} from 'three'
import {
  RoundedBoxGeometry,
} from 'three/addons/geometries/RoundedBoxGeometry.js'
import {
  mergeVertices,
} from 'three/addons/utils/BufferGeometryUtils.js'

const SOURCE_DIR = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(SOURCE_DIR, '../../..')
const TEXTURE_DIR = path.join(SOURCE_DIR, 'textures')
const OUTPUT_PATH = path.join(PROJECT_ROOT, 'public/models/table-03-slat-pedestal.glb')

const TOP_LENGTH = 1.2
const TOP_WIDTH = 0.75
const TOP_THICKNESS = 0.022
// Единый физический масштаб с V-Pedestal: один тайл на метр.
const TABLETOP_TEXTURE_METERS = 1

const document = new Document()
const buffer = document.createBuffer('Table03_Buffer')
const scene = document.createScene('Table03_Scene')

const textures = {
  albedo: await loadTexture('Oak_Albedo', 'oak-albedo.png'),
  normal: await loadTexture('Oak_Normal', 'oak-normal.png'),
  metallicRoughness: await loadTexture('Oak_MetallicRoughness', 'oak-metallic-roughness.png'),
}

const materials = {
  top: createWoodMaterial('Wood_Top', 'PrimaryTop'),
  bottom: createWoodMaterial('Wood_Bottom', 'PrimaryTop'),
  longEdge: createWoodMaterial('Wood_Edge_Long', 'PrimaryTop'),
  shortEdge: createWoodMaterial('Wood_Edge_Short', 'PrimaryTop'),
  slats: createWoodMaterial('Wood_Slats', 'PedestalWood'),
  plinth: createWoodMaterial('Wood_Plinth', 'PedestalWood'),
  pedestal: document
    .createMaterial('Dark_Pedestal')
    .setBaseColorFactor([0.035, 0.041, 0.045, 1])
    .setMetallicFactor(0.02)
    .setRoughnessFactor(0.34)
    .setExtras({
      previewFinish: 'charcoal-black',
    }),
}

const root = document
  .createNode('SlatPedestalTable_Root')
  .setExtras({
    modelId: 'table-03-slat-pedestal',
    assetType: 'constructor-ready',
    unit: 'meter',
    frontDirection: '+Z',
  })

scene.addChild(root)

addPartitionedTableTop({
  name: 'TableTop',
  geometry: new RoundedBoxGeometry(
    TOP_LENGTH,
    TOP_THICKNESS,
    TOP_WIDTH,
    4,
    0.004,
  ),
  translation: [0, 0.739, 0],
  extras: {
    runtimeBehavior: 'scale',
    lengthLocalAxis: 'x',
    widthLocalAxis: 'z',
    semanticSurfaces: [
      'Wood_Top',
      'Wood_Bottom',
      'Wood_Edge_Long',
      'Wood_Edge_Short',
    ],
  },
})

addMesh({
  name: 'Base_Plinth',
  geometry: new RoundedBoxGeometry(0.62, 0.035, 0.46, 5, 0.012),
  material: materials.plinth,
  translation: [0, 0.0175, 0],
  extras: { runtimeBehavior: 'fixed' },
})

addMesh({
  name: 'Pedestal_Core',
  geometry: new RoundedBoxGeometry(0.37, 0.675, 0.34, 3, 0.006),
  material: materials.pedestal,
  translation: [0, 0.3785, 0],
  extras: { runtimeBehavior: 'fixed' },
})

addMesh({
  name: 'Pedestal_TopPlate',
  geometry: new RoundedBoxGeometry(0.48, 0.018, 0.40, 3, 0.004),
  material: materials.pedestal,
  translation: [0, 0.719, 0],
  extras: { runtimeBehavior: 'fixed' },
})

const slatXs = [-0.144, -0.096, -0.048, 0, 0.048, 0.096, 0.144]

for (const side of [
  { label: 'Front', z: 0.181 },
  { label: 'Back', z: -0.181 },
]) {
  const group = document
    .createNode(`Pedestal_Slats_${side.label}`)
    .setExtras({ runtimeBehavior: 'fixed' })

  root.addChild(group)

  slatXs.forEach((x, index) => {
    addMesh({
      name: `Slat_${side.label}_${String(index + 1).padStart(2, '0')}`,
      geometry: new RoundedBoxGeometry(0.024, 0.63, 0.022, 3, 0.003),
      material: materials.slats,
      translation: [x, 0.388, side.z],
      extras: { runtimeBehavior: 'fixed' },
      parent: group,
    })
  })
}

const glb = await new NodeIO().writeBinary(document)
await writeFile(OUTPUT_PATH, glb)
console.log(`Wrote ${OUTPUT_PATH} (${glb.byteLength} bytes)`)

function createWoodMaterial(name, replaceableFinishGroup) {
  const extras = {
    previewFinish: 'natural-oak',
  }

  if (replaceableFinishGroup) {
    extras.replaceableFinishGroup = replaceableFinishGroup
  }

  return document
    .createMaterial(name)
    .setBaseColorFactor([1, 1, 1, 1])
    .setBaseColorTexture(textures.albedo)
    .setNormalTexture(textures.normal)
    .setMetallicFactor(0)
    .setRoughnessFactor(1)
    .setMetallicRoughnessTexture(textures.metallicRoughness)
    .setExtras(extras)
}

async function loadTexture(name, filename) {
  return document
    .createTexture(name)
    .setImage(new Uint8Array(await readFile(path.join(TEXTURE_DIR, filename))))
    .setMimeType('image/png')
}

function addPartitionedTableTop({
  name,
  geometry,
  translation,
  extras,
}) {
  const partitions = partitionTableTopGeometry(geometry)
  const mesh = document.createMesh(`${name}_Mesh`)

  for (const [surface, surfaceGeometry] of Object.entries(partitions)) {
    addPrimitive({
      mesh,
      name: `${name}_${surface}`,
      geometry: surfaceGeometry,
      material: materials[surface],
    })
  }

  const node = document
    .createNode(name)
    .setMesh(mesh)
    .setTranslation(translation)
    .setExtras(extras)

  root.addChild(node)
  geometry.dispose()
  return node
}

function partitionTableTopGeometry(geometry) {
  const source = geometry.index
    ? geometry.toNonIndexed()
    : geometry.clone()
  const position = source.getAttribute('position')
  const normal = source.getAttribute('normal')
  const partitions = {
    top: createPartitionData(),
    bottom: createPartitionData(),
    longEdge: createPartitionData(),
    shortEdge: createPartitionData(),
  }

  for (let index = 0; index < position.count; index += 3) {
    const averageNormal = [0, 0, 0]

    for (let offset = 0; offset < 3; offset += 1) {
      averageNormal[0] += normal.getX(index + offset)
      averageNormal[1] += normal.getY(index + offset)
      averageNormal[2] += normal.getZ(index + offset)
    }

    const surface = classifyTableTopSurface(averageNormal)
    const target = partitions[surface]

    for (let offset = 0; offset < 3; offset += 1) {
      const vertexIndex = index + offset
      const vertex = [
        position.getX(vertexIndex),
        position.getY(vertexIndex),
        position.getZ(vertexIndex),
      ]

      target.positions.push(...vertex)
      target.normals.push(
        normal.getX(vertexIndex),
        normal.getY(vertexIndex),
        normal.getZ(vertexIndex),
      )
      target.uvs.push(...tableTopUv(surface, vertex))
    }
  }

  source.dispose()

  return Object.fromEntries(
    Object.entries(partitions).map(([surface, data]) => [
      surface,
      geometryFromPartition(data),
    ]),
  )
}

function createPartitionData() {
  return {
    positions: [],
    normals: [],
    uvs: [],
  }
}

function classifyTableTopSurface([normalX, normalY, normalZ]) {
  const length = Math.hypot(normalX, normalY, normalZ) || 1
  const x = normalX / length
  const y = normalY / length
  const z = normalZ / length

  if (y > 0.9995) {
    return 'top'
  }

  if (y < -0.9995) {
    return 'bottom'
  }

  return Math.abs(z) >= Math.abs(x)
    ? 'longEdge'
    : 'shortEdge'
}

function tableTopUv(surface, [x, y, z]) {
  if (surface === 'top') {
    return [
      x / TABLETOP_TEXTURE_METERS + 0.5,
      z / TABLETOP_TEXTURE_METERS + 0.5,
    ]
  }

  if (surface === 'bottom') {
    return [
      x / TABLETOP_TEXTURE_METERS + 0.5,
      0.5 - z / TABLETOP_TEXTURE_METERS,
    ]
  }

  if (surface === 'longEdge') {
    return [
      x / TABLETOP_TEXTURE_METERS + 0.5,
      y / TABLETOP_TEXTURE_METERS + 0.5,
    ]
  }

  return [
    z / TABLETOP_TEXTURE_METERS + 0.5,
    y / TABLETOP_TEXTURE_METERS + 0.5,
  ]
}

function geometryFromPartition(data) {
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(data.positions, 3))
  geometry.setAttribute('normal', new Float32BufferAttribute(data.normals, 3))
  geometry.setAttribute('uv', new Float32BufferAttribute(data.uvs, 2))

  const vertexCount = data.positions.length / 3
  geometry.setIndex(
    Array.from(
      { length: vertexCount },
      (_, index) => index,
    ),
  )
  geometry.computeTangents()
  return geometry
}

function addMesh({
  name,
  geometry,
  material,
  translation = [0, 0, 0],
  rotation = [0, 0, 0, 1],
  extras = {},
  parent = root,
}) {
  const hasTexture = Boolean(material.getBaseColorTexture())

  if (hasTexture && !geometry.index) {
    geometry = mergeVertices(geometry)
  }

  if (hasTexture) {
    geometry.computeTangents()
  }

  const mesh = document.createMesh(`${name}_Mesh`)

  addPrimitive({
    mesh,
    name,
    geometry,
    material,
  })

  const node = document
    .createNode(name)
    .setMesh(mesh)
    .setTranslation(translation)
    .setRotation(rotation)
    .setExtras(extras)

  parent.addChild(node)
  return node
}

function addPrimitive({
  mesh,
  name,
  geometry,
  material,
}) {
  const position = document
    .createAccessor(`${name}_Position`, buffer)
    .setType(Accessor.Type.VEC3)
    .setArray(copyFloat32(geometry.getAttribute('position').array))

  const normal = document
    .createAccessor(`${name}_Normal`, buffer)
    .setType(Accessor.Type.VEC3)
    .setArray(copyFloat32(geometry.getAttribute('normal').array))

  const primitive = document
    .createPrimitive()
    .setAttribute('POSITION', position)
    .setAttribute('NORMAL', normal)
    .setMaterial(material)

  if (material.getBaseColorTexture()) {
    const uv = document
      .createAccessor(`${name}_UV`, buffer)
      .setType(Accessor.Type.VEC2)
      .setArray(copyFloat32(geometry.getAttribute('uv').array))

    const tangent = document
      .createAccessor(`${name}_Tangent`, buffer)
      .setType(Accessor.Type.VEC4)
      .setArray(copyFloat32(geometry.getAttribute('tangent').array))

    primitive
      .setAttribute('TEXCOORD_0', uv)
      .setAttribute('TANGENT', tangent)
  }

  if (geometry.index) {
    const IndexArray = geometry.index.array.constructor
    const indices = document
      .createAccessor(`${name}_Indices`, buffer)
      .setType(Accessor.Type.SCALAR)
      .setArray(new IndexArray(geometry.index.array))

    primitive.setIndices(indices)
  }

  mesh.addPrimitive(primitive)
  geometry.dispose()
}

function copyFloat32(array) {
  return new Float32Array(array)
}
