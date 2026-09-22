import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Document, NodeIO, Accessor } from '@gltf-transform/core'
import * as THREE from 'three'
import { externalizeImages } from './externalize_images.mjs'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

// Авторинг одной модели. Не добавляет поведение в общий runtime.
const sourceDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(sourceDir, '../../..')
const spec = JSON.parse(await fs.readFile(path.join(sourceDir, 'model-spec.json'), 'utf8'))
const { width: W, height: H, depth: D } = spec.base
const t=.016,b=.0007,backT=.004
const axes = ['x','y','z'], dimensions = ['width','height','depth']
const doc = new Document(), buffer = doc.createBuffer(), scene = doc.createScene('FurnitureScene')
doc.getRoot().setDefaultScene(scene)
doc.getRoot().getAsset().generator = 'Furniture dresser model authoring / glTF-Transform'
const source = { spec, materials:[], nodes:[] }
const parts = [], resizeRules = [], uvContract = {}, textureAxes = {}, materialTargets = {carcass:[],fronts:[],hardware:[],fixed:[]}
const nodeMeta = new Map(), materials = new Map(), materialCache = new Map()
const textureSets={}
const textureFiles={solid:{color:'textures/neutral-color.png',normal:'textures/normal-gl.png',mr:'textures/metallic-roughness.png',roughness:'textures/roughness.png'}}
const sharedRoot='../../../public/materials/wood/oak-natural/'
if(spec.wood)textureFiles.wood={color:sharedRoot+'base-color.jpg',normal:sharedRoot+'normal-gl.jpg',mr:sharedRoot+'roughness.jpg',roughness:sharedRoot+'roughness.jpg'}
const externalImageURIs={'wood-color':'../materials/wood/oak-natural/base-color.jpg','wood-normal':'../materials/wood/oak-natural/normal-gl.jpg','wood-mr':'../materials/wood/oak-natural/roughness.jpg'}
for(const [set,files] of Object.entries(textureFiles)) {
  textureSets[set]={}
  for(const key of ['color','normal','mr'])textureSets[set][key]=doc.createTexture(`${set}-${key}`).setImage(new Uint8Array(await fs.readFile(path.join(sourceDir,files[key])))).setMimeType(files[key].endsWith('.jpg')?'image/jpeg':'image/png')
}
const zeros = () => ({width:[0,0,0],height:[0,0,0],depth:[0,0,0]})
const motion = (wx=0,hy=0,dz=0) => ({width:[wx,0,0],height:[0,hy,0],depth:[0,0,dz]})
const clean = n => Math.abs(n)<1e-12 ? 0 : Number(n.toFixed(12))

function node(name, parent, pos, extras={}, moves=zeros(), primitives=[]) {
  const n = doc.createNode(name).setTranslation(pos.map(clean)).setExtras(extras)
  const record = {name,parent:parent?.getName()??null,translation:pos.map(clean),rotation:[0,0,0,1],extras,primitives:[]}
  if(primitives.length) {
    const mesh = doc.createMesh(name+'_Mesh')
    for(const {g, material} of primitives) {
      const p = doc.createPrimitive().setMaterial(materials.get(material)), attributes={}
      for(const [a,semantic,type] of [['position','POSITION','VEC3'],['normal','NORMAL','VEC3'],['uv','TEXCOORD_0','VEC2'],['tangent','TANGENT','VEC4']]) {
        const attr=g.getAttribute(a);if(!attr)continue
        const array=new Float32Array(attr.array)
        p.setAttribute(semantic,doc.createAccessor(name+'_'+a,buffer).setType(Accessor.Type[type]).setArray(array))
        attributes[a]=Array.from(array)
      }
      const indices=g.index?Array.from(g.index.array):Array.from({length:g.attributes.position.count},(_,i)=>i)
      p.setIndices(doc.createAccessor(name+'_indices',buffer).setType('SCALAR').setArray(new Uint32Array(indices)))
      mesh.addPrimitive(p);record.primitives.push({material,attributes,indices});g.dispose()
    }
    n.setMesh(mesh)
  }
  if(parent)parent.addChild(n);else scene.addChild(n)
  for(const dimension of dimensions) for(let a=0;a<3;a++) {
    const factor=clean(moves[dimension]?.[a]??0)
    if(factor)resizeRules.push({type:'delta-move',dimension,axis:axes[a],targets:[{target:name,factor}]})
  }
  source.nodes.push(record)
  return n
}

// Группы задаются в мировых координатах при base. Локальные дельты вычисляются
// относительно parent, поэтому ручки не наследуют растяжение полотна.
function group(name,parent,worldPos,worldMotion=zeros(),extras={}) {
  const pm=parent?nodeMeta.get(parent.getName()):{position:[0,0,0],motion:zeros()}
  const local=worldPos.map((p,i)=>p-pm.position[i]), moves=zeros()
  for(const d of dimensions)moves[d]=worldMotion[d].map((v,i)=>v-pm.motion[d][i])
  const n=node(name,parent,local,extras,moves)
  nodeMeta.set(name,{position:worldPos,motion:worldMotion})
  return n
}

const root=group(`Dresser_${spec.number}_Root`,null,[0,0,0],zeros(),{
  modelId:spec.id,unit:'meter',front:'+Z',floorAnchor:0,heightReadiness:'height-configurable',
  thicknessReadiness:'thickness-fixed',runtimeCompatibility:'geometry-supported; material-and-UV-integration-pending',
})
const carcass=group('Carcass_Assembly',root,[0,0,0])

