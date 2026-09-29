import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Document, NodeIO, Accessor } from '@gltf-transform/core'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

// Авторинг одной модели. Не добавляет поведение в общий runtime.
const sourceDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(sourceDir, '../../..')
const spec = JSON.parse(await fs.readFile(path.join(sourceDir, 'model-spec.json'), 'utf8'))
const { width: W, height: H, depth: D } = spec.base
const t=spec.boardThickness, b=.0007, backT=spec.backThickness
const frontT=spec.frontThickness, plinth=spec.plinthHeight, gap=spec.facadeGap
const projection=spec.handleProjection, F=D/2-projection
const bodyBack=-D/2+backT, bodyFront=F-frontT-spec.closedCarcassGap
const bodyDepth=bodyFront-bodyBack, bodyZ=(bodyFront+bodyBack)/2
const floorTop=plinth+t, roofBottom=H-t
const axes = ['x','y','z'], dimensions = ['width','height','depth']
const doc = new Document(), buffer = doc.createBuffer(), scene = doc.createScene('FurnitureScene')
doc.getRoot().setDefaultScene(scene)
doc.getRoot().getAsset().generator = 'Furniture wardrobe model authoring / glTF-Transform'
const source = { spec, materials:[], nodes:[] }
const parts = [], resizeRules = [], uvContract = {}, textureAxes = {}, materialTargets = {carcass:[],fronts:[],hardware:[],fixed:[]}
const nodeMeta = new Map(), materials = new Map(), materialCache = new Map()
const tex = {}
for (const [key,file] of Object.entries({color:'neutral-color.png',normal:'normal-gl.png',mr:'metallic-roughness.png'})) {
  tex[key] = doc.createTexture(key).setImage(new Uint8Array(await fs.readFile(path.join(sourceDir,'textures',file)))).setMimeType('image/png')
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

const root=group(`Wardrobe_${spec.number.toString().padStart(2,'0')}_Root`,null,[0,0,0],zeros(),{
  modelId:spec.id,unit:'meter',front:'+Z',floorAnchor:0,heightReadiness:'height-configurable',
  thicknessReadiness:'thickness-fixed',runtimeCompatibility:'supported: segmented resize, affine UV, material slots and door articulations',
})
const carcass=group('Carcass_Assembly',root,[0,0,0])

function newMaterial(name,slot,color,metalness,roughness,textured,extras={}) {
  const c=new THREE.Color(color), colorFactor=[...c.toArray(),1]
  const m=doc.createMaterial(name).setBaseColorFactor(colorFactor).setMetallicFactor(metalness).setRoughnessFactor(roughness).setExtras({materialSlot:slot,...extras})
  if(textured) {
    m.setBaseColorTexture(tex.color).setNormalTexture(tex.normal).setNormalScale(.1).setMetallicRoughnessTexture(tex.mr)
    for(const info of [m.getBaseColorTextureInfo(),m.getNormalTextureInfo(),m.getMetallicRoughnessTextureInfo()])info.setWrapS(10497).setWrapT(10497)
  }
  materials.set(name,m);materialTargets[slot].push(name)
  source.materials.push({name,textured,color:colorFactor,metalness,roughness,normalScale:.1,extras:{materialSlot:slot,...extras}})
  return name
}
newMaterial('Hardware_Metal','hardware',0x111317,.04,.29,false,{previewFinish:'metal-black-matte'})
newMaterial('Mechanism_Steel','fixed',0x969ba1,.75,.32,false,{role:'Internal fittings'})

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
    status:'active FurnitureDefinition.textureTransforms'}
  // Historical mapping retained only as authoring metadata; runtime uses affine bindings.
  textureAxes[name]={}
  for(const [uv,binding] of Object.entries(bindings))if(binding.stretchFactor)textureAxes[name][binding.dimension]=uv==='u'?'x':'y'
  newMaterial(name,slot,spec.boardColor,0,.62,true,{surfacePlane:axes[plane],uvPeriodMeters:1,boardFinishPending:false})
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
  if(shape==='cylinder-x') {g=new THREE.CylinderGeometry(size[1]/2,size[1]/2,size[0],24,1);g.rotateZ(Math.PI/2)}
  else if(shape==='cylinder-z') {g=new THREE.CylinderGeometry(size[0]/2,size[0]/2,size[2],16,1);g.rotateX(Math.PI/2)}
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

