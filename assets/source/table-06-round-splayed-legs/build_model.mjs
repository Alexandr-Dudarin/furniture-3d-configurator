import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { Accessor, Document, NodeIO } from '@gltf-transform/core'
import { BufferGeometry, Float32BufferAttribute, Vector3, Color } from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

// Этот builder принадлежит одной модели; общие engine-файлы он не изменяет.
const sourceDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(sourceDir, '../../..')
const spec = JSON.parse(await readFile(path.join(sourceDir, 'model-spec.json'), 'utf8'))
const doc = new Document()
const buffer = doc.createBuffer()
const scene = doc.createScene('FurnitureScene')
doc.getRoot().setDefaultScene(scene)
const source = { spec, materials: [], nodes: [] }
const tex = {}
for (const [key, filename] of Object.entries({color:'base-color.jpg', normal:'normal-gl.jpg', mr:'metallic-roughness.png'})) {
  tex[key] = doc.createTexture(key).setImage(new Uint8Array(await readFile(path.join(sourceDir,'textures',filename)))).setMimeType(filename.endsWith('png')?'image/png':'image/jpeg')
}
const materials = {}
for (const [name, role] of [['Stone_Top','top'],['Stone_Bottom','bottom'],['Stone_Edge_Round','perimeter']]) {
  const normalScale = spec.normalScale
  const extras = { materialSlot:'primaryTop', surfaceRole:role, previewFinish:spec.defaultTop, replaceableFinishGroup:'PrimaryTop' }
  materials[name] = doc.createMaterial(name).setBaseColorFactor([1,1,1,1]).setBaseColorTexture(tex.color).setNormalTexture(tex.normal).setNormalScale(normalScale).setMetallicRoughnessTexture(tex.mr).setMetallicFactor(0).setRoughnessFactor(1).setExtras(extras)
  for (const info of [materials[name].getBaseColorTextureInfo(), materials[name].getNormalTextureInfo(), materials[name].getMetallicRoughnessTextureInfo()]) info.setWrapS(10497).setWrapT(10497)
  source.materials.push({name, textured:true, normalScale, color:[1,1,1,1], metalness:0, roughness:1, extras})
}
const black = new Color(0x111317)
materials.Metal_Frame = doc.createMaterial('Metal_Frame').setBaseColorFactor([...black.toArray(),1]).setMetallicFactor(0.04).setRoughnessFactor(0.29).setExtras({materialSlot:'frameMetal', previewFinish:'metal-black-matte', replaceableFinishGroup:'FrameMetal'})
source.materials.push({name:'Metal_Frame',textured:false,color:[...black.toArray(),1],metalness:0.04,roughness:0.29,extras:{materialSlot:'frameMetal'}})
const root = addNode('Furniture_Root',null,null,[0,0,0],{modelId:spec.id,assetType:'constructor-ready',unit:'meter',heightReadiness:spec.heightReadiness,thicknessReadiness:spec.thicknessReadiness})
scene.addChild(root)
const base = addNode('Base_Assembly',root,null,[0,0,0],{runtimeBehavior:'fixed'})

function data() { return { positions:[], normals:[], uvs:[], indices:[] } }
function vertex(d,p,n,uv=[0,0]) {const i=d.positions.length/3; d.positions.push(...p);d.normals.push(...n);d.uvs.push(...uv);return i}
function tri(d,a,b,c) { d.indices.push(a,b,c) }
function geom(d) {
  const g=new BufferGeometry()
  g.setAttribute('position',new Float32BufferAttribute(d.positions,3))
  g.setAttribute('normal',new Float32BufferAttribute(d.normals,3))
  g.setAttribute('uv',new Float32BufferAttribute(d.uvs,2))
  g.setIndex(d.indices)
  g.computeTangents()
  return g
}