function newMaterial(name,slot,color,metalness,roughness,textured,extras={}) {
  const c=new THREE.Color(color),colorFactor=[...c.toArray(),1],textureSet=extras.textureSet??'solid'
  const m=doc.createMaterial(name).setBaseColorFactor(colorFactor).setMetallicFactor(metalness).setRoughnessFactor(roughness).setExtras({materialSlot:slot,...extras})
  const normalScale=textureSet==='wood'?.2:.1
  if(textured) {
    const tex=textureSets[textureSet]
    m.setBaseColorTexture(tex.color).setNormalTexture(tex.normal).setNormalScale(normalScale).setMetallicRoughnessTexture(tex.mr)
    for(const info of [m.getBaseColorTextureInfo(),m.getNormalTextureInfo(),m.getMetallicRoughnessTextureInfo()])info.setWrapS(10497).setWrapT(10497)
  }
  materials.set(name,m);materialTargets[slot].push(name)
  source.materials.push({name,textured,color:colorFactor,metalness,roughness,normalScale,textureFiles:textured?textureFiles[textureSet]:null,extras:{materialSlot:slot,...extras}})
  return name
}
newMaterial('Mechanism_Steel','fixed',0x969ba1,.75,.27,false,{role:'internal drawer runners and hinges'})
if(spec.foot&&spec.kind!=='brooklyn')newMaterial('Foot_Plastic','fixed',spec.wood?0xbeb9ab:0x27292a,0,.6,false,{role:'fixed foot pads'})
if(spec.kind!=='basic')newMaterial('Hardware_Color','hardware',spec.hardwareColor,spec.hardwareMetalness,spec.hardwareRoughness,false,{defaultFinish:spec.hardwareFinish,finishPending:!spec.hardwareFinish})

function geometry(data) {
  const g=new THREE.BufferGeometry()
  for(const [key,size] of [['position',3],['normal',3],['uv',2]])if(data[key]?.length)g.setAttribute(key,new THREE.Float32BufferAttribute(data[key],size))
  g.setIndex(Array.from({length:data.position.length/3},(_,i)=>i))
  if(data.uv?.length)g.computeTangents()
  return g
}

function boardMaterial(family,slot,size,dSize,zones,thin,plane,uvAxes,tileName) {
  const key=JSON.stringify({family,slot,size:size.map(clean),dSize,zones,thin,plane,uvAxes})
  if(materialCache.has(key))return materialCache.get(key)
  const zoneCode=zones.map(n=>n===-1?'m':n===1?'p':'c').join('')
  const name=`${slot==='fronts'?'Front':'Board'}_${family}_${zoneCode}_${axes[plane].toUpperCase()}`
  const bindings={}
  for(const [uv,axis] of Object.entries({u:uvAxes[0],v:uvAxes[1]})) {
    const zone=zones[axis], coefficient=dSize[axis]
    const baseLength=size[axis]-2*b
    bindings[uv]={axis:axes[axis],dimension:dimensions[axis],baseLength:clean(baseLength),
      stretchFactor:zone===0?coefficient:0,translationFactor:zone*coefficient/2,
      anchor:clean(.5+zone*baseLength/2),uvUnitsPerMeter:1}
  }
  uvContract[name]={slot,exampleTarget:tileName,surfacePlane:axes[plane],bindings,
    formula:'repeat=(baseLength+delta*stretchFactor)/baseLength; offset=anchor*(1-repeat)+delta*translationFactor',
    status:'requires generic affine UV bindings; not active in current preview config'}
  // Только диагностическая совместимость со старым API; не выдаётся за точную UV-компенсацию.
  textureAxes[name]={}
  for(const [uv,binding] of Object.entries(bindings))if(binding.stretchFactor)textureAxes[name][binding.dimension]=uv==='u'?'x':'y'
  newMaterial(name,slot,slot==='carcass'?spec.carcassColor:spec.frontColor,0,slot==='carcass'?(spec.wood?1:.52):spec.roughness,true,{textureSet:slot==='carcass'&&spec.wood?'wood':'solid',surfacePlane:axes[plane],uvPeriodMeters:1,boardFinishPending:true})
  materialCache.set(key,name)
  return name
}