// Four equal hanging bays. All dimensions below are closed overall dimensions.
board('Panel_Back',carcass,[W,H,backT],[0,H/2,-D/2+backT/2],[1,1,0],motion(0,.5,-.5),2,'carcass','Back')
board('Panel_Top',carcass,[W,t,bodyDepth],[0,H-t/2,bodyZ],[1,0,1],motion(0,1,0),1,'carcass','Top')
for(const [label,sign] of [['Left',-1],['Right',1]]) {
  board(`Panel_Side_${label}`,carcass,[t,H-t,bodyDepth],[sign*(W/2-t/2),(H-t)/2,bodyZ],[0,1,1],motion(sign*.5,.5,0),0,'carcass','Side')
}
board('Panel_Bottom',carcass,[W-2*t,t,bodyDepth],[0,plinth+t/2,bodyZ],[1,0,1],motion(),1,'carcass','Bottom')
board('Plinth_Front',carcass,[W-2*t,plinth,t],[0,plinth/2,bodyFront-.038-t/2],[1,0,0],motion(0,0,.5),2,'carcass','Plinth')
board('Plinth_Back',carcass,[W-2*t,plinth,t],[0,plinth/2,bodyBack+t/2],[1,0,0],motion(0,0,-.5),2,'carcass','Plinth')
const clearBay=(W-5*t)/4
for(let i=1;i<4;i++) {
  const x=-W/2+t+i*clearBay+(i-.5)*t, xf=-.5+i/4
  board(`Panel_Divider_${i}`,carcass,[t,roofBottom-floorTop,bodyDepth],[x,(roofBottom+floorTop)/2,bodyZ],[0,1,1],motion(xf,.5,0),0,'carcass','Divider')
  board(`Plinth_Brace_${i}`,carcass,[t,plinth,bodyDepth-.054-t],[x,plinth/2,bodyZ-.019],[0,0,1],motion(xf,0,0),0,'carcass','PlinthBrace')
}
const bays=[],shelfY=H-.370
for(let i=0;i<4;i++) {
  const key=String(i+1).padStart(2,'0'), x=-W/2+t+clearBay/2+i*(clearBay+t), xf=-.5+(i+.5)/4
  const innerBack=bodyBack+.012,innerFront=bodyFront-.016, shelfDepth=innerFront-innerBack
  board(`Shelf_Bay_${key}`,carcass,[clearBay-.001,t,shelfDepth],[x,shelfY,(innerBack+innerFront)/2],[.25,0,1],motion(xf,1,0),1,'carcass','UpperShelf',{shelfIndex:i})
  for(const [side,s] of [['Left',-1],['Right',1]])for(const [end,e] of [['Front',1],['Back',-1]]) {
    metal(`Shelf_Pin_${key}_${side}_${end}`,carcass,[.006,.006,.006],[x+s*(clearBay/2-.002),shelfY-t/2-.003,(innerBack+innerFront)/2+e*(shelfDepth/2-.035)],[0,0,0],motion(xf+s*.125,1,e*.5),{fitting:'shelf-pin'},'cylinder-x')
  }
  // A closed end bracket remains useful at all accepted depths. Its extension
  // is not exposed as a drawer articulation; no conditional layout is hidden here.
  const railRear=innerBack+.032,railFront=innerFront-.028,railLength=railFront-railRear, railZ=(railRear+railFront)/2
  const fitting=group(`ClothesRail_EndBracket_${key}`,carcass,[x,shelfY-t/2,railZ],motion(xf,1,0),{kind:'hanging-bracket',layout:'front-to-back',interactiveExtension:false})
  metal(`Bracket_${key}_Track`,fitting,[.034,.014,railLength],[x,shelfY-t/2-.007,railZ],[0,0,1],motion(xf,1,0),{fitting:'bracket-track'})
  metal(`Bracket_${key}_Rod`,fitting,[.014,.014,railLength-.024],[x,shelfY-t/2-.050,railZ],[0,0,1],motion(xf,1,0),{fitting:'clothes-end-rod'},'cylinder-z')
  for(const [end,z,zf] of [['Back',railRear+.013,-.5],['Front',railFront-.013,.5]]) {
    metal(`Bracket_${key}_${end}_Mount`,fitting,[.026,.045,.016],[x,shelfY-t/2-.024,z],[0,0,0],motion(xf,1,zf),{fitting:'bracket-mount'})
  }
  bays.push({index:i+1,center:x,centerFactor:xf,clearWidth:clearBay,widthFactor:.25,shelfY,shelfHeightFactor:1,railLength,layout:'front-to-back end bracket'})
}

