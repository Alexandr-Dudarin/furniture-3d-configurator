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
  Quaternion,
  Vector3,
} from 'three'
import {
  RoundedBoxGeometry,
} from 'three/addons/geometries/RoundedBoxGeometry.js'

const SOURCE_DIR = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(SOURCE_DIR, '../../..')
const TEXTURE_DIR = path.join(SOURCE_DIR, 'textures')
const OUTPUT_PATH = path.join(PROJECT_ROOT, 'public/models/table-04-v-pedestal.glb')

// The beam end planes are deliberately embedded into the fixed plates. This
// keeps all four joints closed after beveling without adding a runtime fit rule.
const LOWER_SUPPORT_ANCHOR_Y = 0.020
const UPPER_SUPPORT_ANCHOR_Y = 0.731
const TABLETOP_TEXTURE_METERS = 1

const document = new Document()
const buffer = document.createBuffer('Table04_Buffer')
const scene = document.createScene('Table04_Scene')

const textures = {
  albedo: await loadTexture('BlackMarble_Albedo', 'black-marble-albedo.png'),
  normal: await loadTexture('BlackMarble_Normal', 'black-marble-normal.png'),
  metallicRoughness: await loadTexture('BlackMarble_MetallicRoughness', 'black-marble-metallic-roughness.png'),
}

const stoneMaterialNames = [
  'Stone_Top_Center',
  'Stone_Bottom_Center',
  'Stone_Top_LongSegment',
  'Stone_Bottom_LongSegment',
  'Stone_Top_ShortSegment',
  'Stone_Bottom_ShortSegment',
  'Stone_Top_Corner',
  'Stone_Bottom_Corner',
  'Stone_Edge_Long',
  'Stone_Edge_Short',
  'Stone_Edge_Corner',
]

const stoneMaterials = Object.fromEntries(
  stoneMaterialNames.map((name) => [name, createStoneMaterial(name)]),
)

const frameMaterial = document
  .createMaterial('Metal_Support')
  .setBaseColorFactor([0.012, 0.014, 0.017, 1])
  .setMetallicFactor(0.04)
  .setRoughnessFactor(0.28)
  .setExtras({
    replaceableFinishGroup: 'FrameMetal',
    previewFinish: 'powder-coated-black',
  })

const baseMaterial = document
  .createMaterial('Metal_Base')
  .setBaseColorFactor([0.012, 0.014, 0.017, 1])
  .setMetallicFactor(0.04)
  .setRoughnessFactor(0.28)
  .setExtras({
    replaceableFinishGroup: 'FrameMetal',
    previewFinish: 'powder-coated-black',
  })

const root = document
  .createNode('VPedestalTable_Root')
  .setExtras({
    modelId: 'table-04-v-pedestal',
    assetType: 'constructor-ready',
    unit: 'meter',
    frontDirection: '+Z',
  })

scene.addChild(root)

createNineSliceTop()

const supportFrame = document
  .createNode('Support_Frame')
  .setExtras({ runtimeBehavior: 'fixed' })

root.addChild(supportFrame)

addMesh({
  name: 'Base_Plinth',
  geometry: new RoundedBoxGeometry(0.72, 0.035, 0.50, 5, 0.018),
  material: baseMaterial,
  translation: [0, 0.0175, 0],
  extras: { runtimeBehavior: 'fixed' },
})

addMesh({
  name: 'UnderTop_Mount',
  geometry: new RoundedBoxGeometry(0.82, 0.025, 0.56, 3, 0.005),
  material: frameMaterial,
  translation: [0, 0.7305, 0],
  extras: { runtimeBehavior: 'fixed' },
  parent: supportFrame,
})

for (const z of [0.20, -0.20]) {
  addBeam(
    'Support_Left',
    [-0.13, LOWER_SUPPORT_ANCHOR_Y, z],
    [-0.38, UPPER_SUPPORT_ANCHOR_Y, z],
    z > 0 ? 'Front' : 'Back',
  )
  addBeam(
    'Support_Right',
    [0.13, LOWER_SUPPORT_ANCHOR_Y, z],
    [0.38, UPPER_SUPPORT_ANCHOR_Y, z],
    z > 0 ? 'Front' : 'Back',
  )
}