// Девять частей плиты сохраняют толщину и радиус кромки при любом W/H/D.
// Скрытых перегородок между частями нет: они образуют одну замкнутую оболочку.
function board(name,parent,size,pos,dSize,dPos,thin,slot='carcass',family=name,extras={}) {
  const baseSize=size.map(clean), part=group(name,parent,pos,dPos,{kind:'board',thickness:baseSize[thin],thicknessAxis:axes[thin],bevelRadius:b,...extras})
  parts.push({name,kind:'board',slot,size:baseSize,position:pos.map(clean),sizeFactors:dSize,positionFactors:dPos,thinAxis:thin,bevel:b,...extras})
  const rounded=new RoundedBoxGeometry(...size,2,b)
  const positions=rounded.attributes.position.array, normals=rounded.attributes.normal.array
  const faces=rounded.groups, buckets=new Map()
  for(let vertex=0;vertex<positions.length/3;vertex+=3) {
    const face=faces.findIndex(f=>vertex>=f.start&&vertex<f.start+f.count)
    const plane=Math.floor(face/2)
    const zone=[0,0,0]
    for(let a=0;a<3;a++)if(a!==thin) {
      const values=[0,1,2].map(k=>positions[(vertex+k)*3+a]), inner=size[a]/2-b
      if(Math.min(...values)>=inner-2e-7)zone[a]=1
      else if(Math.max(...values)<=-inner+2e-7)zone[a]=-1
    }
    const code=zone.map(z=>z<0?'m':z>0?'p':'c').join(''), key=code+plane
    if(!buckets.has(key))buckets.set(key,{zone,plane,position:[],normal:[],uv:[]})
    const out=buckets.get(key)
    let uvAxes
    if(plane===thin)uvAxes=thin===0?[2,1]:thin===1?[2,0]:[0,1]
    else uvAxes=[thin,[0,1,2].find(a=>a!==thin&&a!==plane)]
    out.uvAxes=uvAxes
    for(let k=0;k<3;k++) {
      const p=Array.from(positions.slice((vertex+k)*3,(vertex+k)*3+3)), n=Array.from(normals.slice((vertex+k)*3,(vertex+k)*3+3))
      out.position.push(...p.map((v,a)=>v-zone[a]*(size[a]/2-b)))
      out.normal.push(...n)
      for(const a of uvAxes) {
        // Физическая длина прямого участка + дуга скругления, одна UV-единица на метр.
        const arc=b*Math.atan2(n[a],Math.abs(n[plane]))
        const flat=p[a]-b*n[a]
        out.uv.push(.5+flat+arc)
      }
    }
  }
  rounded.dispose()
  const tiles=new Map()
  for(const bucket of buckets.values()) {
    const code=bucket.zone.map(z=>z<0?'m':z>0?'p':'c').join(''), tileName=`${name}_Tile_${code}`
    if(!tiles.has(code))tiles.set(code,{name:tileName,zone:bucket.zone,primitives:[]})
    const material=boardMaterial(family,slot,size,dSize,bucket.zone,thin,bucket.plane,bucket.uvAxes,tileName)
    tiles.get(code).primitives.push({g:geometry(bucket),material})
  }
  for(const tile of tiles.values()) {
    const loc=tile.zone.map((z,a)=>z*(size[a]/2-b)), moves=zeros()
    for(let a=0;a<3;a++)moves[dimensions[a]][a]=tile.zone[a]*dSize[a]/2
    node(tile.name,part,loc,{kind:'board-segment',zones:tile.zone,bevelRadius:b},moves,tile.primitives)
    for(let a=0;a<3;a++)if(dSize[a]&&tile.zone[a]===0)resizeRules.push({type:'stretch-segment',target:tile.name,dimension:dimensions[a],axis:axes[a],baseLength:clean(size[a]-2*b),factor:dSize[a]})
  }
  return part
}

function metal(name,parent,size,pos,dSize=[0,0,0],dPos=zeros(),extras={},shape='box',material='Mechanism_Steel') {
  let g
  if(shape==='oval-x') {g=new THREE.CylinderGeometry(size[1]/2,size[1]/2,size[0],32,1);g.rotateZ(Math.PI/2);g.scale(1,1,size[2]/size[1])}
  else g=dSize.some(Boolean)?new THREE.BoxGeometry(...size):new RoundedBoxGeometry(...size,1,Math.min(.0008,...size.map(x=>x/8)))
  g.deleteAttribute('uv')
  const pm=nodeMeta.get(parent.getName()), local=pos.map((v,a)=>v-pm.position[a]), moves=zeros()
  for(const d of dimensions)moves[d]=dPos[d].map((v,a)=>v-pm.motion[d][a])
  const n=node(name,parent,local,{kind:'hardware',...extras},moves,[{g,material}])
  nodeMeta.set(name,{position:pos,motion:dPos})
  for(let a=0;a<3;a++)if(dSize[a])resizeRules.push({type:'stretch-segment',target:name,dimension:dimensions[a],axis:axes[a],baseLength:clean(size[a]),factor:dSize[a]})
  parts.push({name,kind:'hardware',size:size.map(clean),position:pos.map(clean),sizeFactors:dSize,positionFactors:dPos,...extras})
  return n
}


// Конструкция семейства комодов. Этот файл используется только при авторинге,
// общему runtime передаются GLB и декларативный FurnitureDefinition.
const K=spec.kind, N=spec.rows, foot=spec.foot, bottomY=spec.plinth||foot||(K==='baikal'?.050:0)
const F=D/2-spec.projection, bodyBack=-D/2, bodyFront=F-t-.004
const bodyDepth=bodyFront-bodyBack, bodyZ=(bodyFront+bodyBack)/2, bodyW=W-2*spec.overhang
const faceBottom=K==='basic'?bottomY+.002:bottomY+t+.003
const faceTop=H-t-.003, rowH=(faceTop-faceBottom-(N-1)*spec.frontGap)/N
const boundaries=K==='nord'?[-.5,-1/6,.5]:K==='brooklyn'?[-.5,0,.5]:K==='marvel'?[-.5,-.25,.25,.5]:[-.5,.5]
const bays=[],doors=[],drawers=[],facades=[],decorations=[],handles=[]

function hardwareGeometry(name,parent,g,pos,moves,material,extras={},growth=[0,0,0]) {
  g.computeBoundingBox();const size=g.boundingBox.getSize(new THREE.Vector3()).toArray();g.center()
  const pm=nodeMeta.get(parent.getName()),delta=zeros()
  for(const d of dimensions)delta[d]=moves[d].map((v,a)=>v-pm.motion[d][a])
  const n=node(name,parent,pos.map((v,a)=>v-pm.position[a]),{kind:'hardware',...extras},delta,[{g,material}])
  nodeMeta.set(name,{position:pos,motion:moves})
  for(let a=0;a<3;a++)if(growth[a])resizeRules.push({type:'stretch-segment',target:name,dimension:dimensions[a],axis:axes[a],baseLength:clean(size[a]),factor:growth[a]})
  parts.push({name,kind:'hardware',size:size.map(clean),position:pos.map(clean),sizeFactors:growth,positionFactors:moves,...extras})
  return n
}