// Facade is a watertight extruded machined profile. Flat lands can widen;
// groove mouths, depth and chamfers remain fixed. No overlapping rib solids,
// hidden coplanar backing surface, normal-map trick or model-specific runtime.
const profileUVContract={}, facadeProfiles=[],doors=[]
function quad(data,corners,normal,uvs) {
  const indices=[0,1,2,0,2,3]
  const cross=new THREE.Vector3().subVectors(new THREE.Vector3(...corners[1]),new THREE.Vector3(...corners[0])).cross(new THREE.Vector3().subVectors(new THREE.Vector3(...corners[2]),new THREE.Vector3(...corners[0])))
  if(cross.dot(new THREE.Vector3(...normal))<0)indices.reverse()
  for(const i of indices){data.position.push(...corners[i]);data.normal.push(...normal);data.uv.push(...uvs[i])}
}
const empty=()=>({position:[],normal:[],uv:[]})
function binding(dimension,baseLength,stretchFactor,translationFactor,anchor) {
  return {dimension,baseLength:clean(baseLength),stretchFactor:clean(stretchFactor),translationFactor:clean(translationFactor),anchor:clean(anchor),uvUnitsPerMeter:1}
}
function profileMaterial(key,bindings,role) {
  const name=`Front_Fluted_${key}`
  if(!materials.has(name)) {
    newMaterial(name,'fronts',spec.frontColor,0,.62,true,{role,uvPeriodMeters:1})
    profileUVContract[name]={slot:'fronts',role,bindings,status:'active FurnitureDefinition.textureTransforms'}
  }
  return name
}
function flutedFacade(name,parent,width,height,position,dPos) {
  const owner=group(name,parent,position,dPos,{kind:'board',thickness:frontT,thicknessAxis:'z',bevelRadius:0,profile:'machined-grooves',grooves:spec.grooveCountPerDoor})
  parts.push({name,kind:'board',slot:'fronts',size:[width,height,frontT],position:position.map(clean),sizeFactors:[.25,1,0],positionFactors:dPos,thinAxis:2,bevel:0})
  const N=spec.grooveCountPerDoor, count=N+1, g=spec.grooveWidth,d=spec.grooveDepth,c=spec.grooveChamfer
  const land=(width-N*g)/count, wf=.25/count, zBack=-frontT/2,zFront=frontT/2
  let x=-width/2,arc=0
  const sectors=[]
  for(let i=0;i<count;i++) {
    const points=[[x,zFront],[x+land,zFront]]
    sectors.push({key:`Land_${String(i+1).padStart(2,'0')}`,type:'land',points,cx:x+land/2,width:land,stretch:wf,move:-.125+(i+.5)*wf,arc})
    x+=land;arc+=land
    if(i===N)break
    // Shallow sloped walls with fixed small machined chamfers. X is monotone,
    // which also permits an independent physical-arclength oracle in tests.
    const p=[[x,zFront],[x+c,zFront-c],[x+2*c,zFront-d+c],[x+3*c,zFront-d],[x+g-3*c,zFront-d],[x+g-2*c,zFront-d+c],[x+g-c,zFront-c],[x+g,zFront]]
    sectors.push({key:`Groove_${String(i+1).padStart(2,'0')}`,type:'groove',points:p,cx:x+g/2,width:g,stretch:0,move:-.125+(i+1)*wf,arc})
    for(let j=1;j<p.length;j++)arc+=Math.hypot(p[j][0]-p[j-1][0],p[j][1]-p[j-1][1])
    x+=g
  }
  for(const sector of sectors) {
    const {key,points,cx,stretch,move}=sector
    const front=empty();let along=sector.arc
    for(let i=1;i<points.length;i++) {
      const a=points[i-1],b=points[i],len=Math.hypot(b[0]-a[0],b[1]-a[1])
      const normal=[-(b[1]-a[1])/len,0,(b[0]-a[0])/len]
      const u0=.5-width/2+along,u1=u0+len
      quad(front,[[a[0]-cx,-height/2,a[1]],[b[0]-cx,-height/2,b[1]],[b[0]-cx,height/2,b[1]],[a[0]-cx,height/2,a[1]]],normal,[[u0,.5-height/2],[u1,.5-height/2],[u1,.5+height/2],[u0,.5+height/2]])
      along+=len
    }
    const m=profileMaterial(key+'_Surface',{
      u:binding('width',sector.width,stretch,move,.5-width/2+sector.arc+sector.width/2),
      v:binding('height',height,1,0,.5),
    },'fluted-front')
    const piece=node(`${name}_${key}_Surface`,owner,[cx,0,0],{kind:'profile-segment',role:'fluted-front',sector:sector.type,sectorIndex:key,profileFixed:!stretch},motion(move,0,0),[{g:geometry(front),material:m}])
    if(stretch)resizeRules.push({type:'stretch-segment',target:piece.getName(),dimension:'width',axis:'x',baseLength:clean(sector.width),factor:stretch})
    resizeRules.push({type:'stretch-segment',target:piece.getName(),dimension:'height',axis:'y',baseLength:clean(height),factor:1})
    const contour=[[points[0][0],zBack],[points.at(-1)[0],zBack],...points.toReversed()].map(p=>new THREE.Vector2(p[0]-cx,p[1]))
    const triangles=THREE.ShapeUtils.triangulateShape(contour,[])
    const capMaterial=profileMaterial(key+'_Caps',{
      u:binding('width',sector.width,stretch,move,.5+cx),
      v:binding('depth',frontT,0,0,.5),
    },'fluted-cap')
    for(const [label,sign] of [['Top',1],['Bottom',-1]]) {
      const cap=empty()
      for(const original of triangles) {
        const tri=[...original], corners=tri.map(i=>[contour[i].x,0,contour[i].y])
        const cross=new THREE.Vector3().subVectors(new THREE.Vector3(...corners[1]),new THREE.Vector3(...corners[0])).cross(new THREE.Vector3().subVectors(new THREE.Vector3(...corners[2]),new THREE.Vector3(...corners[0])))
        if(cross.length()<1e-13)continue
        if(cross.y*sign<0)tri.reverse()
        for(const i of tri){cap.position.push(contour[i].x,0,contour[i].y);cap.normal.push(0,sign,0);cap.uv.push(.5+cx+contour[i].x,.5+contour[i].y)}
      }
      const capName=`${name}_${key}_${label}`
      node(capName,owner,[cx,sign*height/2,0],{kind:'profile-segment',role:'fluted-cap',sector:sector.type},motion(move,sign*.5,0),[{g:geometry(cap),material:capMaterial}])
      if(stretch)resizeRules.push({type:'stretch-segment',target:capName,dimension:'width',axis:'x',baseLength:clean(sector.width),factor:stretch})
    }
  }
  const back=empty()
  quad(back,[[-width/2,-height/2,zBack],[width/2,-height/2,zBack],[width/2,height/2,zBack],[-width/2,height/2,zBack]],[0,0,-1],[[.5-width/2,.5-height/2],[.5+width/2,.5-height/2],[.5+width/2,.5+height/2],[.5-width/2,.5+height/2]])
  const backName=name+'_Back',backMaterial=profileMaterial('Back',{u:binding('width',width,.25,0,.5),v:binding('height',height,1,0,.5)},'fluted-back')
  node(backName,owner,[0,0,0],{role:'fluted-back'},zeros(),[{g:geometry(back),material:backMaterial}])
  for(const [dimension,axis,len,factor] of [['width','x',width,.25],['height','y',height,1]])resizeRules.push({type:'stretch-segment',target:backName,dimension,axis,baseLength:clean(len),factor})
  for(const [label,sign] of [['Left',-1],['Right',1]]) {
    const data=empty(),points=[[0,-height/2,zBack],[0,-height/2,zFront],[0,height/2,zFront],[0,height/2,zBack]]
    quad(data,points,[sign,0,0],points.map(p=>[.5+p[2],.5+p[1]]))
    const edgeName=`${name}_${label}_Edge`,mat=profileMaterial('SideEdges',{u:binding('depth',frontT,0,0,.5),v:binding('height',height,1,0,.5)},'fluted-side')
    node(edgeName,owner,[sign*width/2,0,0],{role:'fluted-side'},motion(sign*.125,0,0),[{g:geometry(data),material:mat}])
    resizeRules.push({type:'stretch-segment',target:edgeName,dimension:'height',axis:'y',baseLength:clean(height),factor:1})
  }
  facadeProfiles.push({name,width,height,frontThickness:frontT,grooveCount:N,grooveWidth:g,grooveDepth:d,chamfer:c,landWidth:land,widthFactor:.25,frontArclength:arc})
  return owner
}