const glb = await new NodeIO().writeBinary(document)
await writeFile(OUTPUT_PATH, glb)
console.log(`Wrote ${OUTPUT_PATH} (${glb.byteLength} bytes)`)

function createNineSliceTop() {
  const length = 1.2
  const width = 0.8
  const thickness = 0.017
  const radius = 0.025
  const y = 0.7515
  const centerLength = length - radius * 2
  const centerWidth = width - radius * 2

  addSurfaceMesh({
    name: 'Top_Center',
    surfaces: createRectangularSegmentSurfaces({
      sizeX: centerLength,
      sizeZ: centerWidth,
      thickness,
      textureCenterX: 0,
      textureCenterZ: 0,
      topMaterial: stoneMaterials.Stone_Top_Center,
      bottomMaterial: stoneMaterials.Stone_Bottom_Center,
    }),
    translation: [0, y, 0],
    extras: {
      runtimeBehavior: 'stretch-segment',
      lengthLocalAxis: 'x',
      lengthBaseLength: centerLength,
      widthLocalAxis: 'z',
      widthBaseLength: centerWidth,
      semanticSurfaceRole: 'center',
    },
  })

  for (const side of [
    { name: 'Front', z: width / 2 - radius / 2, factor: 0.5, outerFace: 'front' },
    { name: 'Back', z: -(width / 2 - radius / 2), factor: -0.5, outerFace: 'back' },
  ]) {
    addSurfaceMesh({
      name: `Top_Edge_${side.name}`,
      surfaces: createRectangularSegmentSurfaces({
        sizeX: centerLength,
        sizeZ: radius,
        thickness,
        textureCenterX: 0,
        textureCenterZ: side.z,
        topMaterial: stoneMaterials.Stone_Top_LongSegment,
        bottomMaterial: stoneMaterials.Stone_Bottom_LongSegment,
        edgeMaterial: stoneMaterials.Stone_Edge_Long,
        outerFace: side.outerFace,
      }),
      translation: [0, y, side.z],
      extras: {
        runtimeBehavior: 'stretch-segment+delta-move',
        stretchDimension: 'length',
        stretchLocalAxis: 'x',
        baseLength: centerLength,
        moveDimension: 'width',
        moveLocalAxis: 'z',
        moveFactor: side.factor,
        semanticSurfaceRole: 'long-segment',
      },
    })
  }

  for (const side of [
    { name: 'Left', x: -(length / 2 - radius / 2), factor: -0.5, outerFace: 'left' },
    { name: 'Right', x: length / 2 - radius / 2, factor: 0.5, outerFace: 'right' },
  ]) {
    addSurfaceMesh({
      name: `Top_Edge_${side.name}`,
      surfaces: createRectangularSegmentSurfaces({
        sizeX: radius,
        sizeZ: centerWidth,
        thickness,
        textureCenterX: side.x,
        textureCenterZ: 0,
        topMaterial: stoneMaterials.Stone_Top_ShortSegment,
        bottomMaterial: stoneMaterials.Stone_Bottom_ShortSegment,
        edgeMaterial: stoneMaterials.Stone_Edge_Short,
        outerFace: side.outerFace,
      }),
      translation: [side.x, y, 0],
      extras: {
        runtimeBehavior: 'stretch-segment+delta-move',
        stretchDimension: 'width',
        stretchLocalAxis: 'z',
        baseLength: centerWidth,
        moveDimension: 'length',
        moveLocalAxis: 'x',
        moveFactor: side.factor,
        semanticSurfaceRole: 'short-segment',
      },
    })
  }

  const cornerSpecs = [
    { name: 'FrontRight', x: 1, z: 1 },
    { name: 'BackRight', x: 1, z: -1 },
    { name: 'BackLeft', x: -1, z: -1 },
    { name: 'FrontLeft', x: -1, z: 1 },
  ]

  for (const corner of cornerSpecs) {
    addSurfaceMesh({
      name: `Top_Corner_${corner.name}`,
      surfaces: createQuarterCornerSurfaces({
        radius,
        thickness,
        signX: corner.x,
        signZ: corner.z,
        textureCenterX: corner.x * (length / 2 - radius),
        textureCenterZ: corner.z * (width / 2 - radius),
        topMaterial: stoneMaterials.Stone_Top_Corner,
        bottomMaterial: stoneMaterials.Stone_Bottom_Corner,
        edgeMaterial: stoneMaterials.Stone_Edge_Corner,
      }),
      translation: [
        corner.x * (length / 2 - radius),
        y,
        corner.z * (width / 2 - radius),
      ],
      extras: {
        runtimeBehavior: 'delta-move',
        lengthLocalAxis: 'x',
        lengthFactor: corner.x * 0.5,
        widthLocalAxis: 'z',
        widthFactor: corner.z * 0.5,
        semanticSurfaceRole: 'fixed-corner',
      },
    })
  }
}