function triangle(data,a,bv,c,uvFunction) {
  const normal=new THREE.Vector3().subVectors(new THREE.Vector3(...bv),new THREE.Vector3(...a)).cross(new THREE.Vector3().subVectors(new THREE.Vector3(...c),new THREE.Vector3(...a)))
  if(normal.length()<1e-13)return
  normal.normalize()
  for(const p of [a,bv,c]) {data.position.push(...p);data.normal.push(...normal.toArray());data.uv.push(...uvFunction(p))}
}
function surfaceMaterial(name,size,growth,translation=[0,0],uvCenter=[.5,.5]) {
  newMaterial(name,'fronts',spec.frontColor,0,spec.roughness,true,{textureSet:'solid',customSurface:true})
  uvContract[name]={slot:'fronts',surfacePlane:'z',exampleTarget:name.replace('Front_','Decor_'),status:'requires affine UV integration',bindings:{
    u:{dimension:'width',axis:'x',baseLength:size[0],stretchFactor:growth[0],translationFactor:translation[0],anchor:uvCenter[0],uvUnitsPerMeter:1},
    v:{dimension:'height',axis:'y',baseLength:size[1],stretchFactor:growth[1],translationFactor:translation[1],anchor:uvCenter[1],uvUnitsPerMeter:1},
  }}
  return name
}
function surfaceNode(name,parent,data,pos,moves,size,growth,material,extras={}) {
  const pm=nodeMeta.get(parent.getName()),delta=zeros()
  for(const d of dimensions)delta[d]=moves[d].map((v,a)=>v-pm.motion[d][a])
  const primitives=[{g:geometry(data),material},...(data.extraPrimitives??[]).map(p=>({g:geometry(p.data),material:p.material}))]
  for(const p of primitives)if(uvContract[p.material])uvContract[p.material].exampleTarget=name
  const n=node(name,parent,pos.map((v,a)=>v-pm.position[a]),{kind:'decoration',...extras},delta,primitives)
  for(let a=0;a<2;a++)if(growth[a])resizeRules.push({type:'stretch-segment',target:name,dimension:dimensions[a],axis:axes[a],baseLength:size[a],factor:growth[a]})
  decorations.push({name,size,position:pos,positionFactors:moves,sizeFactors:growth,...extras})
  return n
}

// Снаружи габарит задают крышка, напольные опоры и закрытая ручка.
board('Panel_Top',carcass,[W,t,D-spec.projection],[0,H-t/2,-spec.projection/2],[1,0,1],motion(0,1,0),1,'carcass','Top')
for(const [side,s] of [['Left',-1],['Right',1]])board(`Panel_Side_${side}`,carcass,[t,H-t-foot,bodyDepth],[s*(bodyW/2-t/2),(foot+H-t)/2,bodyZ],[0,1,1],motion(s*.5,.5,0),0,'carcass','Side')
board('Panel_Bottom',carcass,[bodyW-2*t,t,bodyDepth-backT],[0,bottomY+t/2,(bodyBack+backT+bodyFront)/2],[1,0,1],motion(),1,'carcass','Bottom')
board('Panel_Back',carcass,[bodyW-2*t,H-t-bottomY,backT],[0,(bottomY+H-t)/2,bodyBack+backT/2],[1,1,0],motion(0,.5,-.5),2,'carcass','Back')
if(spec.plinth)board('Plinth_Front',carcass,[bodyW-2*t,spec.plinth,t],[0,spec.plinth/2,bodyFront-.020-t/2],[1,0,0],motion(0,0,.5),2,'carcass','Plinth')
for(let i=1;i<boundaries.length-1;i++)board(`Panel_Divider_${i}`,carcass,[t,H-2*t-bottomY,bodyDepth-backT],[W*boundaries[i],(bottomY+t+H-t)/2,(bodyBack+backT+bodyFront)/2],[0,1,1],motion(boundaries[i],.5,0),0,'carcass','Divider')
if(foot)for(const [xi,xf] of [[0,-.5],[1,0],[2,.5]])for(const [zi,zf] of [[0,-.5],[1,.5]]) {
  const x=xf===0?0:xf*W-Math.sign(xf)*.035,z=zf<0?bodyBack+.035:bodyFront-.035
  metal(`Foot_${xi}_${zi}`,carcass,[.060,foot,.045],[x,foot/2,z],[0,0,0],motion(xf,0,zf),{fitting:'foot'},'box',K==='brooklyn'?'Mechanism_Steel':'Foot_Plastic')
}
for(let i=0;i<boundaries.length-1;i++) {
  const lf=boundaries[i],rf=boundaries[i+1],a=i===0?-bodyW/2+t:W*lf+t/2,z=i===boundaries.length-2?bodyW/2-t:W*rf-t/2
  const inset=K==='baikal'||K==='marvel'?t+.002:.002
  const frontLeft=i===0?-W/2+spec.overhang+inset:W*lf+.002
  const frontRight=i===boundaries.length-2?W/2-spec.overhang-inset:W*rf-.002
  bays.push({index:i,min:a,max:z,x:(a+z)/2,width:z-a,xf:(lf+rf)/2,wf:rf-lf,lf,rf,frontLeft,frontRight,frontX:(frontLeft+frontRight)/2,frontW:frontRight-frontLeft})
}