// Физическая UV-плотность: одна единица UV на метр. Центр текстуры = 0.5.
function roundSlab(radius,height,bevel,segments) {
  const top=data(), bottom=data(), edge=data(), h=height/2, r=radius-bevel
  for(const [d,y,n,flip] of [[top,h,[0,1,0],false],[bottom,-h,[0,-1,0],true]]) {
    vertex(d,[0,y,0],n,[0.5,0.5])
    for(let i=0;i<=segments;i++) {const t=-Math.PI/2+i*2*Math.PI/segments;const x=r*Math.cos(t),z=r*Math.sin(t);vertex(d,[x,y,z],n,[0.5+x,0.5+z])}
    for(let i=0;i<segments;i++) flip?tri(d,0,i+1,i+2):tri(d,0,i+2,i+1)
  }
  const rings=[]
  for(let i=0;i<=4;i++){const a=(Math.PI/2)*(1-i/4);rings.push([r+bevel*Math.cos(a),h-bevel+bevel*Math.sin(a),Math.cos(a),Math.sin(a)])}
  for(let i=0;i<=4;i++){const a=-(Math.PI/2)*i/4;rings.push([r+bevel*Math.cos(a),-h+bevel+bevel*Math.sin(a),Math.cos(a),Math.sin(a)])}
  let distance=0;const distances=[0]
  for(let k=1;k<rings.length;k++){distance+=Math.hypot(rings[k][0]-rings[k-1][0],rings[k][1]-rings[k-1][1]);distances.push(distance)}
  for(let k=0;k<rings.length;k++) {
    const [rr,y,nr,ny]=rings[k]
    for(let i=0;i<=segments;i++) {
      const theta=-Math.PI/2+i*2*Math.PI/segments
      vertex(edge,[rr*Math.cos(theta),y,rr*Math.sin(theta)],[nr*Math.cos(theta),ny,nr*Math.sin(theta)],[0.5+(i/segments-0.5)*2*Math.PI*radius,0.5+distance/2-distances[k]])
    }
  }
  for(let k=0;k<rings.length-1;k++) for(let i=0;i<segments;i++) {
    const a=k*(segments+1)+i,b=a+1,c=a+segments+1,e=c+1
    tri(edge,a,b,c);tri(edge,b,e,c)
  }
  return [{material:'Stone_Top',geometry:geom(top)},{material:'Stone_Bottom',geometry:geom(bottom)},{material:'Stone_Edge_Round',geometry:geom(edge)}]
}

addNode('TableTop',root,roundSlab(spec.diameter/2,spec.thickness,spec.topBevel,spec.radialSegments),[0,spec.height-spec.thickness/2,0],{runtimeBehavior:'scale',diameterAxes:['x','z'],thickness:spec.thickness,bevelAtBase:spec.topBevel,uvPeriodMeters:1,edgeSeamDirection:'-Z'})

function metalSlab(name,radius,height,y,bevel,parent=base) {
  const parts=roundSlab(radius,height,bevel,192).map(p=>({...p,material:'Metal_Frame'}))
  return addNode(name,parent,parts,[0,y,0],{runtimeBehavior:'fixed'})
}
if(spec.kind==='fluted-pedestal') {
  metalSlab('Base_Disc',0.295,0.024,0.012,0.0015)
  const upper=spec.height-spec.thickness
  metalSlab('Top_Mount',0.16,0.014,upper-0.006,0.001)
  const d=data(), count=576, ribs=72, lowerY=0.022,upperY=upper-0.006
  for(const y of [lowerY,upperY]) for(let i=0;i<=count;i++) {
    const t=i*2*Math.PI/count,r=0.1125+0.0025*Math.cos(ribs*t),dr=-0.0025*ribs*Math.sin(ribs*t)
    const n=new Vector3(r*Math.cos(t)+dr*Math.sin(t),0,r*Math.sin(t)-dr*Math.cos(t)).normalize()
    vertex(d,[r*Math.cos(t),y,r*Math.sin(t)],n.toArray())
  }
  for(let i=0;i<count;i++){const a=i,b=i+1,c=i+count+1,e=c+1;tri(d,a,c,b);tri(d,b,c,e)}
  for(const [y,ny,reverse] of [[lowerY,-1,false],[upperY,1,true]]) {
    const center=vertex(d,[0,y,0],[0,ny,0])
    for(let i=0;i<=count;i++){const t=i*2*Math.PI/count,r=0.1125+0.0025*Math.cos(ribs*t);vertex(d,[r*Math.cos(t),y,r*Math.sin(t)],[0,ny,0])}
    for(let i=0;i<count;i++) reverse?tri(d,center,center+i+2,center+i+1):tri(d,center,center+i+1,center+i+2)
  }
  addNode('Fluted_Column',base,[{material:'Metal_Frame',geometry:geom(d)}],[0,0,0],{runtimeBehavior:'fixed',flutes:72,outerDiameter:0.23,lowerAnchor:[0,lowerY,0],upperAnchor:[0,upperY,0],longitudinalAxis:'y'})
} else {
  const underside=spec.height-spec.thickness
  const mountY=underside-0.006
  addNode('Top_Mount',base,[{material:'Metal_Frame',geometry:new RoundedBoxGeometry(0.32,0.014,0.32,2,0.002)}],[0,mountY,0],{runtimeBehavior:'fixed'})
  for(let i=0;i<4;i++) {
    const theta=Math.PI/4+i*Math.PI/2
    const bottom=new Vector3(0.37*Math.cos(theta),0.004,0.37*Math.sin(theta))
    const top=new Vector3(0.13*Math.cos(theta),mountY,0.13*Math.sin(theta))
    const dir=top.clone().sub(bottom).normalize()
    // Сечение перпендикулярно оси ножки; торцы срезаны горизонтально.
    const radial=new Vector3(Math.cos(theta),0,Math.sin(theta))
    const xAxis=radial.clone().addScaledVector(dir,-radial.dot(dir)).normalize()
    const zAxis=xAxis.clone().cross(dir).normalize()
    const length=bottom.distanceTo(top),origin=top.clone().add(bottom).multiplyScalar(0.5)
    const corners=[]
    const hx=0.055/2,hz=0.030/2,b=0.0008
    const section=[[-hx+b,-hz],[hx-b,-hz],[hx,-hz+b],[hx,hz-b],[hx-b,hz],[-hx+b,hz],[-hx,hz-b],[-hx,-hz+b]]
    for(const [center,y] of [[bottom,bottom.y],[top,top.y]]) for(const [sx,sz] of section) {
      const p=center.clone().addScaledVector(xAxis,sx).addScaledVector(zAxis,sz)
      p.addScaledVector(dir,(y-p.y)/dir.y)
      corners.push(p.sub(origin).toArray())
    }
    const d=data()
    const faces=[[0,1,2,3,4,5,6,7],[15,14,13,12,11,10,9,8],...Array.from({length:8},(_,i)=>[i,i+8,(i+1)%8+8,(i+1)%8])]
    // Нормали вычисляются из плоских граней с контролем наружного направления.
    for(const indices of faces) {
      const pts=indices.map(j=>new Vector3(...corners[j]))
      let n=pts[1].clone().sub(pts[0]).cross(pts[2].clone().sub(pts[0])).normalize()
      const center=pts.reduce((v,p)=>v.add(p),new Vector3()).multiplyScalar(1/pts.length)
      if(n.dot(center)<0){pts.reverse();n.negate()}
      const start=d.positions.length/3
      for(const p of pts) vertex(d,p.toArray(),n.toArray())
      for(let f=1;f<pts.length-1;f++)tri(d,start,start+f,start+f+1)
    }
    addNode(`Leg_${String(i+1).padStart(2,'0')}`,base,[{material:'Metal_Frame',geometry:geom(d)}],origin.toArray(),{runtimeBehavior:'fixed',lowerAnchor:bottom.toArray(),upperAnchor:top.toArray(),localLongitudinalDirection:dir.toArray(),baseLength:length,horizontalEndCuts:true,section:[0.055,0.030],edgeChamfer:0.0008})
    const pad=new RoundedBoxGeometry(0.06,0.006,0.035,2,0.0008)
    pad.rotateY(-theta)
    addNode(`Foot_Pad_${String(i+1).padStart(2,'0')}`,base,[{material:'Metal_Frame',geometry:pad}],[bottom.x,0.003,bottom.z],{runtimeBehavior:'fixed',contactPlaneY:0})
  }
}