function createRectangularSegmentSurfaces({
  sizeX,
  sizeZ,
  thickness,
  textureCenterX,
  textureCenterZ,
  topMaterial,
  bottomMaterial,
  edgeMaterial,
  outerFace,
}) {
  const halfX = sizeX / 2
  const halfZ = sizeZ / 2
  const halfY = thickness / 2
  const topUv = ([x, , z]) => [
    (x + textureCenterX) / TABLETOP_TEXTURE_METERS + 0.5,
    (z + textureCenterZ) / TABLETOP_TEXTURE_METERS + 0.5,
  ]

  const surfaces = [
    {
      name: 'TopSurface',
      material: topMaterial,
      geometry: createQuadGeometry(
        [
          [-halfX, halfY, -halfZ],
          [-halfX, halfY, halfZ],
          [halfX, halfY, halfZ],
          [halfX, halfY, -halfZ],
        ],
        [0, 1, 0],
        topUv,
      ),
    },
    {
      name: 'BottomSurface',
      material: bottomMaterial,
      geometry: createQuadGeometry(
        [
          [-halfX, -halfY, -halfZ],
          [halfX, -halfY, -halfZ],
          [halfX, -halfY, halfZ],
          [-halfX, -halfY, halfZ],
        ],
        [0, -1, 0],
        topUv,
      ),
    },
  ]

  if (!outerFace || !edgeMaterial) {
    return surfaces
  }

  const edgeSpecs = {
    front: {
      vertices: [
        [-halfX, -halfY, halfZ],
        [halfX, -halfY, halfZ],
        [halfX, halfY, halfZ],
        [-halfX, halfY, halfZ],
      ],
      normal: [0, 0, 1],
      uv: ([x, y]) => [
        (x + textureCenterX) / TABLETOP_TEXTURE_METERS + 0.5,
        y / TABLETOP_TEXTURE_METERS + 0.5,
      ],
    },
    back: {
      vertices: [
        [halfX, -halfY, -halfZ],
        [-halfX, -halfY, -halfZ],
        [-halfX, halfY, -halfZ],
        [halfX, halfY, -halfZ],
      ],
      normal: [0, 0, -1],
      uv: ([x, y]) => [
        0.5 - (x + textureCenterX) / TABLETOP_TEXTURE_METERS,
        y / TABLETOP_TEXTURE_METERS + 0.5,
      ],
    },
    left: {
      vertices: [
        [-halfX, -halfY, -halfZ],
        [-halfX, -halfY, halfZ],
        [-halfX, halfY, halfZ],
        [-halfX, halfY, -halfZ],
      ],
      normal: [-1, 0, 0],
      uv: ([, y, z]) => [
        (z + textureCenterZ) / TABLETOP_TEXTURE_METERS + 0.5,
        y / TABLETOP_TEXTURE_METERS + 0.5,
      ],
    },
    right: {
      vertices: [
        [halfX, -halfY, halfZ],
        [halfX, -halfY, -halfZ],
        [halfX, halfY, -halfZ],
        [halfX, halfY, halfZ],
      ],
      normal: [1, 0, 0],
      uv: ([, y, z]) => [
        0.5 - (z + textureCenterZ) / TABLETOP_TEXTURE_METERS,
        y / TABLETOP_TEXTURE_METERS + 0.5,
      ],
    },
  }
  const spec = edgeSpecs[outerFace]

  surfaces.push({
    name: 'EdgeSurface',
    material: edgeMaterial,
    geometry: createQuadGeometry(
      spec.vertices,
      spec.normal,
      spec.uv,
    ),
  })

  return surfaces
}