function makeHandle(prefix,parent,bay,y,yf,type,doorTop=0) {
  let g,pos,move=motion(bay.xf,yf,.5)
  if(type==='nord') {
    const x=bay.frontRight-.015,cy=doorTop-.012-.250
    const h=group(prefix+'_Assembly',parent,[x,cy,F],motion(bay.rf,1,.5),{kind:'handle',fixedLength:.5,projection:spec.projection})
    metal(prefix+'_Bar',h,[.008,.5,.010],[x,cy,F+.013],[0,0,0],motion(bay.rf,1,.5),{fitting:'handle-bar'},'box','Hardware_Color')
    for(const s of [-1,1])metal(prefix+`_Post_${s<0?'Lower':'Upper'}`,h,[.008,.018,.011],[x,cy+s*.22,F+.0055],[0,0,0],motion(bay.rf,1,.5),{fitting:'handle-post'},'box','Hardware_Color')
    handles.push({name:h.getName(),type,nominalLength:.5});return
  }
  if(type==='brooklyn') {
    const shape=new THREE.Shape(),w=.120,h=.032,r=.004
    shape.moveTo(-w/2+r,-h/2);shape.lineTo(w/2-r,-h/2);shape.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r)
    shape.lineTo(w/2,h/2-r);shape.quadraticCurveTo(w/2,h/2,w/2-r,h/2);shape.lineTo(-w/2+r,h/2)
    shape.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);shape.lineTo(-w/2,-h/2+r);shape.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2)
    g=new THREE.ExtrudeGeometry(shape,{depth:.002,steps:1,bevelEnabled:false,curveSegments:5});g.rotateX(-Math.PI/4);g.deleteAttribute('uv')
    g.computeBoundingBox();const dz=g.boundingBox.max.z-g.boundingBox.min.z
    pos=[bay.frontX,y-.011,F+spec.projection-dz/2]
  } else if(type==='baikal') {
    const points=[[0,-.021,0],[0,-.016,.010],[0,0,.016],[0,.016,.010],[0,.021,0]].map(p=>new THREE.Vector3(...p))
    g=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),20,.004,8,false);g.deleteAttribute('uv')
    g.computeBoundingBox();const dz=g.boundingBox.max.z-g.boundingBox.min.z
    pos=[bay.frontX,y,F+spec.projection-dz/2]
  } else {
    g=new RoundedBoxGeometry(.14,.008,.018,2,.0007);g.deleteAttribute('uv')
    pos=[bay.frontX,doorTop-.006,F+.006];move=motion(bay.xf,1,.5)
  }
  const h=hardwareGeometry(prefix,parent,g,pos,move,'Hardware_Color',{fitting:'handle',handleType:type})
  handles.push({name:h.getName(),type})
}

function flutes(parent,bay,height,cy) {
  const count=26,width=.008,depth=.002,ribH=height-.004
  for(let i=0;i<count;i++) {
    const relative=(i+1)/(count+1)-.5,cx=relative*(bay.frontW-.004),data={position:[],normal:[],uv:[]},caps={position:[],normal:[],uv:[]}
    const steps=12,uv=p=>[.5+cx+p[0],.5+p[1]],ring=[]
    for(let j=0;j<=steps;j++){const angle=Math.PI*j/steps;ring.push([width/2*Math.cos(angle),depth*Math.sin(angle)])}
    for(let j=0;j<steps;j++) {
      const [xa,za]=ring[j],[xb,zb]=ring[j+1],a=[xa,-ribH/2,za],b0=[xb,-ribH/2,zb],c=[xb,ribH/2,zb],d=[xa,ribH/2,za]
      triangle(data,a,c,b0,uv);triangle(data,a,d,c,uv)
      const capUv=p=>[.5+cx+p[0],.5+p[2]]
      triangle(caps,[0,ribH/2,0],c,d,capUv);triangle(caps,[0,-ribH/2,0],a,b0,capUv)
    }
    const suffix=String(i+1).padStart(2,'0'),materialName=`Front_Flute_${suffix}`
    if(!materials.has(materialName))surfaceMaterial(materialName,[width,ribH],[0,1],[relative*bay.wf,0],[.5+cx,.5])
    const capMaterial=materialName+'_Caps'
    if(!materials.has(capMaterial)) {
      surfaceMaterial(capMaterial,[width,depth],[0,0],[relative*bay.wf,0],[.5+cx,.5])
      uvContract[capMaterial].surfacePlane='y'
      uvContract[capMaterial].bindings.v={dimension:'depth',axis:'z',baseLength:depth,stretchFactor:0,translationFactor:0,anchor:.5,uvUnitsPerMeter:1}
    }
    data.extraPrimitives=[{data:caps,material:capMaterial}]
    const name=`${parent.getName()}_Flute_${suffix}`
    surfaceNode(name,parent,data,[bay.frontX+cx,cy,F-depth],motion(bay.xf+relative*bay.wf,.5,.5),[width,ribH,depth],[0,1,0],materialName,{decoration:'flute',ribWidth:width,ribDepth:depth,index:i})
  }
}