for(let i=0;i<4;i++) {
  const key=String(i+1).padStart(2,'0'),sign=i<2?-1:1
  const bottom=plinth-spec.plinthOverlap,top=H-.003
  const left=-W/2+i*W/4+gap/2,right=-W/2+(i+1)*W/4-gap/2
  const x=(left+right)/2,xf=-.5+(i+.5)*.25,hx=sign<0?left:right,hxf=-.5+(i+(sign>0?1:0))*.25
  const pivot=group(`Door_${key}_Hinge`,root,[hx,bottom,F-frontT],motion(hxf,0,.5),{kind:'door-pivot',axis:'Y',openAngleDegrees:sign*105,pivotPlane:'facade-back',interactiveAnimation:true})
  const panelName=`Door_${key}_Panel`
  flutedFacade(panelName,pivot,right-left,top-bottom,[x,(top+bottom)/2,F-frontT/2],motion(xf,.5,.5))
  const handleX=sign<0?right-.024:left+.024,handleXF=-.5+(i+(sign<0?1:0))*.25
  const handleY=bottom+.035+spec.handleLength/2
  const handle=group(`Handle_${key}_Assembly`,pivot,[handleX,handleY,F],motion(handleXF,0,.5),{kind:'handle',fixedLength:spec.handleLength,projection})
  metal(`Handle_${key}_Bar`,handle,[.012,spec.handleLength,.012],[handleX,handleY,F+projection-.006],[0,0,0],motion(handleXF,0,.5),{fitting:'handle-bar'},'box','Hardware_Metal')
  for(const [label,dy] of [['Lower',-spec.handleLength/2+.040],['Upper',spec.handleLength/2-.040]])metal(`Handle_${key}_${label}_Post`,handle,[.012,.020,projection-.006],[handleX,handleY+dy,F+(projection-.006)/2],[0,0,0],motion(handleXF,0,.5),{fitting:'handle-post'},'box','Hardware_Metal')
  for(const [j,y,yf] of [[1,bottom+.160,0],[2,(bottom+top)/2,.5],[3,top-.160,1]]) {
    metal(`Hinge_${key}_${j}_Cup`,pivot,[.026,.034,.006],[hx-sign*.022,y,F-frontT-.003],[0,0,0],motion(hxf,yf,.5),{fitting:'hinge-cup'})
    metal(`Hinge_${key}_${j}_Plate`,carcass,[.004,.038,.032],[hx-sign*.010,y,bodyFront-.018],[0,0,0],motion(hxf,yf,.5),{fitting:'hinge-plate'})
  }
  doors.push({name:pivot.getName(),panel:panelName,index:i+1,sign,angle:sign*105,bottom,hingeX:hx,hingeZ:F-frontT,pivotPlane:'facade-back',closedCarcassGap:spec.closedCarcassGap})
}