function createQuarterCornerSurfaces({
  radius,
  thickness,
  signX,
  signZ,
  textureCenterX,
  textureCenterZ,
  topMaterial,
  bottomMaterial,
  edgeMaterial,
}) {
  const segments = 12
  const halfY = thickness / 2
  const arc = Array.from({ length: segments + 1 }, (_, index) => {
    const fraction = index / segments
    const angle = fraction * Math.PI / 2
    return {
      x: signX * radius * Math.cos(angle),
      z: signZ * radius * Math.sin(angle),
      fraction,
    }
  })
  const topTriangles = []
  const bottomTriangles = []
  const edgeTriangles = []
  const horizontalUv = ([x, , z]) => [
    (x + textureCenterX) / TABLETOP_TEXTURE_METERS + 0.5,
    (z + textureCenterZ) / TABLETOP_TEXTURE_METERS + 0.5,
  ]

  for (let index = 0; index < segments; index += 1) {
    const current = arc[index]
    const next = arc[index + 1]

    pushOrientedTriangle(
      topTriangles,
      [
        { position: [0, halfY, 0], uv: horizontalUv([0, halfY, 0]) },
        { position: [current.x, halfY, current.z], uv: horizontalUv([current.x, halfY, current.z]) },
        { position: [next.x, halfY, next.z], uv: horizontalUv([next.x, halfY, next.z]) },
      ],
      [0, 1, 0],
    )

    pushOrientedTriangle(
      bottomTriangles,
      [
        { position: [0, -halfY, 0], uv: horizontalUv([0, -halfY, 0]) },
        { position: [current.x, -halfY, current.z], uv: horizontalUv([current.x, -halfY, current.z]) },
        { position: [next.x, -halfY, next.z], uv: horizontalUv([next.x, -halfY, next.z]) },
      ],
      [0, -1, 0],
    )

    const middleAngle = ((current.fraction + next.fraction) / 2) * Math.PI / 2
    const sideNormal = [
      signX * Math.cos(middleAngle),
      0,
      signZ * Math.sin(middleAngle),
    ]
    const sideQuad = [
      {
        position: [current.x, -halfY, current.z],
        uv: [
          current.fraction * radius * Math.PI / 2 / TABLETOP_TEXTURE_METERS + 0.5,
          0.5 - halfY / TABLETOP_TEXTURE_METERS,
        ],
      },
      {
        position: [next.x, -halfY, next.z],
        uv: [
          next.fraction * radius * Math.PI / 2 / TABLETOP_TEXTURE_METERS + 0.5,
          0.5 - halfY / TABLETOP_TEXTURE_METERS,
        ],
      },
      {
        position: [next.x, halfY, next.z],
        uv: [
          next.fraction * radius * Math.PI / 2 / TABLETOP_TEXTURE_METERS + 0.5,
          0.5 + halfY / TABLETOP_TEXTURE_METERS,
        ],
      },
      {
        position: [current.x, halfY, current.z],
        uv: [
          current.fraction * radius * Math.PI / 2 / TABLETOP_TEXTURE_METERS + 0.5,
          0.5 + halfY / TABLETOP_TEXTURE_METERS,
        ],
      },
    ]

    pushOrientedTriangle(edgeTriangles, sideQuad.slice(0, 3), sideNormal)
    pushOrientedTriangle(edgeTriangles, [sideQuad[0], sideQuad[2], sideQuad[3]], sideNormal)
  }

  return [
    {
      name: 'TopCornerSurface',
      material: topMaterial,
      geometry: geometryFromTriangles(topTriangles),
    },
    {
      name: 'BottomCornerSurface',
      material: bottomMaterial,
      geometry: geometryFromTriangles(bottomTriangles),
    },
    {
      name: 'CornerEdgeSurface',
      material: edgeMaterial,
      geometry: geometryFromTriangles(edgeTriangles),
    },
  ]
}