function carvedSkin(parent,bay,cy,fy,fh) {
  const a=.144,z0=F-.001,w=bay.frontW,h=fh
  const uv=p=>[.5+p[0],.5+p[1]]
  function patch(name,x0,x1,y0,y1,growth,moves,carved=false,mirror=false) {
    const data={position:[],normal:[],uv:[]},rims=[{position:[],normal:[],uv:[]},{position:[],normal:[],uv:[]}],cx=(x0+x1)/2,cy0=(y0+y1)/2
    const make=(points)=>{
      for(let k=1;k<points.length-1;k++)triangle(data,...[points[0],points[k],points[k+1]].map(p=>[p[0]-cx,p[1]-cy0,p[2]]),p=>uv([p[0]+cx,p[1]+cy0,p[2]]))
      for(let k=0;k<points.length;k++) {
        const pa=points[k],pb=points[(k+1)%points.length]
        const outerX=Math.abs(Math.abs(pa[0])-w/2)<1e-10&&Math.abs(pa[0]-pb[0])<1e-10
        const outerY=Math.abs(Math.abs(pa[1])-h/2)<1e-10&&Math.abs(pa[1]-pb[1])<1e-10
        if(!outerX&&!outerY)continue
        const axis=outerY?0:1,rim=rims[axis],a0=[pa[0]-cx,pa[1]-cy0,pa[2]],b0=[pb[0]-cx,pb[1]-cy0,pb[2]]
        const ab=[a0[0],a0[1],-b],bb=[b0[0],b0[1],-b],rimUv=p=>[.5+p[axis]+(axis===0?cx:cy0),.5+p[2]]
        triangle(rim,a0,ab,bb,rimUv);triangle(rim,a0,bb,b0,rimUv)
      }
    }
    if(!carved)make([[x0,y0,.001],[x1,y0,.001],[x1,y1,.001],[x0,y1,.001]])
    else {
      const centres=[.068,.101,.134],half=.0024*Math.SQRT2/2,cuts=[0,...centres.flatMap(c=>[c-half,c,c+half]),2*a]
      function clip(poly,limit,lower) {
        const out=[]
        for(let i=0;i<poly.length;i++) {
          const p=poly[i],q=poly[(i+1)%poly.length],sp=p[0]+p[1]-limit,sq=q[0]+q[1]-limit,inside=lower?sp>=-1e-12:sp<=1e-12,next=lower?sq>=-1e-12:sq<=1e-12
          if(inside)out.push(p)
          if(inside!==next){const t=sp/(sp-sq);out.push([p[0]+t*(q[0]-p[0]),p[1]+t*(q[1]-p[1])])}
        }return out
      }
      function elevation(x,y) {const q=x+y;let d=0;for(const c of centres)d=Math.max(d,.0008*Math.max(0,1-Math.abs(q-c)/half));return .001-d}
      for(let i=0;i<cuts.length-1;i++) {
        const p=clip(clip([[0,0],[a,0],[a,a],[0,a]],cuts[i],true),cuts[i+1],false)
        const points=p.map(([x,y])=>[mirror?x1-x:x0+x,y0+y,elevation(x,y)])
        if(mirror)points.reverse();if(points.length>2)make(points)
      }
    }
    // Периметр тонкого слоя замыкается к основе; внутренние стыки разделены узлами.
    const material=`Front_Carved_${name}`
    surfaceMaterial(material,[x1-x0,y1-y0],growth,[moves.width[0]-bay.xf,moves.height[1]-fy],[.5+cx,.5+cy0])
    data.extraPrimitives=[]
    for(let axis=0;axis<2;axis++)if(rims[axis].position.length) {
      const rimMaterial=material+`_Rim_${axes[axis].toUpperCase()}`,dim=dimensions[axis],translation=axis===0?moves.width[0]-bay.xf:moves.height[1]-fy
      newMaterial(rimMaterial,'fronts',spec.frontColor,0,spec.roughness,true,{textureSet:'solid',customSurface:true})
      uvContract[rimMaterial]={slot:'fronts',surfacePlane:axis===0?'y':'x',exampleTarget:`${parent.getName()}_${name}`,status:'requires affine UV integration',bindings:{
        u:{dimension:dim,axis:axes[axis],baseLength:axis===0?x1-x0:y1-y0,stretchFactor:growth[axis],translationFactor:translation,anchor:.5+(axis===0?cx:cy0),uvUnitsPerMeter:1},
        v:{dimension:'depth',axis:'z',baseLength:.001+b,stretchFactor:0,translationFactor:0,anchor:.5,uvUnitsPerMeter:1},
      }}
      data.extraPrimitives.push({data:rims[axis],material:rimMaterial})
    }
    surfaceNode(`${parent.getName()}_${name}`,parent,data,[bay.frontX+cx,cy+cy0,z0],moves,[x1-x0,y1-y0,.001],[...growth,0],material,{decoration:carved?'diagonal-grooves':'decorative-skin',grooveWidth:carved?.0024:0,grooveDepth:carved?.0008:0})
  }
  const yfBottom=fy-1/(2*N)
  patch('Corner_Left',-w/2,-w/2+a,-h/2,-h/2+a,[0,0],motion(bay.xf-bay.wf/2,yfBottom,.5),true)
  patch('Corner_Right',w/2-a,w/2,-h/2,-h/2+a,[0,0],motion(bay.xf+bay.wf/2,yfBottom,.5),true,true)
  patch('Lower_Center',-w/2+a,w/2-a,-h/2,-h/2+a,[bay.wf,0],motion(bay.xf,yfBottom,.5))
  patch('Upper',-w/2,w/2,-h/2+a,h/2,[bay.wf,1/N],motion(bay.xf,fy,.5))
}