const moves=new Map(),finalRules=[]
for(const rule of resizeRules) {
  if(rule.type!=='delta-move'){finalRules.push(rule);continue}
  const key=rule.dimension+rule.axis
  if(!moves.has(key))moves.set(key,{...rule,targets:[]})
  moves.get(key).targets.push(...rule.targets)
}
finalRules.push(...moves.values())
const boardFinishes=['board-graphite-matte','board-white-matte','board-grey-neutral','board-grey-cool','board-cashmere-body','board-cashmere-front','oak-natural','oak-grey','oak-silver','oak-black','board-muted-green','board-powder-beige']
const hardwareFinishes=['metal-black-matte','metal-white-matte','metal-anthracite','metal-brass-satin']
const slots={
  carcass:{label:'Корпус и полки',targets:materialTargets.carcass,defaultFinish:'board-graphite-matte',allowedFinishes:boardFinishes},
  fronts:{label:'Фасады',targets:materialTargets.fronts,defaultFinish:'board-graphite-matte',allowedFinishes:boardFinishes},
  hardware:{label:'Ручки',targets:materialTargets.hardware,defaultFinish:'metal-black-matte',allowedFinishes:hardwareFinishes},
}
const textureTransforms=Object.fromEntries(Object.entries({...uvContract,...profileUVContract}).map(([name,record])=>[name,Object.fromEntries(Object.entries(record.bindings).map(([axis,b])=>[axis,Object.fromEntries(Object.entries(b).filter(([key])=>key!=='axis'))]))]))
const definition={id:spec.id,label:spec.label,modelUrl:`/models/${spec.id}.glb`,category:'wardrobes',description:'Четыре рифлёных фасада, четыре отделения с торцевыми кронштейнами.',framing:{width:spec.limits.width[1],height:spec.limits.height[1],depth:spec.limits.depth[1]},dimensions:Object.fromEntries(dimensions.map((key,i)=>[key,{label:['Ширина','Высота','Глубина'][i],base:spec.base[key],...(spec.defaults?.[key] !== undefined ? {defaultValue:spec.defaults[key]} : {}),min:spec.limits[key][0],max:spec.limits[key][1],step:spec.step,displayUnit:'mm'}])),dimensionOrder:dimensions,resizeRules:finalRules,textureAxes:{},textureTransforms,materialSlots:slots,interiorView:{hiddenNodes:doors.map(d=>d.name)},articulations:doors.map(d=>({id:d.name,label:`Дверь ${d.index}`,target:d.name,kind:'door',angle:d.angle}))}
definition.facades = JSON.parse(await fs.readFile(path.join(sourceDir, 'facade-variants.json'), 'utf8'))
const contract={modelId:spec.id,standard:'v2.7',base:spec.base,constants:{boardThickness:t,frontThickness:frontT,backThickness:backT,plinth,plinthOverlap:spec.plinthOverlap,bevelRadius:b,facadeGap:gap,closedCarcassGap:spec.closedCarcassGap,handleProjection:projection,bodyFront,bodyBack,bodyDepth,faceBottom:plinth-spec.plinthOverlap},parts,bays,doors,drawers:[],facadeProfiles,materialTargets,uvContract,profileUVContract,reviewStatus:'Supported by supplied engine; fixed end-bracket layout; model-only package requires registry entry'}
await fs.mkdir(path.join(projectRoot,'public/models'),{recursive:true})
const glb=await new NodeIO().writeBinary(doc)
await fs.writeFile(path.join(projectRoot,'public/models',spec.id+'.glb'),glb)
await fs.writeFile(path.join(sourceDir,'mesh-source.json'),JSON.stringify(source))
await fs.writeFile(path.join(sourceDir,'model-contract.json'),JSON.stringify(contract,null,2)+'\n')
const configDir=path.join(projectRoot,'src/three/models',spec.folder)
await fs.mkdir(configDir,{recursive:true})
await fs.writeFile(path.join(configDir,'config.ts'),`import type { FurnitureDefinition } from '../../furniture/types'\n\n// Generated by this model's build_model.mjs against standard v2.7.\nexport const WARDROBE_15_CONFIG = ${JSON.stringify(definition,null,2)} as const satisfies FurnitureDefinition\n\nexport const MATERIAL_TARGETS = ${JSON.stringify(materialTargets,null,2)} as const\n`)
slots.hardware.allowedFinishes = [...new Set([...slots.hardware.allowedFinishes, 'metal-brass-satin'])]
const catalogue={...definition,resizeRules:[],textureAxes:{},textureTransforms:undefined,materialSlots:Object.fromEntries(Object.entries(slots).map(([name,s])=>[name,{...s,targets:[]}]))}
await fs.writeFile(path.join(configDir,'catalog.ts'),`import type { FurnitureDefinition } from '../../furniture/types'\nimport { WARDROBE_HANDLES } from '../../../configurator/handles'\n\nexport const catalogue: FurnitureDefinition = {\n  handles: WARDROBE_HANDLES['${spec.id}'],\n  ...${JSON.stringify(catalogue,null,2)},\n  loadRuntime: () => import('./runtime').then(module => module.definition),\n}\n`)
await fs.writeFile(path.join(configDir,'runtime.ts'),`import { WARDROBE_15_CONFIG as source } from './config'\nimport { catalogue } from './catalog'\nexport const definition = { ...source, handles: catalogue.handles, materialSlots: { ...source.materialSlots, hardware: { ...source.materialSlots!.hardware, allowedFinishes: catalogue.materialSlots!.hardware.allowedFinishes } } }\n`)
const performance={id:spec.id,glbBytes:glb.byteLength,nodes:source.nodes.length,meshes:source.nodes.filter(n=>n.primitives.length).length,primitives:source.nodes.reduce((s,n)=>s+n.primitives.length,0),triangles:source.nodes.flatMap(n=>n.primitives).reduce((s,p)=>s+p.indices.length/3,0),materials:source.materials.length,physicalParts:parts.length,groovesPerDoor:spec.grooveCountPerDoor,grooveCount:spec.grooveCountPerDoor*4,resizeRules:finalRules.length,embeddedTextures:'3 neutral 1×1 maps, 207 bytes total; no large PBR images',runtimeCompatibility:'existing geometry, affine UV, material and articulation controllers'}
await fs.writeFile(path.join(sourceDir,'performance.json'),JSON.stringify(performance,null,2)+'\n')
console.log(JSON.stringify(performance))