function addNode(name,parent,parts,translation,extras={},rotation=[0,0,0,1]) {
  const node=doc.createNode(name).setTranslation(translation).setRotation(rotation).setExtras(extras)
  const record={name,parent:parent?.getName()??null,translation,rotation,extras,primitives:[]}
  if(parts) {
    const mesh=doc.createMesh(`${name}_Mesh`)
    for(const {geometry:g,material} of parts) {
      const textured=material!=='Metal_Frame'
      const primitive=doc.createPrimitive().setMaterial(materials[material])
      const attributes={}
      for(const [gName,semantic,type] of [['position','POSITION','VEC3'],['normal','NORMAL','VEC3'],['uv','TEXCOORD_0','VEC2'],['tangent','TANGENT','VEC4']]) {
        if(!textured&&['uv','tangent'].includes(gName))continue
        const a=g.getAttribute(gName); if(!a)continue
        const array=new Float32Array(a.array)
        primitive.setAttribute(semantic,doc.createAccessor(`${name}_${gName}`,buffer).setType(Accessor.Type[type]).setArray(array))
        attributes[gName]=Array.from(array)
      }
      const indices=g.index?Array.from(g.index.array):Array.from({length:g.getAttribute('position').count},(_,i)=>i)
      primitive.setIndices(doc.createAccessor(`${name}_indices`,buffer).setType(Accessor.Type.SCALAR).setArray(new Uint32Array(indices)))
      mesh.addPrimitive(primitive)
      record.primitives.push({material,attributes,indices})
      g.dispose()
    }
    node.setMesh(mesh)
  }
  parent?.addChild(node)
  source.nodes.push(record)
  return node
}

await mkdir(path.join(projectRoot,'public/models'),{recursive:true})
const glb=await new NodeIO().writeBinary(doc)
await writeFile(path.join(projectRoot,'public/models',`${spec.id}.glb`),glb)
await writeFile(path.join(sourceDir,'mesh-source.json'),JSON.stringify(source))
console.log(JSON.stringify({model:spec.id,bytes:glb.byteLength,nodes:source.nodes.length,triangles:source.nodes.flatMap(n=>n.primitives).reduce((n,p)=>n+p.indices.length/3,0)}))