function facade(name,parent,bay,y0,y1,yf,kind='plain',heightFactor=1/N) {
  const height=y1-y0,cy=(y0+y1)/2,groupMotion=motion(bay.xf,yf,.5)
  const f=group(name,parent,[bay.frontX,cy,F-t/2],groupMotion,{kind:'facade',nominalThickness:t,style:kind})
  const relief=kind==='fluted'?.002:kind==='carved'?.001:0
  board(name+'_Core',f,[bay.frontW,height,t-relief],[bay.frontX,cy,F-relief-(t-relief)/2],[bay.wf,heightFactor,0],groupMotion,2,'fronts',`Facade_${kind}_${name.startsWith('Door_')?'Door':'Drawer'}`,{frontCore:true})
  if(kind==='fluted')flutes(f,bay,height,cy)
  if(kind==='carved')carvedSkin(f,bay,cy,yf,height)
  facades.push({name,width:bay.frontW,height,nominalThickness:t,style:kind})
  return f
}

for(const bay of bays) {
  const isDoor=K==='nord'?bay.index===0:K==='marvel'?(bay.index===0||bay.index===2):false
  if(isDoor) {
    const side=bay.index===0?'Left':'Right',sgn=side==='Left'?-1:1,hx=sgn<0?bay.frontLeft:bay.frontRight,hxf=sgn<0?bay.lf:bay.rf
    // Pivot on the rear face: the door stays beside the carcass when opened.
    const pivot=group(`Door_${side}_Hinge`,root,[hx,faceBottom,F-t],motion(hxf,0,.5),{kind:'door-pivot',axisPlane:'facade-back',axis:'Y',openAngleDegrees:sgn*105,interactiveAnimation:false})
    const f=facade(`Door_${side}_Front`,pivot,bay,faceBottom,faceTop,.5,K==='marvel'?'fluted':'plain',1)
    const shelfY=(bottomY+t+H-t)/2
    board(`Shelf_${side}`,carcass,[bay.width-.001,t,bodyDepth-backT-.020],[bay.x,shelfY,bodyZ+(backT-.012)/2],[bay.wf,0,1],motion(bay.xf,.5,0),1,'carcass','Shelf')
    for(let i=0;i<2;i++) {
      const y=i===0?faceBottom+.130:faceTop-.130,yfactor=i,name=`Hinge_${side}_${i+1}`
      metal(name+'_Cup',pivot,[.030,.035,.006],[hx-sgn*.036,y,F-t-.003],[0,0,0],motion(hxf,yfactor,.5),{fitting:'hinge-cup'},'box','Mechanism_Steel')
      metal(name+'_Plate',carcass,[.003,.040,.028],[sgn<0?bay.min+.0015:bay.max-.0015,y,bodyFront-.025],[0,0,0],motion(hxf,yfactor,.5),{fitting:'hinge-plate'},'box','Mechanism_Steel')
    }
    makeHandle(`Handle_Door_${side}`,pivot,bay,0,0,K,faceTop)
    doors.push({name:pivot.getName(),front:f.getName(),side,angle:sgn*105});continue
  }
  for(let row=0;row<N;row++) {
    const index=drawers.length+1,prefix=`Drawer_${String(index).padStart(2,'0')}`,y0=faceBottom+row*(rowH+spec.frontGap),y1=y0+rowH,yf=(row+.5)/N
    const dr=group(prefix+'_Assembly',root,[bay.x,y0,0],motion(bay.xf,row/N,0),{kind:'drawer',axis:'+Z',interactiveAnimation:false,column:bay.index,row})
    const f=facade(prefix+'_Front',dr,bay,y0,y1,yf,K==='baikal'&&row===N-1?'carved':'plain')
    // The box ends at the facade rear plane; do not add a floating-front gap.
    const x0=bay.min+.013,x1=bay.max-.013,boxW=x1-x0,rear=bodyBack+backT+.014,front=F-t,dep=front-rear,cz=(front+rear)/2
    const floorY=y0+.020,wallBottom=floorY+.006,wallTop=y1-.022,wallH=wallTop-wallBottom
    board(prefix+'_Bottom',dr,[boxW,.006,dep],[(x0+x1)/2,floorY+.003,cz],[bay.wf,0,1],motion(bay.xf,row/N,0),1,'carcass','DrawerBottom')
    for(const [side,sgn,xf] of [['Left',-1,bay.lf],['Right',1,bay.rf]]) {
      const x=sgn<0?x0+t/2:x1-t/2
      board(prefix+`_Side_${side}`,dr,[t,wallH,dep],[x,(wallBottom+wallTop)/2,cz],[0,1/N,1],motion(xf,yf,0),0,'carcass','DrawerSide')
      metal(prefix+`_Slide_Fixed_${side}`,carcass,[.008,.027,dep-.015],[sgn<0?bay.min+.004:bay.max-.004,floorY+.050,cz],[0,0,1],motion(xf,row/N,0),{fitting:'slide-fixed'},'box','Mechanism_Steel')
      metal(prefix+`_Slide_Moving_${side}`,dr,[.004,.021,dep-.025],[sgn<0?x0-.002:x1+.002,floorY+.050,cz],[0,0,1],motion(xf,row/N,0),{fitting:'slide-moving'},'box','Mechanism_Steel')
    }
    for(const [side,z,zf] of [['Back',rear+t/2,-.5],['Inner_Front',front-t/2,.5]])board(prefix+'_'+side,dr,[boxW-2*t,wallH,t],[(x0+x1)/2,(wallBottom+wallTop)/2,z],[bay.wf,1/N,0],motion(bay.xf,yf,zf),2,'carcass','DrawerWall')
    if((K==='nord'||K==='marvel')&&row<N-1)board(prefix+'_Grip_Recess',carcass,[bay.width-.001,spec.frontGap,.006],[bay.x,y1+spec.frontGap/2,F-t-.007],[bay.wf,0,0],motion(bay.xf,(row+1)/N,.5),2,'carcass','GripRecess')
    if(K==='brooklyn')makeHandle(prefix+'_Handle',dr,bay,y1,(row+1)/N,K)
    if(K==='baikal')makeHandle(prefix+'_Handle',dr,bay,(y0+y1)/2,yf,K)
    drawers.push({name:dr.getName(),front:f.getName(),index:index-1,column:bay.index,row,previewTravel:Math.min(.18,dep*.55),boxWidth:boxW,boxDepth:dep,frontContactGap:0})
  }
}