function createQuadGeometry(vertices, normal, uvForVertex) {
  const triangles = []
  const quad = vertices.map((position) => ({
    position,
    uv: uvForVertex(position),
  }))

  pushOrientedTriangle(triangles, quad.slice(0, 3), normal)
  pushOrientedTriangle(triangles, [quad[0], quad[2], quad[3]], normal)
  return geometryFromTriangles(triangles)
}

function pushOrientedTriangle(target, vertices, normal) {
  const [a, b, c] = vertices.map((vertex) => vertex.position)
  const cross = new Vector3()
    .subVectors(new Vector3(...b), new Vector3(...a))
    .cross(new Vector3().subVectors(new Vector3(...c), new Vector3(...a)))
  const ordered = cross.dot(new Vector3(...normal)) >= 0
    ? vertices
    : [vertices[0], vertices[2], vertices[1]]

  ordered.forEach((vertex) => {
    target.push({
      ...vertex,
      normal,
    })
  })
}

function geometryFromTriangles(vertices) {
  const geometry = new BufferGeometry()
  const positions = vertices.flatMap((vertex) => vertex.position)
  const normals = vertices.flatMap((vertex) => vertex.normal)
  const uvs = vertices.flatMap((vertex) => vertex.uv)

  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3))
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2))

  const vertexCount = positions.length / 3
  geometry.setIndex(
    Array.from(
      { length: vertexCount },
      (_, index) => index,
    ),
  )
  geometry.computeTangents()
  return geometry
}

function addBeam(baseName, startArray, endArray, depthSide) {
  const start = new Vector3(...startArray)
  const end = new Vector3(...endArray)
  const direction = end.clone().sub(start)
  const length = direction.length()
  const midpoint = start.clone().add(end).multiplyScalar(0.5)
  const rotation = new Quaternion().setFromUnitVectors(
    new Vector3(0, 1, 0),
    direction.clone().normalize(),
  )

  addMesh({
    name: `${baseName}_${depthSide}`,
    geometry: new RoundedBoxGeometry(0.065, length, 0.045, 3, 0.004),
    material: frameMaterial,
    translation: midpoint.toArray(),
    rotation: rotation.toArray(),
    extras: {
      runtimeBehavior: 'fixed',
      longitudinalLocalAxis: 'y',
      lowerAnchor: start.toArray(),
      upperAnchor: end.toArray(),
      connectionMethod: 'embedded-fixed-anchors',
    },
    parent: supportFrame,
  })
}

function createStoneMaterial(name) {
  return document
    .createMaterial(name)
    .setBaseColorFactor([1, 1, 1, 1])
    .setBaseColorTexture(textures.albedo)
    .setNormalTexture(textures.normal)
    .setMetallicFactor(0)
    .setRoughnessFactor(1)
    .setMetallicRoughnessTexture(textures.metallicRoughness)
    .setExtras({
      replaceableFinishGroup: 'PrimaryTop',
      previewFinish: 'black-marble',
    })
}

async function loadTexture(name, filename) {
  return document
    .createTexture(name)
    .setImage(new Uint8Array(await readFile(path.join(TEXTURE_DIR, filename))))
    .setMimeType('image/png')
}

function addSurfaceMesh({
  name,
  surfaces,
  translation = [0, 0, 0],
  rotation = [0, 0, 0, 1],
  extras = {},
  parent = root,
}) {
  const mesh = document.createMesh(`${name}_Mesh`)

  surfaces.forEach((surface) => {
    addPrimitive({
      mesh,
      name: `${name}_${surface.name}`,
      geometry: surface.geometry,
      material: surface.material,
    })
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

function addMesh({
  name,
  geometry,
  material,
  translation = [0, 0, 0],
  rotation = [0, 0, 0, 1],
  extras = {},
  parent = root,
}) {
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