// Одно локальное правило перемещения на dimension/axis.
const moves=new Map(),finalRules=[]
for(const rule of resizeRules) {
  if(rule.type!=='delta-move'){finalRules.push(rule);continue}
  const key=rule.dimension+rule.axis
  if(!moves.has(key))moves.set(key,{...rule,targets:[]})
  moves.get(key).targets.push(...rule.targets)
}
finalRules.push(...moves.values())
const materialSlots={}
if(spec.hardwareFinish&&materialTargets.hardware.length)materialSlots.hardware={label:'Цвет ручек',targets:materialTargets.hardware,defaultFinish:spec.hardwareFinish,allowedFinishes:['metal-black-matte','metal-white-matte','metal-anthracite']}
const definition={id:spec.id,label:spec.label,modelUrl:`/models/${spec.id}.glb`,dimensions:Object.fromEntries(dimensions.map((key,i)=>[key,{label:['Ширина','Высота','Глубина'][i],base:spec.base[key],min:spec.limits[key][0],max:spec.limits[key][1],step:.001}])),dimensionOrder:dimensions,resizeRules:finalRules,textureAxes:{},materialSlots}
const meta={modelId:spec.id,base:spec.base,constants:{boardThickness:t,backThickness:backT,drawerBottomThickness:.006,bevelRadius:b,faceBottom,faceTop,bodyFront,bodyBack,bodyDepth,rowGap:spec.frontGap,rowHeight:rowH,handleProjection:spec.projection},parts,bays,doors,drawers,facades,decorations,handles,materialTargets,uvContract,legacyTextureAxes:textureAxes,reviewStatus:'geometry supported; full material catalogue and affine UV integration required'}
await fs.mkdir(path.join(projectRoot,'public/models'),{recursive:true})
const glb=externalizeImages(await new NodeIO().writeBinary(doc),externalImageURIs)
await fs.writeFile(path.join(projectRoot,'public/models',spec.id+'.glb'),glb)
await fs.writeFile(path.join(sourceDir,'mesh-source.json'),JSON.stringify(source))
await fs.writeFile(path.join(sourceDir,'model-contract.json'),JSON.stringify(meta,null,2)+'\n')
const configDir=path.join(projectRoot,'src/three/models',spec.folder)
await fs.mkdir(configDir,{recursive:true})
const constant=`DRESSER_${spec.number}_CONFIG`
const ts=`import type { FurnitureDefinition } from '../../furniture/types'\n\n// Model-only geometry review. Полные покрытия и affine UV подключаются централизованно.\nexport const ${constant} = ${JSON.stringify(definition,null,2)} as const satisfies FurnitureDefinition\n\nexport const MATERIAL_TARGETS = ${JSON.stringify(materialTargets,null,2)} as const\n\nexport function createMaterialReviewDefinition(carcassFinish: string, frontsFinish: string, allowedFinishes: readonly string[], hardwareFinish = 'metal-black-matte'): FurnitureDefinition {\n  for (const id of [carcassFinish, frontsFinish]) if (!allowedFinishes.includes(id)) throw new Error('Default finish must be allowed')\n  const hardwareAllowed = ['metal-black-matte','metal-white-matte','metal-anthracite']\n  if (!hardwareAllowed.includes(hardwareFinish)) throw new Error('Unsupported hardware finish')\n  const slots: NonNullable<FurnitureDefinition['materialSlots']> = {\n    carcass: { label:'Корпус и внутренние детали', targets:MATERIAL_TARGETS.carcass, defaultFinish:carcassFinish, allowedFinishes },\n    fronts: { label:'Фасады', targets:MATERIAL_TARGETS.fronts, defaultFinish:frontsFinish, allowedFinishes },\n    ...(MATERIAL_TARGETS.hardware.length ? {hardware:{label:'Ручки',targets:MATERIAL_TARGETS.hardware,defaultFinish:hardwareFinish,allowedFinishes:hardwareAllowed}} : {}),\n  }\n  return {...${constant}, materialSlots:slots}\n}\n`
await fs.writeFile(path.join(configDir,'config.ts'),ts)
const performance={id:spec.id,glbBytes:glb.byteLength,nodes:source.nodes.length,meshes:source.nodes.filter(n=>n.primitives.length).length,primitives:source.nodes.reduce((s,n)=>s+n.primitives.length,0),triangles:source.nodes.flatMap(n=>n.primitives).reduce((s,p)=>s+p.indices.length/3,0),materials:source.materials.length,physicalParts:parts.length,decorativeParts:decorations.length,resizeRules:finalRules.length,woodTexturesEmbedded:false,sharedTextureURIs:Object.values(externalImageURIs)}
await fs.writeFile(path.join(sourceDir,'performance.json'),JSON.stringify(performance,null,2)+'\n')
console.log(JSON.stringify(performance))
